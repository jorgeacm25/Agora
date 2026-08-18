import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { getSubdomainConfig } from '../../config/subdomain.config';

@Injectable()
export class SubdomainMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SubdomainMiddleware.name);
  private readonly adminSubdomain: string;
  private readonly isProduction: boolean;

  constructor(private configService: ConfigService) {
    const config = getSubdomainConfig(configService);
    this.adminSubdomain = config.adminSubdomain;
    this.isProduction = config.isProduction;
  }

  use(req: Request, res: Response, next: NextFunction) {
    const host = req.get('host') || '';
    const subdomain = host.split('.')[0];
    
    // Determinar si es el subdominio de administración
    const isAdminRequest = subdomain === this.adminSubdomain;
    
    // Agregar información al request
    req['subdomain'] = isAdminRequest ? 'administration' : 'main';
    req['isAdminRequest'] = isAdminRequest;
    req['subdomainConfig'] = {
      subdomain,
      isAdminRequest,
      host,
    };
    
    // Log para debugging
    if (this.isProduction) {
      this.logger.log(` Request desde: ${host} - Subdominio: ${subdomain}`);
    } else {
      this.logger.debug(` Request: ${req.method} ${req.url} - Host: ${host}`);
    }
    
    // Si es una petición al subdominio de admin, validar autenticación aquí
    if (isAdminRequest) {
      // Puedes agregar validaciones adicionales para el subdominio admin
      // Por ejemplo, verificar si el usuario tiene permisos de admin
      this.logger.debug(` Acceso al panel de administración desde: ${host}`);
    }
    
    next();
  }
}