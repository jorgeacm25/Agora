import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Result } from '../common/classes/result.class';
import { Subscription } from './entities/subscription.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('subscription')
@ApiBearerAuth()
@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

    @Post()
  create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Req() req: any,
  ): Promise<Result<Subscription>> {
    const userId = req.user.id;
    return this.subscriptionService.create(createSubscriptionDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener la suscripción activa del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Suscripción obtenida exitosamente' })
  @ApiResponse({ status: 404, description: 'No tiene suscripción activa' })
  findMyActiveSubscription(@Req() req: any): Promise<Result<Subscription>> {
    return this.subscriptionService.findActiveByUserId(req.user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Obtener historial de suscripciones del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Historial obtenido exitosamente' })
  findMyHistory(@Req() req: any): Promise<Result<Subscription[]>> {
    return this.subscriptionService.findHistoryByUserId(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una suscripción por ID (solo si es del usuario)' })
  @ApiResponse({ status: 200, description: 'Suscripción encontrada' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para acceder a esta suscripción' })
  @ApiResponse({ status: 404, description: 'Suscripción no encontrada' })
  findOne(@Param('id') id: string, @Req() req: any): Promise<Result<Subscription>> {
    return this.subscriptionService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar suscripción (solo si es del usuario)' })
  @ApiResponse({ status: 200, description: 'Suscripción actualizada exitosamente' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para modificar esta suscripción' })
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
    @Req() req: any,
  ): Promise<Result<Subscription>> {
    return this.subscriptionService.update(id, updateSubscriptionDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar suscripción (solo si es del usuario)' })
  @ApiResponse({ status: 200, description: 'Suscripción eliminada exitosamente' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para eliminar esta suscripción' })
  remove(@Param('id') id: string, @Req() req: any): Promise<Result<void>> {
    return this.subscriptionService.remove(id, req.user.id);
  }

  @Patch(':id/check')
  @ApiOperation({ summary: 'Verificar estado de una suscripción (solo si es del usuario)' })
  @ApiResponse({ status: 200, description: 'Suscripción verificada exitosamente' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para verificar esta suscripción' })
  checkSubscription(@Param('id') id: string, @Req() req: any): Promise<Result<Subscription>> {
    // Primero verificamos pertenencia
    return this.subscriptionService.findOne(id, req.user.id).then(result => {
      if (!result.isSuccess) {
        return result;
      }
      // Luego ejecutamos el check
      return this.subscriptionService.checkSingleSubscription(id);
    });
  }
}