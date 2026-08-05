import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Result } from '../common/classes/result.class';
import * as bcrypt from 'bcrypt';
import { Permissions } from '../common/permissions/permissions';
import { BaseError } from '../common/errors/base.error';
import { UserAlreadyRegisteredError } from './errors/user-already-registered.error';
import { UserNotFoundError } from './errors/user-not-found.error';
import { InvalidPasswordError } from './errors/invalid-password.error';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  // ========== OPERACIONES DE ESCRITURA (usan la entidad) ==========

  async create(createUserDto: CreateUserDto): Promise<Result<void>> {
    try {
      const existing = await this.usersRepository.findOne({
        where: { username: createUserDto.username },
      });
      if (existing) {
        return Result.error(new UserAlreadyRegisteredError(createUserDto.username));
      }

      const newUser = this.usersRepository.create({
        ...createUserDto,
        permissions: Permissions.getDefaultUserPermissions(),
      });

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

  async updatePassword(id: string, dto: UpdatePasswordDto): Promise<Result<void>> {
    try {
      // 1. Obtener la entidad (NO el DTO)
      const userEntity = await this.usersRepository.findOne({ where: { id } });
      if (!userEntity) {
        return Result.error(new UserNotFoundError());
      }

      // 2. Modificar la entidad
      if (dto.password !== undefined) {
        if (dto.password === null) {
          userEntity.password = null;
        } else {
          if (dto.password.length < 6) {
            return Result.error(new InvalidPasswordError());
          }
          userEntity.password = await bcrypt.hash(dto.password, 10);
        }
      }

      // 3. Guardar
      await this.usersRepository.save(userEntity);
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

  // ========== OPERACIONES DE LECTURA (devuelven DTO) ==========

  async findAll(): Promise<Result<UserResponseDto[]>> {
    try {
      const users = await this.usersRepository.find();
      const userDtos = users.map(user =>
        plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true })
      );
      return Result.success(userDtos);
    } catch {
      return Result.error(new BaseError('Error al obtener usuarios', 500));
    }
  }
  async findEntityByUsername(username: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { username } });
  }
  async findEntityById(id: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { id } });
  }
  async findOne(id: string): Promise<Result<UserResponseDto>> {
    try {
      const user = await this.usersRepository.findOne({ where: { id } });
      if (!user) {
        return Result.error(new UserNotFoundError());
      }
      const userDto = plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
      return Result.success(userDto);
    } catch {
      return Result.error(new BaseError('Error al buscar usuario', 500));
    }
  }
}