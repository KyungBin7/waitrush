import { HttpStatus } from '@nestjs/common';
import { ValidationFailedException } from './validation-failed.exception';

describe('ValidationFailedException', () => {
  it('should create exception with field, value, and constraint', () => {
    const exception = new ValidationFailedException(
      'email',
      'invalid-email',
      'must be a valid email address',
    );

    expect(exception.message).toBe(
      "Validation failed for field 'email': must be a valid email address",
    );
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(exception.getErrorCode()).toBe('VALIDATION_FAILED');
    expect(exception.getDetails()).toEqual({
      field: 'email',
      value: 'invalid-email',
      constraint: 'must be a valid email address',
    });
  });

  it('should create exception with numeric value', () => {
    const exception = new ValidationFailedException(
      'age',
      -5,
      'must be a positive number',
    );

    expect(exception.message).toBe(
      "Validation failed for field 'age': must be a positive number",
    );
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(exception.getErrorCode()).toBe('VALIDATION_FAILED');
    expect(exception.getDetails()).toEqual({
      field: 'age',
      value: -5,
      constraint: 'must be a positive number',
    });
  });

  it('should create exception with additional details', () => {
    const additionalDetails = { minLength: 8, currentLength: 4 };
    const exception = new ValidationFailedException(
      'password',
      'test',
      'password too short',
      additionalDetails,
    );

    expect(exception.message).toBe(
      "Validation failed for field 'password': password too short",
    );
    expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    expect(exception.getErrorCode()).toBe('VALIDATION_FAILED');
    expect(exception.getDetails()).toEqual({
      field: 'password',
      value: 'test',
      constraint: 'password too short',
      minLength: 8,
      currentLength: 4,
    });
  });

  it('should handle null and undefined values', () => {
    const exception = new ValidationFailedException(
      'name',
      null,
      'should not be null',
    );

    expect(exception.message).toBe(
      "Validation failed for field 'name': should not be null",
    );
    expect(exception.getDetails().value).toBeNull();

    const exception2 = new ValidationFailedException(
      'description',
      undefined,
      'is required',
    );

    expect(exception2.getDetails().value).toBeUndefined();
  });
});
