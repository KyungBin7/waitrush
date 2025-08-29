import React, { useState } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { testBackendConnectivity, testCORS, ConnectivityTestResult } from '../utils/connectivity';

interface ConnectivityTestProps {
  className?: string;
}

export const ConnectivityTest: React.FC<ConnectivityTestProps> = ({ className }) => {
  const [isTestingConnectivity, setIsTestingConnectivity] = useState(false);
  const [isTestingCORS, setIsTestingCORS] = useState(false);
  const [connectivityResult, setConnectivityResult] = useState<ConnectivityTestResult | null>(null);
  const [corsResult, setCorsResult] = useState<ConnectivityTestResult | null>(null);

  const handleConnectivityTest = async () => {
    setIsTestingConnectivity(true);
    setConnectivityResult(null);
    
    try {
      const result = await testBackendConnectivity();
      setConnectivityResult(result);
    } catch (error) {
      console.error('Connectivity test error:', error);
      setConnectivityResult({
        success: false,
        message: 'Unexpected error occurred during connectivity test',
      });
    } finally {
      setIsTestingConnectivity(false);
    }
  };

  const handleCORSTest = async () => {
    setIsTestingCORS(true);
    setCorsResult(null);
    
    try {
      const result = await testCORS();
      setCorsResult(result);
    } catch (error) {
      console.error('CORS test error:', error);
      setCorsResult({
        success: false,
        message: 'Unexpected error occurred during CORS test',
      });
    } finally {
      setIsTestingCORS(false);
    }
  };

  const getAlertVariant = (result: ConnectivityTestResult | null) => {
    if (result === null) return 'default';
    return result.success ? 'default' : 'destructive';
  };

  const getResultText = (result: ConnectivityTestResult | null, testName: string) => {
    if (result === null) return `${testName} not tested yet`;
    
    const icon = result.success ? '✅' : '❌';
    const statusCode = result.statusCode ? ` (${result.statusCode})` : '';
    const message = result.message || (result.success ? 'successful' : 'failed');
    
    return `${testName} ${message}${statusCode} ${icon}`;
  };

  return (
    <div className={`space-y-4 p-4 border rounded-lg ${className}`}>
      <h3 className="text-lg font-semibold">Backend Connectivity Test</h3>
      
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button 
            onClick={handleConnectivityTest} 
            disabled={isTestingConnectivity}
            variant="outline"
          >
            {isTestingConnectivity ? 'Testing...' : 'Test Backend Connection'}
          </Button>
          
          <Button 
            onClick={handleCORSTest} 
            disabled={isTestingCORS}
            variant="outline"
          >
            {isTestingCORS ? 'Testing...' : 'Test CORS Configuration'}
          </Button>
        </div>

        {connectivityResult !== null && (
          <Alert variant={getAlertVariant(connectivityResult)}>
            <AlertDescription>
              {getResultText(connectivityResult, 'Backend connectivity')}
            </AlertDescription>
          </Alert>
        )}

        {corsResult !== null && (
          <Alert variant={getAlertVariant(corsResult)}>
            <AlertDescription>
              {getResultText(corsResult, 'CORS configuration')}
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="text-sm text-gray-600">
        <p><strong>Backend URL:</strong> http://localhost:3000</p>
        <p><strong>Frontend URL:</strong> http://localhost:8080</p>
        <p><strong>API Proxy:</strong> /api/* → http://localhost:3000/*</p>
      </div>
    </div>
  );
};