import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { User } from '../user/entities/user.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Result } from '../common/classes/result.class';
import { SubscriptionNotFoundError } from './errors/subscription-not-found.error';
import { SubscriptionAlreadyExistsError } from './errors/subscription-already-exists.error';
import { UserNotFoundForSubscriptionError } from './errors/user-not-found-for-subscription.error';
import { BaseError } from '../common/errors/base.error';

@Injectable()
export class SubscriptionService implements OnModuleInit {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // ================================================
  // WATCHER: Revisa suscripciones expiradas cada 6h
  // ================================================
  async onModuleInit() {
    await this.checkExpiredSubscriptions();
    setInterval(async () => {
      await this.checkExpiredSubscriptions();
    }, 6 * 60 * 60 * 1000);
  }

  async checkExpiredSubscriptions(): Promise<void> {
    try {
      const now = new Date();
      const expiredSubscriptions = await this.subscriptionRepository.find({
        where: {
          status: true,
          deletedAt: IsNull(),
          expiresAt: LessThan(now),
        },
      });
      for (const subscription of expiredSubscriptions) {
        subscription.status = false;
        subscription.lastCheckedAt = now;
        await this.subscriptionRepository.save(subscription);
        console.log(`[Watcher] Suscripción ${subscription.idSubscription} expirada y desactivada`);
      }

      const subscriptionsWithoutExpiry = await this.subscriptionRepository.find({
        where: {
          status: true,
          deletedAt: IsNull(),
          expiresAt: IsNull(),
        },
      });
      for (const subscription of subscriptionsWithoutExpiry) {
        const daysSinceCreation = Math.floor(
          (now.getTime() - subscription.createdAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceCreation >= subscription.durationDays) {
          subscription.status = false;
          subscription.expiresAt = new Date(subscription.createdAt.getTime() + subscription.durationDays * 24 * 60 * 60 * 1000);
          subscription.lastCheckedAt = now;
          await this.subscriptionRepository.save(subscription);
          console.log(`[Watcher] Suscripción ${subscription.idSubscription} expirada por tiempo calculado`);
        }
      }
    } catch (error) {
      console.error('[Watcher] Error al verificar suscripciones:', error);
    }
  }

  // ================================================
  // VERIFICACIÓN DE UNA SUSCRIPCIÓN
  // ================================================
  async checkSingleSubscription(id: string): Promise<Result<Subscription>> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { idSubscription: id, deletedAt: IsNull() },
        relations: { user: true },
      });
      if (!subscription) {
        return Result.error(new SubscriptionNotFoundError());
      }
      const now = new Date();
      if (subscription.status && subscription.expiresAt && subscription.expiresAt < now) {
        subscription.status = false;
        subscription.lastCheckedAt = now;
        await this.subscriptionRepository.save(subscription);
        return Result.success(subscription);
      }
      if (subscription.status && !subscription.expiresAt) {
        const expiresAt = new Date(subscription.createdAt.getTime() + subscription.durationDays * 24 * 60 * 60 * 1000);
        if (expiresAt < now) {
          subscription.status = false;
          subscription.expiresAt = expiresAt;
          subscription.lastCheckedAt = now;
          await this.subscriptionRepository.save(subscription);
        }
      }
      return Result.success(subscription);
    } catch (error) {
      return Result.error(new BaseError('Error al verificar la suscripción', 500));
    }
  }

  // ================================================
  // CREAR SUSCRIPCIÓN
  // ================================================
  async create(createSubscriptionDto: CreateSubscriptionDto, userId: string): Promise<Result<Subscription>> {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return Result.error(new UserNotFoundForSubscriptionError(userId));
      }
      const existingActive = await this.subscriptionRepository.findOne({
        where: {
          user: { id: userId },
          status: true,
          deletedAt: IsNull(),
        },
      });
      if (existingActive) {
        return Result.error(new SubscriptionAlreadyExistsError(userId));
      }
      const now = new Date();
      const expiresAt = new Date(now.getTime() + createSubscriptionDto.durationDays * 24 * 60 * 60 * 1000);
      const newSubscription = this.subscriptionRepository.create({
        user: user,
        name: createSubscriptionDto.name,
        cost: createSubscriptionDto.cost,
        description: createSubscriptionDto.description || '',
        status: true,
        quantityAccounts: createSubscriptionDto.quantityAccounts,
        durationDays: createSubscriptionDto.durationDays,
        createdAt: now,
        expiresAt: expiresAt,
      });
      const saved = await this.subscriptionRepository.save(newSubscription);
      return Result.success(saved);
    } catch (error) {
      return Result.error(new BaseError('Error interno al crear la suscripción', 500));
    }
  }

  // ================================================
  // OBTENER SUSCRIPCIÓN ACTIVA DEL USUARIO AUTENTICADO
  // ================================================
  async findActiveByUserId(userId: string): Promise<Result<Subscription>> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: {
          user: { id: userId },
          status: true,
          deletedAt: IsNull(),
        },
        relations: { user: true },
      });
      if (!subscription) {
        return Result.error(new SubscriptionNotFoundError());
      }
      if (subscription.status) {
        const checkResult = await this.checkSingleSubscription(subscription.idSubscription);
        if (checkResult.isSuccess) {
          return checkResult;
        }
      }
      return Result.success(subscription);
    } catch {
      return Result.error(new BaseError('Error al buscar la suscripción activa', 500));
    }
  }

  // ================================================
  // OBTENER SUSCRIPCIÓN POR ID (con verificación de pertenencia)
  // ================================================
  async findOne(id: string, userId: string): Promise<Result<Subscription>> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { idSubscription: id, deletedAt: IsNull() },
        relations: { user: true },
      });
      if (!subscription) {
        return Result.error(new SubscriptionNotFoundError());
      }
      if (subscription.userId !== userId) {
        return Result.error(new BaseError('No tienes permiso para acceder a esta suscripción', 403));
      }
      if (subscription.status) {
        const checkResult = await this.checkSingleSubscription(id);
        if (checkResult.isSuccess) {
          return checkResult;
        }
      }
      return Result.success(subscription);
    } catch {
      return Result.error(new BaseError('Error al buscar la suscripción', 500));
    }
  }

  // ================================================
  // OBTENER SUSCRIPCIÓN POR ID DE USUARIO (usado internamente)
  // ================================================
  async findByUserId(userId: string): Promise<Result<Subscription>> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: {
          user: { id: userId },
          deletedAt: IsNull(),
        },
        relations: { user: true },
      });
      if (!subscription) {
        return Result.error(new SubscriptionNotFoundError());
      }
      if (subscription.status) {
        const checkResult = await this.checkSingleSubscription(subscription.idSubscription);
        if (checkResult.isSuccess) {
          return checkResult;
        }
      }
      return Result.success(subscription);
    } catch {
      return Result.error(new BaseError('Error al buscar la suscripción por usuario', 500));
    }
  }

  // ================================================
  // HISTORIAL DE SUSCRIPCIONES DEL USUARIO
  // ================================================
  async findHistoryByUserId(userId: string): Promise<Result<Subscription[]>> {
    try {
      const subscriptions = await this.subscriptionRepository.find({
        where: { user: { id: userId } },
        relations: { user: true },
        order: { createdAt: 'DESC' },
      });
      return Result.success(subscriptions);
    } catch {
      return Result.error(new BaseError('Error al obtener historial de suscripciones', 500));
    }
  }

  // ================================================
  // ACTUALIZAR SUSCRIPCIÓN (con verificación de pertenencia)
  // ================================================
  async update(
    id: string,
    updateSubscriptionDto: UpdateSubscriptionDto,
    userId: string,
  ): Promise<Result<Subscription>> {
    try {
      const subscriptionResult = await this.findOne(id, userId);
      if (!subscriptionResult.isSuccess) {
        return Result.error(subscriptionResult.error!);
      }
      const subscription = subscriptionResult.data!;

      if (updateSubscriptionDto.name !== undefined) {
        subscription.name = updateSubscriptionDto.name;
      }
      if (updateSubscriptionDto.cost !== undefined) {
        subscription.cost = updateSubscriptionDto.cost;
      }
      if (updateSubscriptionDto.description !== undefined) {
        subscription.description = updateSubscriptionDto.description;
      }
      if (updateSubscriptionDto.quantityAccounts !== undefined) {
        subscription.quantityAccounts = updateSubscriptionDto.quantityAccounts;
      }
      if (updateSubscriptionDto.durationDays !== undefined) {
        subscription.durationDays = updateSubscriptionDto.durationDays;
        if (subscription.status) {
          subscription.expiresAt = new Date(subscription.createdAt.getTime() + subscription.durationDays * 24 * 60 * 60 * 1000);
        }
      }

      const updated = await this.subscriptionRepository.save(subscription);
      return Result.success(updated);
    } catch (error) {
      return Result.error(new BaseError('Error al actualizar la suscripción', 500));
    }
  }

  // ================================================
  // ELIMINAR SUSCRIPCIÓN (soft delete, con verificación de pertenencia)
  // ================================================
  async remove(id: string, userId: string): Promise<Result<void>> {
    try {
      const subscriptionResult = await this.findOne(id, userId);
      if (!subscriptionResult.isSuccess) {
        return Result.error(subscriptionResult.error!);
      }
      const subscription = subscriptionResult.data!;
      subscription.status = false;
      subscription.deletedAt = new Date();
      await this.subscriptionRepository.save(subscription);
      return Result.successNoData();
    } catch (error) {
      return Result.error(new BaseError('Error al eliminar la suscripción', 500));
    }
  }
}