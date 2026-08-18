import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { AuthIdentity, AuthProvider } from '../auth/entities/auth-identity.entity';
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
    private userRepository: Repository<User>,
    @InjectRepository(AuthIdentity)
    private authIdentityRepository: Repository<AuthIdentity>,
  ) {}

  // ========== CREAR USUARIO ==========

  async create(createUserDto: CreateUserDto): Promise<Result<void>> {
    try {
      const existing = await this.userRepository.findOne({
        where: { username: createUserDto.username },
      });
      if (existing) {
        return Result.error(new UserAlreadyRegisteredError(createUserDto.username));
      }

      // Crear usuario (sin password)
      const newUser = this.userRepository.create({
        username: createUserDto.username,
        permissions: Permissions.getDefaultUserPermissions(),
      });
      const savedUser = await this.userRepository.save(newUser);

      // Crear identidad de autenticación (solo si se proporciona password)
      if (createUserDto.password) {
        if (createUserDto.password.length < 6) {
          return Result.error(new InvalidPasswordError());
        }
        const identity = new AuthIdentity();
        identity.user = savedUser;
        identity.provider = AuthProvider.PASSWORD;
        identity.passwordHash = await bcrypt.hash(createUserDto.password, 10);
        await this.authIdentityRepository.save(identity);
      }

      // Si no se proporciona password, no se crea identidad (el usuario no podrá loguearse con password)
      // En el futuro, se podría crear una identidad de tipo 'google' u otro.

      return Result.successNoData();
    } catch (error) {
      return Result.error(new BaseError('Error interno al crear usuario', 500));
    }
  }

  // ========== ACTUALIZAR CONTRASEÑA ==========

 async updatePassword(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<Result<void>> {
    try {
      // 1. Verificar que el usuario existe
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        return Result.error(new UserNotFoundError());
      }

      // 2. Buscar identidad de tipo 'password' usando el enum
      const identity = await this.authIdentityRepository.findOne({
        where: {
          userId: userId,
          provider: AuthProvider.PASSWORD, // 👈 Usar el enum, no un string
        },
      });

      // 3. Si no existe identidad con contraseña, error
      if (!identity) {
        return Result.error(
          new BaseError('Este usuario no tiene contraseña configurada', 400),
        );
      }

      // 4. Verificar que la identidad tenga passwordHash (no null)
      if (!identity.passwordHash) {
        return Result.error(
          new BaseError('Este usuario no tiene contraseña configurada', 400),
        );
      }

      // 5. Verificar la contraseña actual (ahora passwordHash es string seguro)
      const isPasswordValid = await bcrypt.compare(
        updatePasswordDto.currentPassword,
        identity.passwordHash, // ✅ Ahora TypeScript sabe que es string
      );
      if (!isPasswordValid) {
        return Result.error(new BaseError('Contraseña actual incorrecta', 401));
      }

      // 6. Hashear la nueva contraseña
      const newHashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, 10);
      identity.passwordHash = newHashedPassword;

      // 7. Guardar la identidad actualizada
      await this.authIdentityRepository.save(identity);

      return Result.successNoData();
    } catch (error) {
      return Result.error(new BaseError('Error al actualizar la contraseña', 500));
    }
  }

  // ========== ELIMINAR USUARIO ==========

  async remove(id: string): Promise<Result<void>> {
    try {
      const result = await this.userRepository.delete(id);
      if (result.affected === 0) {
        return Result.error(new UserNotFoundError());
      }
      return Result.successNoData();
    } catch {
      return Result.error(new BaseError('Error al eliminar usuario', 500));
    }
  }

  // ========== LECTURA ==========

  async findAll(): Promise<Result<UserResponseDto[]>> {
    try {
      const users = await this.userRepository.find();
      const userDtos = users.map((user) =>
        plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true }),
      );
      return Result.success(userDtos);
    } catch {
      return Result.error(new BaseError('Error al obtener usuarios', 500));
    }
  }

  async findOne(id: string): Promise<Result<UserResponseDto>> {
    try {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return Result.error(new UserNotFoundError());
      }
      const userDto = plainToInstance(UserResponseDto, user, { excludeExtraneousValues: true });
      return Result.success(userDto);
    } catch {
      return Result.error(new BaseError('Error al buscar usuario', 500));
    }
  }

  // ========== MÉTODOS PARA AUTENTICACIÓN ==========

  async findEntityByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { username } });
  }

  async findEntityById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { id } });
  }
}