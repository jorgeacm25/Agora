// src/app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsResponseInterceptor } from './common/interceptors/result.interceptor';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { SubdomainMiddleware } from './common/middleware/subdomain.middleware';
import { SubdomainService } from './common/services/subdomain.service';

// Módulos principales
import { UserModule } from './user/user.module';
import { UserEnterpriseModule } from './user-enterprise/user-enterprise.module';
import { AuthModule } from './auth/auth.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ProductModule } from './product/product.module';
import { ServiceModule } from './services/service.module';
import { RatingModule } from './rating/rating.module';

// Módulo de administración
import { AdministrationModule } from './subdomains/administration/administration.module';
import { SubdomainRoutingModule } from './subdomain-routing.module';

@Module({
  imports: [
    // 1. Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // 2. Base de datos
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
        logging: false,
      }),
    }),
    
    // 3. Módulos principales (sin subdominio) - IMPORTANTE: van ANTES
    UserModule,
    UserEnterpriseModule,
    AuthModule,
    SubscriptionModule,
    ProductModule,
    ServiceModule,
    
    // 4. Módulo de administración - DESPUÉS de los módulos principales
    AdministrationModule,
    
    // 5. Routing de subdominios - AL FINAL
    SubdomainRoutingModule,
    RatingModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CqrsResponseInterceptor,
    },
    SubdomainService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, SubdomainMiddleware)
      .forRoutes('*');
  }
}