import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth.service";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export function SocialSignupForm() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [socialData, setSocialData] = useState<{
    provider?: string;
    providerId?: string;
    email?: string;
    name?: string;
    username?: string;
    picture?: string;
  }>({});
  
  const { setAuthData } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for social signup parameters
  useEffect(() => {
    const provider = searchParams.get("provider");
    const providerId = searchParams.get("providerId");
    const email = searchParams.get("email");
    
    if (!provider || !providerId || !email) {
      toast({
        title: "Invalid signup link",
        description: "Please try signing up again.",
        variant: "destructive",
      });
      navigate("/signup");
      return;
    }

    const data = {
      provider,
      providerId,
      email,
      name: searchParams.get("name") || undefined,
      username: searchParams.get("username") || undefined,
      picture: searchParams.get("picture") || undefined,
    };
    setSocialData(data);
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast({
        title: "Please agree to the terms",
        description: "You must agree to the terms of service to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!socialData.provider || !socialData.providerId || !socialData.email) {
      toast({
        title: "Missing information",
        description: "Please try signing up again.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authService.socialSignup({
        email: socialData.email,
        provider: socialData.provider as 'google' | 'github',
        providerId: socialData.providerId,
        additionalData: {
          name: socialData.name,
          username: socialData.username,
          picture: socialData.picture,
        }
      });
      
      // Store token and redirect
      await setAuthData(response.accessToken);
      toast({
        title: "Welcome to WaitRush Gaming Queue!",
        description: "Your account has been created successfully.",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!socialData.provider) {
    return null;
  }

  const providerName = socialData.provider.charAt(0).toUpperCase() + socialData.provider.slice(1);
  const displayName = socialData.name || socialData.username || socialData.email;

  return (
    <Card className="w-full max-w-md glass shadow-glass animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold">
          Complete Your {providerName} Signup
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Just one more step to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* User Info Display */}
          <div className="flex items-center space-x-4 p-4 rounded-lg bg-muted/30">
            <Avatar className="h-12 w-12">
              {socialData.picture && (
                <AvatarImage src={socialData.picture} alt={displayName} />
              )}
              <AvatarFallback>
                {displayName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{displayName}</p>
              <p className="text-sm text-muted-foreground">{socialData.email}</p>
            </div>
            <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
              {providerName}
            </div>
          </div>

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              You'll use your {providerName} account to sign in. No password needed!
            </AlertDescription>
          </Alert>

          {/* Terms Agreement */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1"
              />
              <Label 
                htmlFor="terms" 
                className="text-sm font-normal cursor-pointer"
              >
                I agree to the{" "}
                <a 
                  href="/terms" 
                  target="_blank" 
                  className="text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a 
                  href="/privacy" 
                  target="_blank" 
                  className="text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Privacy Policy
                </a>
              </Label>
            </div>
          </div>

          <Button 
            type="submit" 
            size="lg" 
            className="w-full"
            disabled={isLoading || !agreedToTerms}
          >
            {isLoading ? "Creating your account..." : "Complete Signup"}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <a 
              href="/login" 
              className="text-primary hover:text-primary-glow font-medium transition-colors"
            >
              Sign in
            </a>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}