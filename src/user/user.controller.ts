import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Result } from '../common/classes/result.class';
import { User } from './entities/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<Result<void>> {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(): Promise<Result<User[]>> {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Result<User>> {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<Result<void>> {
    return this.userService.updatePassword(id, updatePasswordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Result<void>> {
    return this.userService.remove(id);
  }
}