import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
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
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  @Public() // Registro público
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
  updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<Result<void>> {
    return this.userService.updatePassword(id, updatePasswordDto);
  }

  @Delete(':id')
  @RequirePermissions(Permissions.USER_DELETE)
  remove(@Param('id') id: string): Promise<Result<void>> {
    return this.userService.remove(id);
  }
}