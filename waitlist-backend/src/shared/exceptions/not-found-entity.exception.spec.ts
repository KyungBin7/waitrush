import { HttpStatus } from '@nestjs/common';
import { NotFoundEntityException } from './not-found-entity.exception';

describe('NotFoundEntityException', () => {
  it('should create exception with entity name only', () => {
    const exception = new NotFoundEntityException('User');

    expect(exception.message).toBe('User not found');
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(exception.getErrorCode()).toBe('ENTITY_NOT_FOUND');
    expect(exception.getDetails()).toEqual({
      entityName: 'User',
      identifier: undefined,
    });
  });

  it('should create exception with entity name and string identifier', () => {
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

  it('should create exception with entity name and numeric identifier', () => {
    const exception = new NotFoundEntityException('Order', 12345);

    expect(exception.message).toBe("Order with identifier '12345' not found");
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(exception.getErrorCode()).toBe('ENTITY_NOT_FOUND');
    expect(exception.getDetails()).toEqual({
      entityName: 'Order',
      identifier: 12345,
    });
  });

  it('should create exception with additional details', () => {
    const additionalDetails = { userId: 123, searchCriteria: 'active' };
    const exception = new NotFoundEntityException(
      'User',
      'test@example.com',
      additionalDetails,
    );

    expect(exception.message).toBe(
      "User with identifier 'test@example.com' not found",
    );
    expect(exception.getStatus()).toBe(HttpStatus.NOT_FOUND);
    expect(exception.getErrorCode()).toBe('ENTITY_NOT_FOUND');
    expect(exception.getDetails()).toEqual({
      entityName: 'User',
      identifier: 'test@example.com',
      userId: 123,
      searchCriteria: 'active',
    });
  });
});
