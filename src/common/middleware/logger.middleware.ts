import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
   private readonly logger = new Logger('ResponseTime');

  use(req: Request, res: Response, next: NextFunction): void {
    const start = Date.now();

    res.on('finish', () => {
      const elapsed = Date.now() - start;
      const method = req.method;
      const url = req.originalUrl;
      const statusCode = res.statusCode;

      const message = `${method} ${url} - ${statusCode} - ${elapsed}ms`;

      if (elapsed >= 500) {
        this.logger.warn(`⚠️  ${message} (lento)`);
      } else {
        this.logger.log(`✅ ${message} (óptimo)`);
      }
    });

    next();
  }
}