import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminSubdomainGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const isAdminRequest = request['isAdminRequest'];
    const subdomain = request['subdomain'];
    
    if (!isAdminRequest) {
      throw new ForbiddenException('Esta ruta solo está disponible en el subdominio de administración');
    }
    
    return true;
  }
}