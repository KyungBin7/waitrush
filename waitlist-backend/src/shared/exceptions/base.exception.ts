import { HttpException, HttpStatus } from '@nestjs/common';

export abstract class BaseException extends HttpException {
  protected constructor(
    message: string,
    status: HttpStatus,
    public readonly errorCode?: string,
    public readonly details?: any,
  ) {
    super(message, status);
  }

  getErrorCode(): string | undefined {
    return this.errorCode;
  }

  getDetails(): any {
    return this.details;
  }
}
