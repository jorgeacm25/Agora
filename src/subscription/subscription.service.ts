import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull, Not } from 'typeorm';
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

  // Watcher que se ejecuta al iniciar y cada 6 horas
  async onModuleInit() {
    await this.checkExpiredSubscriptions();
    setInterval(async () => {
      await this.checkExpiredSubscriptions();
    }, 6 * 60 * 60 * 1000); // 6 horas
  }

  // Watcher: Verifica suscripciones expiradas y actualiza status
  async checkExpiredSubscriptions(): Promise<void> {
    try {
      const now = new Date();
      
      // Buscar suscripciones activas que han expirado
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

      // Verificar suscripciones sin fecha de expiración (por si acaso)
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

  // Verificar una suscripción específica
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
      
      // Si la suscripción está activa y expiró
      if (subscription.status && subscription.expiresAt && subscription.expiresAt < now) {
        subscription.status = false;
        subscription.lastCheckedAt = now;
        await this.subscriptionRepository.save(subscription);
        return Result.success(subscription);
      }

      // Si no tiene expiresAt, calcular
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

async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Result<Subscription>> {
  try {
    // 1. Verificar que el usuario existe
    const user = await this.userRepository.findOne({
      where: { id: createSubscriptionDto.userId },
    });

    if (!user) {
      return Result.error(
        new UserNotFoundForSubscriptionError(createSubscriptionDto.userId),
      );
    }

    // 2. Verificar si tiene UNA O MÁS suscripciones activas (no eliminadas)
    const existingActiveSubscriptions = await this.subscriptionRepository.find({
      where: {
        user: { id: createSubscriptionDto.userId },
        status: true,
        deletedAt: IsNull(),
      },
      relations: { user: true },
    });

    // Si tiene AL MENOS UNA suscripción activa, error
    if (existingActiveSubscriptions.length > 0) {
      return Result.error(
        new SubscriptionAlreadyExistsError(createSubscriptionDto.userId),
      );
    }

    // 3. Crear la nueva suscripción
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
    return Result.error(
      new BaseError('Error interno al crear la suscripción', 500),
    );
  }
}

  // Obtener todas las suscripciones activas (no eliminadas)
  async findAll(): Promise<Result<Subscription[]>> {
    try {
      const subscriptions = await this.subscriptionRepository.find({
        where: { deletedAt: IsNull() },
        relations: { user: true },
        order: { createdAt: 'DESC' },
      });
      return Result.success(subscriptions);
    } catch {
      return Result.error(new BaseError('Error al obtener las suscripciones', 500));
    }
  }

  // Obtener solo suscripciones activas (status: true y no eliminadas)
  async findActive(): Promise<Result<Subscription[]>> {
    try {
      const subscriptions = await this.subscriptionRepository.find({
        where: { 
          status: true,
          deletedAt: IsNull(),
        },
        relations: { user: true },
        order: { createdAt: 'DESC' },
      });
      return Result.success(subscriptions);
    } catch {
      return Result.error(new BaseError('Error al obtener suscripciones activas', 500));
    }
  }

  // Obtener suscripciones inactivas (status: false pero no eliminadas)
  async findInactive(): Promise<Result<Subscription[]>> {
    try {
      const subscriptions = await this.subscriptionRepository.find({
        where: { 
          status: false,
          deletedAt: IsNull(),
        },
        relations: { user: true },
        order: { createdAt: 'DESC' },
      });
      return Result.success(subscriptions);
    } catch {
      return Result.error(new BaseError('Error al obtener suscripciones inactivas', 500));
    }
  }

  // Obtener suscripción por ID (solo si no está eliminada)
  async findOne(id: string): Promise<Result<Subscription>> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { 
          idSubscription: id,
          deletedAt: IsNull(),
        },
        relations: { user: true },
      });

      if (!subscription) {
        return Result.error(new SubscriptionNotFoundError());
      }

      // Verificar si está expirada
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

  // Obtener suscripción por usuario (solo si no está eliminada)
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

  // Actualizar suscripción
  async update(id: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Result<Subscription>> {
    try {
      const subscriptionResult = await this.findOne(id);

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
        // Recalcular fecha de expiración si está activa
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

  // Soft Delete: solo cambia status a false y guarda fecha de eliminación
  async remove(id: string): Promise<Result<void>> {
    try {
      const subscriptionResult = await this.findOne(id);

      if (!subscriptionResult.isSuccess) {
        return Result.error(subscriptionResult.error!);
      }

      const subscription = subscriptionResult.data!;
      
      // Soft delete: cambiar status a false y guardar fecha
      subscription.status = false;
      subscription.deletedAt = new Date();
      
      await this.subscriptionRepository.save(subscription);
      return Result.successNoData();
    } catch (error) {
      return Result.error(new BaseError('Error al eliminar la suscripción', 500));
    }
  }

  // Obtener historial de suscripciones (incluye eliminadas)
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
}