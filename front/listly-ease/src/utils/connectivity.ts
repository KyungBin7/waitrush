/**
 * Connectivity utilities for testing backend communication
 */

/**
 * Health response interface matching backend health endpoint
 */
export interface HealthResponse {
  status: string;
  database: {
    status: string;
    message?: string;
  };
}

/**
 * Connectivity test result with detailed information
 */
export interface ConnectivityTestResult {
  success: boolean;
  statusCode?: number;
  message?: string;
  data?: HealthResponse;
}

/**
 * Configuration for connectivity tests
 */
const CONNECTIVITY_CONFIG = {
  timeout: 10000, // 10 seconds
  healthEndpoint: '/api/health',
  frontendOrigin: 'http://localhost:8080',
} as const;

/**
 * Creates a fetch request with timeout
 */
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = CONNECTIVITY_CONFIG.timeout
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

/**
 * Tests connectivity to the backend health endpoint via proxy
 * @returns Promise<ConnectivityTestResult> Detailed test result
 */
export const testBackendConnectivity = async (): Promise<ConnectivityTestResult> => {
  try {
    const response = await fetchWithTimeout(CONNECTIVITY_CONFIG.healthEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const message = `Backend connectivity test failed: ${response.status} ${response.statusText}`;
      console.error(message);
      return {
        success: false,
        statusCode: response.status,
        message,
      };
    }

    const health: HealthResponse = await response.json();
    console.log('Backend connectivity test successful:', health);
    
    const success = health.status === 'ok';
    return {
      success,
      statusCode: response.status,
      message: success ? 'Backend connectivity successful' : 'Backend reports unhealthy status',
      data: health,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown connectivity error';
    console.error('Backend connectivity test error:', error);
    return {
      success: false,
      message: `Connectivity error: ${message}`,
    };
  }
};

/**
 * Tests CORS preflight by making an OPTIONS request
 * @returns Promise<ConnectivityTestResult> Detailed test result
 */
export const testCORS = async (): Promise<ConnectivityTestResult> => {
  try {
    const response = await fetchWithTimeout(CONNECTIVITY_CONFIG.healthEndpoint, {
      method: 'OPTIONS',
      headers: {
        'Origin': CONNECTIVITY_CONFIG.frontendOrigin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });

    const success = response.ok;
    return {
      success,
      statusCode: response.status,
      message: success 
        ? 'CORS preflight test successful' 
        : `CORS preflight failed: ${response.status} ${response.statusText}`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown CORS error';
    console.error('CORS test error:', error);
    return {
      success: false,
      message: `CORS error: ${message}`,
    };
  }
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use testBackendConnectivity() instead for detailed results
 */
export const testBackendConnectivityLegacy = async (): Promise<boolean> => {
  const result = await testBackendConnectivity();
  return result.success;
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use testCORS() instead for detailed results 
 */
export const testCORSLegacy = async (): Promise<boolean> => {
  const result = await testCORS();
  return result.success;
};