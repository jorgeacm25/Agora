import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
  private configService: ConfigService,
  private usersService: UsersService,
) {
  const secret = configService.get<string>('JWT_SECRET');
  if (!secret) {
    throw new Error('JWT_SECRET no está definido en JwtStrategy');
  }
  super({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    ignoreExpiration: false,
    secretOrKey: secret,
  });
}

  async validate(payload: any) {
    const user = await this.usersService.findEntityById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return {
      id: payload.sub,
      username: payload.username,
      permissions: payload.permissions,
    };
  }
}