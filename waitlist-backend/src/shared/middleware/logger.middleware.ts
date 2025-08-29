import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = process.hrtime.bigint();

    res.on('finish', () => {
      const { statusCode } = res;
      const endTime = process.hrtime.bigint();
      const responseTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds

      // Create structured log message with more context
      const logContext = {
        method,
        url: originalUrl,
        statusCode,
        responseTime: `${responseTime.toFixed(2)}ms`,
        ip,
        userAgent,
      };

      const message = `${method} ${originalUrl} ${statusCode} ${logContext.responseTime}`;

      if (statusCode >= 500) {
        this.logger.error(message, JSON.stringify(logContext));
      } else if (statusCode >= 400) {
        this.logger.warn(message, JSON.stringify(logContext));
      } else {
        this.logger.log(message, JSON.stringify(logContext));
      }
    });

    next();
  }
}
