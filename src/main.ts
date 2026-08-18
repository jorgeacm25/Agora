// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getSubdomainConfig } from './config/subdomain.config';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  const subdomainConfig = getSubdomainConfig(configService);
  const { appUrl, adminUrl, isProduction } = subdomainConfig;
  
  app.setGlobalPrefix('api');
  
  const allowedOrigins = [
    appUrl,
    adminUrl,
    'http://localhost:3000',
    'http://localhost:4200',
    'http://localhost:5173',
    'http://localhost:8080',
  ];
  
  const productionOrigins = [
    /\.tudominio\.com$/,
    /\.railway\.app$/,
    /\.vercel\.app$/,
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      
      const isAllowed = allowedOrigins.some(allowed => origin === allowed);
      const matchesRegex = productionOrigins.some(pattern => pattern.test(origin));
      
      if (isAllowed || matchesRegex || !isProduction) {
        callback(null, true);
      } else {
        callback(new Error(`Origen no permitido por CORS: ${origin}`), false);
      }
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  });
  
  const config = new DocumentBuilder()
    .setTitle('API 1Norte Delivery')
    .setDescription('Documentación de la API para la plataforma de delivery')
    .setVersion('1.0')
    .addTag('auth', 'Autenticación')
    .addTag('users', 'Usuarios')
    .addTag('products', 'Productos')
    .addTag('services', 'Servicios')
    .addTag('accounts', 'Cuentas')
    .addTag('subscriptions', 'Suscripciones')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Ingresa tu token JWT',
        in: 'header',
      },
      'access-token', 
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, 
      docExpansion: 'none', 
      filter: true, 
      showRequestDuration: true, 
    },
    customCss: '.swagger-ui .topbar { display: none }', 
    customSiteTitle: 'API 1Norte Delivery - Documentación',
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port, '0.0.0.0');
  
  const logger = new Logger('Bootstrap');
  logger.log(`🚀 Aplicación corriendo en: ${appUrl}`);
  logger.log(`📊 Administración disponible en: ${adminUrl}`);
  logger.log(`📚 Documentación Swagger: ${appUrl}/api/docs`);
  logger.log(`🌍 Entorno: ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
}
bootstrap();