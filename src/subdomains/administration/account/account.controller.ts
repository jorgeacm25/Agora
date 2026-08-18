// src/subdomains/administration/account/account.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import { Result } from '../../../common/classes/result.class';
import { AdminSubdomainGuard } from '../../../common/guards/admin-subdomain.guard';

// ✅ Cambiar la ruta para que incluya 'administration'
@ApiTags('accounts')
@Controller('administration/accounts') // ✅ RUTA CORRECTA
@UseGuards(AdminSubdomainGuard) // ✅ Proteger con el guard de subdominio
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva cuenta' })
  @ApiResponse({ status: 201, description: 'Cuenta creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'El usuario ya tiene una cuenta o el numero de cuenta ya existe' })
  create(@Body() createAccountDto: CreateAccountDto): Promise<Result<Account>> {
    return this.accountService.create(createAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las cuentas activas' })
  @ApiResponse({ status: 200, description: 'Lista de cuentas obtenida exitosamente' })
  @ApiQuery({ name: 'includeDeleted', required: false, type: Boolean, description: 'Incluir cuentas eliminadas' })
  findAll(@Query('includeDeleted') includeDeleted?: string): Promise<Result<Account[]>> {
    return this.accountService.findAll(includeDeleted === 'true');
  }

  @Get('active')
  @ApiOperation({ summary: 'Obtener solo cuentas activas (status: true)' })
  @ApiResponse({ status: 200, description: 'Lista de cuentas activas obtenida exitosamente' })
  findActive(): Promise<Result<Account[]>> {
    return this.accountService.findActive();
  }

  @Get('by-account-number/:accountNumber')
  @ApiOperation({ summary: 'Obtener cuenta por numero de cuenta' })
  @ApiResponse({ status: 200, description: 'Cuenta encontrada' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  findByAccountNumber(@Param('accountNumber') accountNumber: string): Promise<Result<Account>> {
    return this.accountService.findByAccountNumber(accountNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una cuenta por ID' })
  @ApiResponse({ status: 200, description: 'Cuenta encontrada' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  findOne(@Param('id') id: string): Promise<Result<Account>> {
    return this.accountService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Obtener cuenta por ID de usuario' })
  @ApiResponse({ status: 200, description: 'Cuenta encontrada por usuario' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada para este usuario' })
  findByUserId(@Param('userId') userId: string): Promise<Result<Account>> {
    return this.accountService.findByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una cuenta' })
  @ApiResponse({ status: 200, description: 'Cuenta actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
  ): Promise<Result<Account>> {
    return this.accountService.update(id, updateAccountDto);
  }

  @Patch(':id/balance')
  @ApiOperation({ summary: 'Actualizar el saldo de una cuenta' })
  @ApiResponse({ status: 200, description: 'Saldo actualizado exitosamente' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  updateBalance(
    @Param('id') id: string,
    @Body('amount') amount: number,
  ): Promise<Result<Account>> {
    return this.accountService.updateBalance(id, amount);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una cuenta (soft delete)' })
  @ApiResponse({ status: 200, description: 'Cuenta eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  remove(@Param('id') id: string): Promise<Result<void>> {
    return this.accountService.remove(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar una cuenta eliminada' })
  @ApiResponse({ status: 200, description: 'Cuenta restaurada exitosamente' })
  @ApiResponse({ status: 404, description: 'Cuenta no encontrada' })
  restore(@Param('id') id: string): Promise<Result<Account>> {
    return this.accountService.restore(id);
  }
}