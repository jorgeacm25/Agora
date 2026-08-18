import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permissions } from '../common/permissions/permissions';
import { Result } from '../common/classes/result.class';
import { Rating } from './entities/rating.entity';

@ApiTags('ratings')
@ApiBearerAuth('access-token')
@Controller('ratings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post()
  @RequirePermissions(Permissions.RATING_CREATE)
  @ApiOperation({ summary: 'Crear una calificación' })
  @ApiResponse({ status: 201, description: 'Calificación creada' })
  create(@Body() createRatingDto: CreateRatingDto): Promise<Result<Rating>> {
    return this.ratingService.create(createRatingDto);
  }

  @Get()
  @RequirePermissions(Permissions.RATING_VIEW)
  @ApiOperation({ summary: 'Obtener todas las calificaciones' })
  findAll(): Promise<Result<Rating[]>> {
    return this.ratingService.findAll();
  }

  @Get('product/:productId')
  @RequirePermissions(Permissions.RATING_VIEW)
  @ApiOperation({ summary: 'Obtener calificaciones de un producto' })
  findByProduct(@Param('productId') productId: string): Promise<Result<Rating[]>> {
    return this.ratingService.findByProduct(productId);
  }

  @Get('service/:serviceId')
  @RequirePermissions(Permissions.RATING_VIEW)
  @ApiOperation({ summary: 'Obtener calificaciones de un servicio' })
  findByService(@Param('serviceId') serviceId: string): Promise<Result<Rating[]>> {
    return this.ratingService.findByService(serviceId);
  }

  @Get(':id')
  @RequirePermissions(Permissions.RATING_VIEW)
  @ApiOperation({ summary: 'Obtener una calificación por ID' })
  findOne(@Param('id') id: string): Promise<Result<Rating>> {
    return this.ratingService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(Permissions.RATING_UPDATE)
  @ApiOperation({ summary: 'Actualizar una calificación (solo quantity)' })
  update(
    @Param('id') id: string,
    @Body() updateRatingDto: UpdateRatingDto,
  ): Promise<Result<Rating>> {
    return this.ratingService.update(id, updateRatingDto);
  }

  @Delete(':id')
  @RequirePermissions(Permissions.RATING_DELETE)
  @ApiOperation({ summary: 'Eliminar una calificación' })
  remove(@Param('id') id: string): Promise<Result<void>> {
    return this.ratingService.remove(id);
  }
}