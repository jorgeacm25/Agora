import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Result } from '../common/classes/result.class';
import { Subscription } from './entities/subscription.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una suscripción para un usuario' })
  @ApiResponse({ status: 201, description: 'Suscripción creada exitosamente' })
  create(@Body() createSubscriptionDto: CreateSubscriptionDto): Promise<Result<Subscription>> {
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las suscripciones activas' })
  @ApiResponse({ status: 200, description: 'Lista de suscripciones activas obtenida exitosamente' })
  findAll(): Promise<Result<Subscription[]>> {
    return this.subscriptionService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener solo suscripciones activas (status: true)' })
  @ApiResponse({ status: 200, description: 'Lista de suscripciones activas obtenida exitosamente' })
  findActive(): Promise<Result<Subscription[]>> {
    return this.subscriptionService.findActive();
  }

  @Get('inactive')
  @ApiOperation({ summary: 'Obtener suscripciones inactivas (status: false)' })
  @ApiResponse({ status: 200, description: 'Lista de suscripciones inactivas obtenida exitosamente' })
  findInactive(): Promise<Result<Subscription[]>> {
    return this.subscriptionService.findInactive();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una suscripción por ID' })
  @ApiResponse({ status: 200, description: 'Suscripción encontrada' })
  @ApiResponse({ status: 404, description: 'Suscripción no encontrada' })
  findOne(@Param('id') id: string): Promise<Result<Subscription>> {
    return this.subscriptionService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener suscripción activa por ID de usuario' })
  @ApiResponse({ status: 200, description: 'Suscripción encontrada por usuario' })
  @ApiResponse({ status: 404, description: 'Suscripción no encontrada para este usuario' })
  findByUserId(@Param('userId') userId: string): Promise<Result<Subscription>> {
    return this.subscriptionService.findByUserId(userId);
  }

  @Get('user/:userId/history')
  @ApiOperation({ summary: 'Obtener historial completo de suscripciones por usuario' })
  @ApiResponse({ status: 200, description: 'Historial de suscripciones obtenido exitosamente' })
  findHistoryByUserId(@Param('userId') userId: string): Promise<Result<Subscription[]>> {
    return this.subscriptionService.findHistoryByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una suscripción' })
  @ApiResponse({ status: 200, description: 'Suscripción actualizada exitosamente' })
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ): Promise<Result<Subscription>> {
    return this.subscriptionService.update(id, updateSubscriptionDto);
  }

  @Patch(':id/check')
  @ApiOperation({ summary: 'Verificar estado de una suscripción' })
  @ApiResponse({ status: 200, description: 'Suscripción verificada exitosamente' })
  checkSubscription(@Param('id') id: string): Promise<Result<Subscription>> {
    return this.subscriptionService.checkSingleSubscription(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una suscripción (soft delete - cambia status a false)' })
  @ApiResponse({ status: 200, description: 'Suscripción eliminada exitosamente' })
  remove(@Param('id') id: string): Promise<Result<void>> {
    return this.subscriptionService.remove(id);
  }
}