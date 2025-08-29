import { HttpStatus } from '@nestjs/common';
import { BusinessLogicException } from './business-logic.exception';

describe('BusinessLogicException', () => {
  it('should create exception with default status 400', () => {
    const exception = new BusinessLogicException('Business rule violation');

    expect(exception.message).toBe('Business rule violation');
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(exception.getErrorCode()).toBeUndefined();
    expect(exception.getDetails()).toBeUndefined();
  });

  it('should create exception with error code', () => {
    const exception = new BusinessLogicException(
      'Insufficient balance',
      'INSUFFICIENT_BALANCE',
    );

    expect(exception.message).toBe('Insufficient balance');
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(exception.getErrorCode()).toBe('INSUFFICIENT_BALANCE');
  });

  it('should create exception with error code and details', () => {
    const details = { balance: 50, required: 100 };
    const exception = new BusinessLogicException(
      'Insufficient balance',
      'INSUFFICIENT_BALANCE',
      details,
    );

    expect(exception.message).toBe('Insufficient balance');
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(exception.getErrorCode()).toBe('INSUFFICIENT_BALANCE');
    expect(exception.getDetails()).toEqual(details);
  });
});
