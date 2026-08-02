import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Result } from '../classes/result.class';

@Injectable()
export class CqrsResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((value) => {
        // Si el controlador devuelve un Result, lo procesamos
        if (value instanceof Result) {
          const result = value as Result<any>;

          // --- CASO ERROR ---
          if (!result.isSuccess) {
            response.status(result.error!.code);
            return { message: result.error!.message };
          }

          // --- CASO ÉXITO ---
          // Lectura (GET): devolver el dato directamente, sin wrapper
          if (method === 'GET') {
            response.status(HttpStatus.OK);
            return result.data; // 👈 Directamente el objeto o array
          }

          // Escritura (POST, PATCH, DELETE): solo status 200, sin cuerpo
          response.status(HttpStatus.OK);
          return null; // Sin cuerpo
        }

        // Si no es Result, lo dejamos pasar
        return value;
      }),
    );
  }
}