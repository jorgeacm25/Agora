import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserEnterpriseService } from './user-enterprise.service';
import { CreateUserEnterpriseDto } from './dto/create-user-enterprise.dto';
import { UpdateUserEnterpriseDto } from './dto/update-user-enterprise.dto';
import { Result } from '../common/classes/result.class';
import { UserEnterprise } from './entities/user-enterprise.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('user-enterprise')
@ApiBearerAuth()
@Controller('user-enterprise')
@UseGuards(JwtAuthGuard)
export class UserEnterpriseController {
  constructor(private readonly userEnterpriseService: UserEnterpriseService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una empresa para el usuario autenticado' })
  @ApiResponse({ status: 201, description: 'Empresa creada exitosamente' })
  create(
    @Body() createUserEnterpriseDto: CreateUserEnterpriseDto,
    @Req() req: any,
  ): Promise<Result<UserEnterprise>> {
    return this.userEnterpriseService.create(createUserEnterpriseDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener la empresa del usuario autenticado' })
  @ApiResponse({ status: 200, description: 'Empresa obtenida exitosamente' })
  findMyEnterprise(@Req() req: any): Promise<Result<UserEnterprise>> {
    return this.userEnterpriseService.findByUserId(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una empresa por ID (solo si es del usuario)' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para acceder a esta empresa' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  findOne(@Param('id') id: string, @Req() req: any): Promise<Result<UserEnterprise>> {
    return this.userEnterpriseService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar empresa (solo si es del usuario)' })
  @ApiResponse({ status: 200, description: 'Empresa actualizada exitosamente' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para modificar esta empresa' })
  update(
    @Param('id') id: string,
    @Body() updateUserEnterpriseDto: UpdateUserEnterpriseDto,
    @Req() req: any,
  ): Promise<Result<UserEnterprise>> {
    return this.userEnterpriseService.update(id, updateUserEnterpriseDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar empresa (solo si es del usuario)' })
  @ApiResponse({ status: 200, description: 'Empresa eliminada exitosamente' })
  @ApiResponse({ status: 403, description: 'No tienes permiso para eliminar esta empresa' })
  remove(@Param('id') id: string, @Req() req: any): Promise<Result<void>> {
    return this.userEnterpriseService.remove(id, req.user.id);
  }
}