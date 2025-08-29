import { HttpStatus } from '@nestjs/common';
import { BaseException } from './base.exception';

class TestException extends BaseException {
  constructor(
    message: string,
    status: HttpStatus,
    errorCode?: string,
    details?: any,
  ) {
    super(message, status, errorCode, details);
  }
}

describe('BaseException', () => {
  it('should create exception with message and status', () => {
    const exception = new TestException('Test error', HttpStatus.BAD_REQUEST);

    expect(exception.message).toBe('Test error');
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(exception.getErrorCode()).toBeUndefined();
    expect(exception.getDetails()).toBeUndefined();
  });

  it('should create exception with error code and details', () => {
    const details = { field: 'email', value: 'invalid' };
    const exception = new TestException(
      'Validation error',
      HttpStatus.BAD_REQUEST,
      'VALIDATION_ERROR',
      details,
    );

    expect(exception.message).toBe('Validation error');
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(exception.getErrorCode()).toBe('VALIDATION_ERROR');
    expect(exception.getDetails()).toEqual(details);
  });

  it('should inherit from HttpException', () => {
    const exception = new TestException('Test error', HttpStatus.BAD_REQUEST);

    expect(exception).toBeInstanceOf(Error);
    expect(exception.name).toBe('TestException');
  });
});
