import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEnterprise } from '../../user-enterprise/entities/user-enterprise.entity';
import { Subscription } from '../../subscription/entities/subscription.entity';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(UserEnterprise)
    private userEnterpriseRepo: Repository<UserEnterprise>,
    @InjectRepository(Subscription)
    private subscriptionRepo: Repository<Subscription>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException('Usuario no autenticado');

    const resource = this.reflector.get<string>('resource', context.getHandler());
    const idParam = this.reflector.get<string>('idParam', context.getHandler()) || 'id';
    const resourceId = request.params[idParam];
    if (!resourceId) throw new NotFoundException('ID del recurso no proporcionado');

    let entity: any;
    switch (resource) {
      case 'user-enterprise':
        entity = await this.userEnterpriseRepo.findOne({
          where: { idUserEnterprise: resourceId },
          relations: { user: true },
        });
        break;
      case 'subscription':
        entity = await this.subscriptionRepo.findOne({
          where: { idSubscription: resourceId },
          relations: { user: true },
        });
        break;
      default:
        throw new ForbiddenException('Recurso no soportado');
    }

    if (!entity) throw new NotFoundException('Recurso no encontrado');
    if (entity.userId !== user.id && entity.user?.id !== user.id) {
      throw new ForbiddenException('No tienes permiso para acceder a este recurso');
    }

    request.entity = entity;
    return true;
  }
}