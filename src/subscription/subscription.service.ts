import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
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
  private readonly logger = new Logger(SubscriptionService.name);

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
        this.logger.log(`Suscripcion ${subscription.idSubscription} expirada y desactivada`);
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
          this.logger.log(`Suscripcion ${subscription.idSubscription} expirada por tiempo calculado`);
        }
      }
    } catch (error) {
      this.logger.error('Error al verificar suscripciones:', error);
    }
  }

  // ================================================
  // VERIFICACION DE UNA SUSCRIPCION
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
      this.logger.error('Error al verificar suscripcion:', error);
      return Result.error(new BaseError('Error al verificar la suscripcion', 500));
    }
  }

  // ================================================
  // CREAR SUSCRIPCION
  // ================================================
  async create(
    createSubscriptionDto: CreateSubscriptionDto,
    userId: string,
  ): Promise<Result<Subscription>> {
    try {
      this.logger.log('Creando suscripcion para usuario:', userId);

      // 1. Verificar que el usuario existe
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        this.logger.warn('Usuario no encontrado:', userId);
        return Result.error(new UserNotFoundForSubscriptionError(userId));
      }

      // 2. Verificar si tiene suscripcion activa
      const existingSubscription = await this.subscriptionRepository.findOne({
        where: {
          user: { id: userId },
          status: true,
          deletedAt: IsNull(),
        },
      });

      if (existingSubscription) {
        this.logger.warn('Usuario ya tiene suscripcion activa:', userId);
        return Result.error(new SubscriptionAlreadyExistsError(userId));
      }

      // 3. Crear la nueva suscripcion
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
        expiresAt: expiresAt,
        lastCheckedAt: now,
      });

      const saved = await this.subscriptionRepository.save(newSubscription);
      this.logger.log('Suscripcion creada:', saved.idSubscription);
      return Result.success(saved);
    } catch (error) {
      this.logger.error('Error al crear suscripcion:', error);
      return Result.error(new BaseError('Error interno al crear la suscripcion', 500));
    }
  }

  // ================================================
  // OBTENER SUSCRIPCION ACTIVA DEL USUARIO AUTENTICADO
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
    } catch (error) {
      this.logger.error('Error al buscar suscripcion activa:', error);
      return Result.error(new BaseError('Error al buscar la suscripcion activa', 500));
    }
  }

  // ================================================
  // OBTENER SUSCRIPCION POR ID (con verificacion de pertenencia)
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
      if (subscription.user.id !== userId) {
        return Result.error(new BaseError('No tienes permiso para acceder a esta suscripcion', 403));
      }
      if (subscription.status) {
        const checkResult = await this.checkSingleSubscription(id);
        if (checkResult.isSuccess) {
          return checkResult;
        }
      }
      return Result.success(subscription);
    } catch (error) {
      this.logger.error('Error al buscar suscripcion:', error);
      return Result.error(new BaseError('Error al buscar la suscripcion', 500));
    }
  }

  // ================================================
  // OBTENER SUSCRIPCION POR ID DE USUARIO (usado internamente)
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
    } catch (error) {
      this.logger.error('Error al buscar suscripcion por usuario:', error);
      return Result.error(new BaseError('Error al buscar la suscripcion por usuario', 500));
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
    } catch (error) {
      this.logger.error('Error al obtener historial de suscripciones:', error);
      return Result.error(new BaseError('Error al obtener historial de suscripciones', 500));
    }
  }

  // ================================================
  // ACTUALIZAR SUSCRIPCION (con verificacion de pertenencia)
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
      this.logger.error('Error al actualizar suscripcion:', error);
      return Result.error(new BaseError('Error al actualizar la suscripcion', 500));
    }
  }

  // ================================================
  // ELIMINAR SUSCRIPCION (soft delete, con verificacion de pertenencia)
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
      this.logger.error('Error al eliminar suscripcion:', error);
      return Result.error(new BaseError('Error al eliminar la suscripcion', 500));
    }
  }
}