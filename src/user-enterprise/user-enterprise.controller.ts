import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserEnterpriseService } from './user-enterprise.service';
import { CreateUserEnterpriseDto } from './dto/create-user-enterprise.dto';
import { UpdateUserEnterpriseDto } from './dto/update-user-enterprise.dto';
import { Result } from '../common/classes/result.class';
import { UserEnterprise } from './entities/user-enterprise.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('user-enterprise')
@Controller('user-enterprise')
export class UserEnterpriseController {
  constructor(private readonly userEnterpriseService: UserEnterpriseService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una empresa para un usuario' })
  @ApiResponse({ status: 201, description: 'Empresa creada exitosamente' })
  create(@Body() createUserEnterpriseDto: CreateUserEnterpriseDto): Promise<Result<UserEnterprise>> {
    return this.userEnterpriseService.create(createUserEnterpriseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las empresas de usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de empresas obtenida exitosamente' })
  findAll(): Promise<Result<UserEnterprise[]>> {
    return this.userEnterpriseService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una empresa por ID' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada' })
  @ApiResponse({ status: 404, description: 'Empresa no encontrada' })
  findOne(@Param('id') id: string): Promise<Result<UserEnterprise>> {
    return this.userEnterpriseService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener empresa por ID de usuario' })
  @ApiResponse({ status: 200, description: 'Empresa encontrada por usuario' })
  findByUserId(@Param('userId') userId: string): Promise<Result<UserEnterprise>> {
    return this.userEnterpriseService.findByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una empresa' })
  @ApiResponse({ status: 200, description: 'Empresa actualizada exitosamente' })
  update(
    @Param('id') id: string,
    @Body() updateUserEnterpriseDto: UpdateUserEnterpriseDto,
  ): Promise<Result<UserEnterprise>> {
    return this.userEnterpriseService.update(id, updateUserEnterpriseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una empresa' })
  @ApiResponse({ status: 200, description: 'Empresa eliminada exitosamente' })
  remove(@Param('id') id: string): Promise<Result<void>> {
    return this.userEnterpriseService.remove(id);
  }
}