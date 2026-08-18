// src/subdomain-routing.module.ts
import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { AdministrationModule } from './subdomains/administration/administration.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'administration', 
        module: AdministrationModule,
      },
    ]),
  ],
  exports: [RouterModule], 
})
export class SubdomainRoutingModule {}