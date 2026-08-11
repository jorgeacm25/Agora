import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import * as bcrypt from 'bcrypt';
import { Result } from '../common/classes/result.class';
import { BaseError } from '../common/errors/base.error';
import { AuthIdentity, AuthProvider } from './entities/auth-identity.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(AuthIdentity)
    private authIdentityRepository: Repository<AuthIdentity>,
  ) {}

  async login(loginDto: LoginDto): Promise<Result<LoginResponseDto>> {
    try {
      // Buscar usuario por username
      const user = await this.usersService.findEntityByUsername(loginDto.username);
      if (!user) {
        return Result.error(new BaseError('Credenciales inválidas', 401));
      }

      // Buscar identidad de tipo 'password'
      const identity = await this.authIdentityRepository.findOne({
        where: { userId: user.id, provider: AuthProvider.PASSWORD },
      });

      if (!identity) {
        return Result.error(new BaseError('Credenciales inválidas', 401));
      }

      if (!identity.passwordHash) {
        return Result.error(new BaseError('Credenciales inválidas', 401));
      }

      if (!loginDto.password) {
        return Result.error(new BaseError('Credenciales inválidas', 401));
      }

      const isPasswordValid = await bcrypt.compare(loginDto.password, identity.passwordHash);
      if (!isPasswordValid) {
        return Result.error(new BaseError('Credenciales inválidas', 401));
      }

      // Generar token
      const payload = {
        sub: user.id,
        username: user.username,
        permissions: user.permissions,
      };
      const accessToken = this.jwtService.sign(payload);
      const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '24h');

      return Result.success({
        accessToken,
        expiresIn,
        user: { id: user.id, username: user.username, permissions: user.permissions },
      });
    } catch (error) {
      return Result.error(new BaseError('Error interno al iniciar sesión', 500));
    }
  }
}