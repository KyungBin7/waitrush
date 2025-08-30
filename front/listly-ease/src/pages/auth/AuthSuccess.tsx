import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { tokenStorage } from '@/utils/token';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  
  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        toast({
          title: 'Authentication failed',
          description: error || 'An error occurred during authentication',
          variant: 'destructive',
          duration: 4000,
        });
        return;
      }

      if (token) {
        try {
          // Store the token using tokenStorage
          tokenStorage.set(token);
          
          // Update auth context
          await checkAuth();
          
          setStatus('success');
          toast({
            title: 'Login successful',
            description: 'You have been successfully authenticated',
            duration: 3000,
          });

          // Redirect to dashboard after a brief delay
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 2000);
        } catch (error) {
          setStatus('error');
          toast({
            title: 'Authentication failed',
            description: 'Failed to process authentication token',
            variant: 'destructive',
            duration: 4000,
          });
        }
      } else {
        setStatus('error');
        toast({
          title: 'Authentication failed',
          description: 'No authentication token received',
          variant: 'destructive',
          duration: 4000,
        });
      }
    };

    handleAuth();
  }, [searchParams, navigate, toast, checkAuth]);

  const handleRetry = () => {
    navigate('/login', { replace: true });
  };

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return {
          icon: <Loader2 className="h-12 w-12 animate-spin text-primary" />,
          title: 'Processing Authentication',
          description: 'Please wait while we complete your login...',
          showButton: false,
        };
      case 'success':
        return {
          icon: <CheckCircle className="h-12 w-12 text-green-500" />,
          title: 'Authentication Successful',
          description: 'You will be redirected to your dashboard shortly.',
          showButton: false,
        };
      case 'error':
        return {
          icon: <XCircle className="h-12 w-12 text-destructive" />,
          title: 'Authentication Failed',
          description: 'There was a problem completing your authentication.',
          showButton: true,
        };
      default:
        return {
          icon: <Loader2 className="h-12 w-12 animate-spin text-primary" />,
          title: 'Processing Authentication',
          description: 'Please wait while we complete your login...',
          showButton: false,
        };
    }
  };

  const { icon, title, description, showButton } = getStatusContent();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md glass shadow-glass animate-fade-in">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {icon}
          </div>
          <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        </CardHeader>
        {showButton && (
          <CardContent className="text-center">
            <Button onClick={handleRetry} className="w-full">
              Try Again
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}