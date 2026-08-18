import { ConfigService } from '@nestjs/config';

export interface SubdomainConfig {
  appDomain: string;
  appUrl: string;
  adminSubdomain: string;
  adminDomain: string;
  adminUrl: string;
  isProduction: boolean;
}

export function getSubdomainConfig(configService: ConfigService): SubdomainConfig {
  const nodeEnv = configService.get('NODE_ENV', 'development');
  const isProduction = nodeEnv === 'production';
  
  const appDomain = configService.get('APP_DOMAIN', 'localhost:3000');
  const appUrl = configService.get('APP_URL', 'http://localhost:3000');
  const adminSubdomain = configService.get('ADMIN_SUBDOMAIN', 'administration');
  const adminDomain = configService.get('ADMIN_DOMAIN', `administration.${appDomain}`);
  const adminUrl = configService.get('ADMIN_URL', `http://${adminDomain}`);

  return {
    appDomain,
    appUrl,
    adminSubdomain,
    adminDomain,
    adminUrl,
    isProduction,
  };
}