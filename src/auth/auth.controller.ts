import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { Public } from './decorators/public.decorator';
import { Result } from 'src/common/classes/result.class';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() loginDto: LoginDto): Promise<Result<LoginResponseDto>> {
    return this.authService.login(loginDto);
  }
}