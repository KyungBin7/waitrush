import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class BusinessLogicException extends BaseException {
  constructor(message: string, errorCode?: string, details?: any) {
    super(message, HttpStatus.BAD_REQUEST, errorCode, details);
  }
}
