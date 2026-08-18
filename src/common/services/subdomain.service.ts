import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getSubdomainConfig, SubdomainConfig } from '../../config/subdomain.config';

@Injectable()
export class SubdomainService {
  private config: SubdomainConfig;

  constructor(private configService: ConfigService) {
    this.config = getSubdomainConfig(configService);
  }

  getConfig(): SubdomainConfig {
    return this.config;
  }

  getAdminUrl(): string {
    return this.config.adminUrl;
  }

  getAppUrl(): string {
    return this.config.appUrl;
  }

  isAdminSubdomain(host: string): boolean {
    const subdomain = host.split('.')[0];
    return subdomain === this.config.adminSubdomain;
  }

  generateAdminLink(path: string = ''): string {
    return `${this.config.adminUrl}${path}`;
  }
}