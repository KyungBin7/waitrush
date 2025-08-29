import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

export class NotFoundEntityException extends BaseException {
  constructor(entityName: string, identifier?: string | number, details?: any) {
    const message = identifier
      ? `${entityName} with identifier '${identifier}' not found`
      : `${entityName} not found`;

    super(message, HttpStatus.NOT_FOUND, 'ENTITY_NOT_FOUND', {
      entityName,
      identifier,
      ...details,
    });
  }
}
