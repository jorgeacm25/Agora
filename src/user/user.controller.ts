import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permissions } from '../common/permissions/permissions';
import { Result } from '../common/classes/result.class';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('user')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @Public()
  create(@Body() createUserDto: CreateUserDto): Promise<Result<void>> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @RequirePermissions(Permissions.USER_VIEW)
  findAll(): Promise<Result<UserResponseDto[]>> {
    return this.userService.findAll();
  }

  @Get(':id')
  @RequirePermissions(Permissions.USER_VIEW)
  findOne(@Param('id') id: string): Promise<Result<UserResponseDto>> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions(Permissions.USER_UPDATE_PASSWORD)
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @Req() req: any,
  ): Promise<Result<void>> {
    // ✅ Verificar pertenencia
    if (id !== req.user.id) {
      throw new ForbiddenException('No puedes modificar la contraseña de otro usuario');
    }
    return this.userService.updatePassword(id, updatePasswordDto);
  }

  @Delete(':id')
  @RequirePermissions(Permissions.USER_DELETE)
  async remove(@Param('id') id: string, @Req() req: any): Promise<Result<void>> {
    // ✅ Verificar pertenencia
    if (id !== req.user.id) {
      throw new ForbiddenException('No puedes eliminar la cuenta de otro usuario');
    }
    return this.userService.remove(id);
  }
}