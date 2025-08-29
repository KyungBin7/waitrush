import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class ValidationFailedException extends BaseException {
  constructor(field: string, value: any, constraint: string, details?: any) {
    const message = `Validation failed for field '${field}': ${constraint}`;

    super(message, HttpStatus.BAD_REQUEST, 'VALIDATION_FAILED', {
      field,
      value,
      constraint,
      ...details,
    });
  }
}
