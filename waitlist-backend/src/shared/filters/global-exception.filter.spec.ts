import { GlobalExceptionFilter } from './global-exception.filter';
import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockArgumentsHost: jest.Mocked<ArgumentsHost>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let loggerErrorSpy: jest.SpyInstance;
  let loggerWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    mockRequest = {
      method: 'GET',
      url: '/test',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-user-agent'),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockHttpContext = {
      getRequest: () => mockRequest,
      getResponse: () => mockResponse,
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue(mockHttpContext),
    } as any;

    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should handle HttpException correctly', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'Test error',
      error: 'HttpException',
      timestamp: expect.any(String),
      path: '/test',
    });
  });

  it('should handle HttpException with object response', () => {
    const exception = new HttpException(
      {
        message: ['field1 error', 'field2 error'],
        error: 'Validation Error',
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: ['field1 error', 'field2 error'],
      error: 'Validation Error',
      timestamp: expect.any(String),
      path: '/test',
    });
  });

  it('should handle unexpected errors as 500', () => {
    const exception = new Error('Unexpected error');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
      timestamp: expect.any(String),
      path: '/test',
    });
  });

  it('should log 4xx errors as warnings', () => {
    const exception = new HttpException('Client error', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockArgumentsHost);

    expect(loggerWarnSpy).toHaveBeenCalledWith(
      'GET /test 404 - HttpException',
      expect.stringContaining('"statusCode":404'),
    );
  });

  it('should log 5xx errors as errors', () => {
    const exception = new HttpException(
      'Server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'GET /test 500 - HttpException',
      expect.stringContaining('"statusCode":500'),
    );
  });

  it('should log unexpected errors with stack trace', () => {
    const exception = new Error('Unexpected error');

    filter.catch(exception, mockArgumentsHost);

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      'Unexpected error: Error: Unexpected error',
      expect.any(String),
    );
  });

  it('should handle missing user agent gracefully', () => {
    (mockRequest.get as jest.Mock).mockReturnValue(undefined);
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost);

    expect(loggerWarnSpy).toHaveBeenCalledWith(
      'GET /test 400 - HttpException',
      expect.stringContaining('"userAgent":""'),
    );
  });

  it('should format array messages correctly in logs', () => {
    const exception = new HttpException(
      {
        message: ['error1', 'error2'],
        error: 'Validation Error',
      },
      HttpStatus.BAD_REQUEST,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(loggerWarnSpy).toHaveBeenCalledWith(
      'GET /test 400 - Validation Error',
      expect.stringContaining('"message":"error1, error2"'),
    );
  });
});
