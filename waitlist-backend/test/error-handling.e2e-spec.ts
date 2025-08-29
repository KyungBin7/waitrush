import { HttpStatus } from '@nestjs/common';
import {
  BusinessLogicException,
  NotFoundEntityException,
  ValidationFailedException,
} from '../src/shared/exceptions';

describe('Error Handling Integration', () => {
  describe('Custom Exception Classes Integration', () => {
    it('should properly format BusinessLogicException', () => {
      const exception = new BusinessLogicException(
        'Insufficient balance',
        'INSUFFICIENT_BALANCE',
        { balance: 50, required: 100 },
      );

      expect(exception.message).toBe('Insufficient balance');
      expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(exception.getErrorCode()).toBe('INSUFFICIENT_BALANCE');
      expect(exception.getDetails()).toEqual({
        balance: 50,
        required: 100,
      });
    });

    it('should properly format NotFoundEntityException', () => {
      const exception = new NotFoundEntityException('User', 'john@example.com');

      expect(exception.message).toBe(
        "User with identifier 'john@example.com' not found",
      );
      expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(exception.getErrorCode()).toBe('ENTITY_NOT_FOUND');
      expect(exception.getDetails()).toEqual({
        entityName: 'User',
        identifier: 'john@example.com',
      });
    });

    it('should properly format ValidationFailedException', () => {
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

    it('should validate exception inheritance hierarchy', () => {
      const businessLogicException = new BusinessLogicException('Test message');
      const notFoundException = new NotFoundEntityException('User');
      const validationException = new ValidationFailedException(
        'field',
        'value',
        'constraint',
      );

      expect(businessLogicException).toBeInstanceOf(Error);
      expect(notFoundException).toBeInstanceOf(Error);
      expect(validationException).toBeInstanceOf(Error);
    });

    it('should ensure error status codes are correct', () => {
      const businessLogicException = new BusinessLogicException('Test message');
      const notFoundException = new NotFoundEntityException('User');
      const validationException = new ValidationFailedException(
        'field',
        'value',
        'constraint',
      );

      expect(businessLogicException.getStatus()).toBe(HttpStatus.BAD_REQUEST);
      expect(notFoundException.getStatus()).toBe(HttpStatus.NOT_FOUND);
      expect(validationException.getStatus()).toBe(HttpStatus.BAD_REQUEST);
    });
  });
});
