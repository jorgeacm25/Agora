import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Result } from '../common/classes/result.class';
import * as bcrypt from 'bcrypt';
import { UserAlreadyRegisteredError } from './errors/user-already-registered.error';
import { UserNotFoundError } from './errors/user-not-found.error';
import { InvalidPasswordError } from './errors/invalid-password.error';
import { BaseError } from 'src/common/errors/base.error';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Result<void>> {
    try {
      const existing = await this.usersRepository.findOne({
        where: { username: createUserDto.username },
      });
      if (existing) {
        return Result.error(new UserAlreadyRegisteredError(createUserDto.username));
      }

      const newUser = this.usersRepository.create(createUserDto);
      if (createUserDto.password) {
        if (createUserDto.password.length < 6) {
          return Result.error(new InvalidPasswordError());
        }
        newUser.password = await bcrypt.hash(createUserDto.password, 10);
      }
      await this.usersRepository.save(newUser);
      return Result.successNoData();
    } catch (error) {
      return Result.error(new BaseError('Error interno al crear usuario', 500));
    }
  }
  async findAll(): Promise<Result<User[]>> {
  try {
    const users = await this.usersRepository.find();
    return Result.success(users);
  } catch {
    return Result.error(new BaseError('Error al obtener usuarios', 500));
  }
}
  async findOne(id: string): Promise<Result<User>> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        return Result.error(new UserNotFoundError());
      }
      return Result.success(user);
    } catch {
      return Result.error(new BaseError('Error al buscar usuario', 500));
    }
  }

  async updatePassword(id: string, dto: UpdatePasswordDto): Promise<Result<void>> {
    try {
      const userResult = await this.findOne(id);
      if (!userResult.isSuccess) {
        // El error ya es un BaseError, lo pasamos directamente
        return Result.error(userResult.error!);
      }
      const user = userResult.data!;

      if (dto.password !== undefined) {
        if (dto.password !== null && dto.password.length < 6) {
          return Result.error(new InvalidPasswordError());
        }
        user.password = dto.password ? await bcrypt.hash(dto.password, 10) : null;
      }

      await this.usersRepository.save(user);
      return Result.successNoData();
    } catch {
      return Result.error(new BaseError('Error al actualizar contraseña', 500));
    }
  }

  async remove(id: string): Promise<Result<void>> {
    try {
      const result = await this.usersRepository.delete(id);
      if (result.affected === 0) {
        return Result.error(new UserNotFoundError());
      }
      return Result.successNoData();
    } catch {
      return Result.error(new BaseError('Error al eliminar usuario', 500));
    }
  }
}