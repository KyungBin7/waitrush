import { LoggerMiddleware } from './logger.middleware';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';

describe('LoggerMiddleware', () => {
  let loggerMiddleware: LoggerMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;
  let logSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    loggerMiddleware = new LoggerMiddleware();

    mockRequest = {
      method: 'GET',
      originalUrl: '/test',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('test-user-agent'),
    };

    mockResponse = {
      statusCode: 200,
      on: jest.fn(),
    };

    nextFunction = jest.fn();

    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(loggerMiddleware).toBeDefined();
  });

  it('should call next function', () => {
    loggerMiddleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(nextFunction).toHaveBeenCalled();
  });

  it('should register finish event listener', () => {
    loggerMiddleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    expect(mockResponse.on).toHaveBeenCalledWith(
      'finish',
      expect.any(Function),
    );
  });

  it('should log successful requests', () => {
    const finishCallback = jest.fn();
    (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
      if (event === 'finish') {
        finishCallback.mockImplementation(callback);
      }
    });

    loggerMiddleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    finishCallback();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /test 200'),
      expect.stringContaining('"userAgent":"test-user-agent"'),
    );
  });

  it('should log error for failed requests', () => {
    mockResponse.statusCode = 404;

    const finishCallback = jest.fn();
    (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
      if (event === 'finish') {
        finishCallback.mockImplementation(callback);
      }
    });

    loggerMiddleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    finishCallback();

    expect(jest.spyOn(Logger.prototype, 'warn')).toHaveBeenCalledWith(
      expect.stringContaining('GET /test 404'),
      expect.stringContaining('"userAgent":"test-user-agent"'),
    );
  });

  it('should handle missing user agent', () => {
    (mockRequest.get as jest.Mock).mockReturnValue(undefined);

    const finishCallback = jest.fn();
    (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
      if (event === 'finish') {
        finishCallback.mockImplementation(callback);
      }
    });

    loggerMiddleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    finishCallback();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /test 200'),
      expect.stringContaining('"userAgent":""'),
    );
  });

  it('should log error for server errors (500+)', () => {
    mockResponse.statusCode = 500;

    const finishCallback = jest.fn();
    (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
      if (event === 'finish') {
        finishCallback.mockImplementation(callback);
      }
    });

    loggerMiddleware.use(
      mockRequest as Request,
      mockResponse as Response,
      nextFunction,
    );

    finishCallback();

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /test 500'),
      expect.stringContaining('"statusCode":500'),
    );
  });
});
