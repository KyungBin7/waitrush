import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { validateGitHubState } from "@/config/oauth";

interface OAuthCallbackProps {
  provider: "google" | "github";
  onAuthSuccess?: (code: string, state?: string) => Promise<void>;
}

export function OAuthCallback({ provider, onAuthSuccess }: OAuthCallbackProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");
        const state = searchParams.get("state");

        // Handle OAuth errors
        if (error) {
          const errorMessage = getErrorMessage(error, errorDescription);
          toast({
            title: "Authentication failed",
            description: errorMessage,
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        // Validate authorization code
        if (!code) {
          toast({
            title: "Authentication failed", 
            description: "No authorization code received.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        // Validate state parameter for CSRF protection
        if (provider === "github") {
          if (!state) {
            toast({
              title: "Authentication failed",
              description: "Missing security state. Please try again.",
              variant: "destructive",
            });
            navigate("/login");
            return;
          }
          
          if (!validateGitHubState(state)) {
            toast({
              title: "Authentication failed",
              description: "Invalid security state. Please try again.",
              variant: "destructive",
            });
            navigate("/login");
            return;
          }
        }

        // Process authentication with backend
        if (onAuthSuccess) {
          await onAuthSuccess(code, state || undefined);
        } else {
          // Default behavior - show pending implementation message
          toast({
            title: `${capitalize(provider)} OAuth`,
            description: "Backend OAuth integration pending implementation",
            variant: "destructive",
          });
          navigate("/login");
        }
      } catch (error) {
        console.error(`${provider} OAuth callback error:`, error);
        toast({
          title: "Authentication failed",
          description: error instanceof Error ? error.message : "Failed to complete authentication",
          variant: "destructive",
        });
        navigate("/login");
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate, searchParams, toast, provider, onAuthSuccess]);

  const getErrorMessage = (error: string, description?: string | null): string => {
    switch (error) {
      case "access_denied":
        return "Access was denied. Please try again.";
      case "invalid_request":
        return "Invalid request. Please try again.";
      case "unauthorized_client":
        return "Unauthorized client. Please contact support.";
      case "unsupported_response_type":
        return "Unsupported response type. Please contact support.";
      case "invalid_scope":
        return "Invalid scope requested. Please contact support.";
      case "server_error":
        return "Server error occurred. Please try again later.";
      case "temporarily_unavailable":
        return "Service temporarily unavailable. Please try again later.";
      default:
        return description || `Failed to authenticate with ${capitalize(provider)}.`;
    }
  };

  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (!isProcessing) {
    return null; // Component will unmount after navigation
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" data-testid="loading-spinner" />
        <p className="text-muted-foreground">
          Completing {capitalize(provider)} authentication...
        </p>
      </div>
    </div>
  );
}