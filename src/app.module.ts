import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsResponseInterceptor } from './common/interceptors/result.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'delivery_db'),
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: false,
        logging: true,
      }),
    }),
    UserModule
  ],
   providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CqrsResponseInterceptor,
    },
  ],
})
export class AppModule {}
