import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import * as bcrypt from 'bcrypt';
import { Result } from 'src/common/classes/result.class';
import { BaseError } from 'src/common/errors/base.error';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async login(loginDto: LoginDto): Promise<Result<LoginResponseDto>> {
        try {
            const user = await this.usersService.findEntityByUsername(loginDto.username);
            if (!user) {
                return Result.error(new BaseError('Credenciales inválidas', 401));
            }

            // Caso 1: Usuario con contraseña (local)
            if (user.password) {
                if (!loginDto.password) {
                    return Result.error(new BaseError('Credenciales inválidas', 401));
                }
                const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
                if (!isPasswordValid) {
                    return Result.error(new BaseError('Credenciales inválidas', 401));
                }
            }
            // Caso 2: Usuario sin contraseña (Google)
            else {
                // Solo permitir login si el password enviado es null
                if (loginDto.password !== null) {
                    return Result.error(new BaseError('Credenciales inválidas', 401));
                }
            }

            // Generar token
            const payload = {
                sub: user.id,
                username: user.username,
                permissions: user.permissions,
            };

            const accessToken = this.jwtService.sign(payload);
            const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '24h');

            return Result.success({ accessToken, expiresIn });
        } catch (error) {
            return Result.error(new BaseError('Error interno al iniciar sesión', 500));
        }
    }
}