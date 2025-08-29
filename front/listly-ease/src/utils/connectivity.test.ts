/**
 * Tests for connectivity utilities
 * These tests verify the frontend can communicate with the backend
 */

import { 
  testBackendConnectivity, 
  testCORS, 
  testBackendConnectivityLegacy, 
  testCORSLegacy,
  ConnectivityTestResult 
} from './connectivity';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Connectivity Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('testBackendConnectivity (enhanced)', () => {
    it('should return detailed success result when backend health check succeeds', async () => {
      const mockHealthData = {
        status: 'ok',
        database: { status: 'up' }
      };
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockHealthData)
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await testBackendConnectivity();

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Backend connectivity successful',
        data: mockHealthData
      });
      expect(fetch).toHaveBeenCalledWith('/api/health', expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: expect.any(AbortSignal),
      }));
    });

    it('should return detailed failure result when backend health check fails', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await testBackendConnectivity();

      expect(result).toEqual({
        success: false,
        statusCode: 500,
        message: 'Backend connectivity test failed: 500 Internal Server Error'
      });
    });

    it('should return detailed failure result when backend health status is not ok', async () => {
      const mockHealthData = {
        status: 'error',
        database: { status: 'down' }
      };
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(mockHealthData)
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await testBackendConnectivity();

      expect(result).toEqual({
        success: false,
        statusCode: 200,
        message: 'Backend reports unhealthy status',
        data: mockHealthData
      });
    });

    it('should handle network errors gracefully with detailed message', async () => {
      const error = new Error('Network error');
      (fetch as jest.Mock).mockRejectedValue(error);

      const result = await testBackendConnectivity();

      expect(result).toEqual({
        success: false,
        message: 'Connectivity error: Network error'
      });
    });
  });

  describe('testCORS (enhanced)', () => {
    it('should return detailed success result when CORS preflight succeeds', async () => {
      const mockResponse = {
        ok: true,
        status: 204
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await testCORS();

      expect(result).toEqual({
        success: true,
        statusCode: 204,
        message: 'CORS preflight test successful'
      });
      expect(fetch).toHaveBeenCalledWith('/api/health', expect.objectContaining({
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:8080',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type',
        },
        signal: expect.any(AbortSignal),
      }));
    });

    it('should return detailed failure result when CORS preflight fails', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      };

      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await testCORS();

      expect(result).toEqual({
        success: false,
        statusCode: 403,
        message: 'CORS preflight failed: 403 Forbidden'
      });
    });

    it('should handle CORS errors gracefully with detailed message', async () => {
      const error = new Error('CORS error');
      (fetch as jest.Mock).mockRejectedValue(error);

      const result = await testCORS();

      expect(result).toEqual({
        success: false,
        message: 'CORS error: CORS error'
      });
    });
  });

  describe('Legacy functions (backward compatibility)', () => {
    describe('testBackendConnectivityLegacy', () => {
      it('should return true when backend health check succeeds', async () => {
        const mockResponse = {
          ok: true,
          status: 200,
          json: jest.fn().mockResolvedValue({
            status: 'ok',
            database: { status: 'up' }
          })
        };

        (fetch as jest.Mock).mockResolvedValue(mockResponse);

        const result = await testBackendConnectivityLegacy();

        expect(result).toBe(true);
      });

      it('should return false when backend health check fails', async () => {
        const mockResponse = {
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        };

        (fetch as jest.Mock).mockResolvedValue(mockResponse);

        const result = await testBackendConnectivityLegacy();

        expect(result).toBe(false);
      });
    });

    describe('testCORSLegacy', () => {
      it('should return true when CORS preflight succeeds', async () => {
        const mockResponse = {
          ok: true,
          status: 204
        };

        (fetch as jest.Mock).mockResolvedValue(mockResponse);

        const result = await testCORSLegacy();

        expect(result).toBe(true);
      });

      it('should return false when CORS preflight fails', async () => {
        const mockResponse = {
          ok: false
        };

        (fetch as jest.Mock).mockResolvedValue(mockResponse);

        const result = await testCORSLegacy();

        expect(result).toBe(false);
      });
    });
  });
});