import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express'; 
import { AdminSubdomainGuard } from '../../common/guards/admin-subdomain.guard';

@Controller('administration')
@UseGuards(AdminSubdomainGuard)
export class AdministrationController {
  
  @Get()
  getAdminInfo(@Req() req: Request) {
    return {
      message: 'Bienvenido al panel de administración',
      subdomain: req['subdomain'],
      isAdminRequest: req['isAdminRequest'],
      host: req.get('host'),
      subdomainConfig: req['subdomainConfig'],
      timestamp: new Date().toISOString(),
    };
  }

  @Get('dashboard')
  getDashboard() {
    return {
      stats: {
        users: 150,
        orders: 45,
        revenue: '$12,500',
      },
      message: 'Dashboard de administración',
    };
  }

  @Get('users')
  getUsers() {
    return {
      users: [
        { id: 1, name: 'Usuario 1', email: 'user1@example.com' },
        { id: 2, name: 'Usuario 2', email: 'user2@example.com' },
      ],
    };
  }
}