import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | string[];
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || exception.message;
        error = responseObj.error || exception.name;
      } else {
        message = exceptionResponse;
        error = exception.name;
      }
    } else {
      // Unexpected errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';

      // Log unexpected errors with full details
      this.logger.error(
        `Unexpected error: ${exception}`,
        exception instanceof Error
          ? exception.stack
          : 'No stack trace available',
      );
    }

    const errorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log error with structured format matching LoggerMiddleware
    const logContext = {
      method: request.method,
      url: request.url,
      statusCode: status,
      ip: request.ip,
      userAgent: request.get('user-agent') || '',
      error: error,
      message: Array.isArray(message) ? message.join(', ') : message,
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${status} - ${error}`,
        JSON.stringify(logContext),
      );
    } else if (status >= 400) {
      this.logger.warn(
        `${request.method} ${request.url} ${status} - ${error}`,
        JSON.stringify(logContext),
      );
    }

    response.status(status).json(errorResponse);
  }
}
