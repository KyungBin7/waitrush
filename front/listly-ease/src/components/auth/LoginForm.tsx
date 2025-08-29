import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { SocialLoginButton } from "./SocialLoginButton";

import { Separator } from "@/components/ui/separator";
import { getGitHubAuthUrl, getGoogleAuthUrl } from "@/config/oauth";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: "Login successful",
        description: "Welcome back! Redirecting to dashboard...",
      });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setSocialLoading("google");
    // Redirect to backend Google OAuth
    window.location.href = getGoogleAuthUrl();
  };

  const handleGitHubLogin = () => {
    setSocialLoading("github");
    // Redirect to GitHub OAuth
    window.location.href = getGitHubAuthUrl();
  };

  return (
    <Card variant="gaming" className="w-full max-w-md shadow-glass animate-fade-in">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold">Welcome Back</CardTitle>
        <CardDescription className="text-muted-foreground">
          Sign in to your organizer account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <SocialLoginButton
            provider="google"
            onClick={handleGoogleLogin}
            isLoading={socialLoading === "google"}
            variant="login"
          />
          <SocialLoginButton
            provider="github"
            onClick={handleGitHubLogin}
            isLoading={socialLoading === "github"}
            variant="login"
          />
        </div>
        
        <div className="my-6 flex items-center gap-4">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">OR</span>
          <Separator className="flex-1" />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 rounded-xl glass border-0 focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 h-12 rounded-xl glass border-0 focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link 
              to="/forgot-password" 
              className="text-primary hover:text-primary-glow transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button 
            type="submit" 
            variant="waitrush"
            size="lg" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link 
            to="/signup" 
            className="text-primary hover:text-primary-glow font-medium transition-colors"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}