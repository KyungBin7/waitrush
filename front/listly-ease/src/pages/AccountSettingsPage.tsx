import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Shield, Key, Trash2, Link as LinkIcon, Unlink } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DeleteAccountDialog } from "@/components/auth/DeleteAccountDialog";
import { authService } from "@/services/auth.service";
import { useToast } from "@/hooks/use-toast";
import heroBackground from "@/assets/hero-bg.jpg";

interface FullProfile {
  id: string;
  email: string;
  createdAt: string;
  authMethods: string[];
  socialProviders: Array<{
    provider: string;
    providerId: string;
  }>;
}

export default function AccountSettingsPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const profileData = await response.json();
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const handleUnlinkProvider = async (provider: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/auth/unlink/${provider}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        toast({
          title: "Provider unlinked",
          description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} account has been unlinked.`,
        });
        
        // Reload profile
        window.location.reload();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      toast({
        title: "Failed to unlink",
        description: error instanceof Error ? error.message : "Failed to unlink provider",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero relative">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="glass border-b border-border/50 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <h1 className="text-xl font-semibold text-foreground">
                  Account Settings
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Account Information */}
            <Card className="glass shadow-glass">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Your account details and authentication methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-foreground">{user?.email}</p>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                      <p className="text-foreground">
                        {profile?.createdAt ? formatDate(profile.createdAt) : 'Loading...'}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-3">Authentication Methods</p>
                  <div className="flex flex-wrap gap-2">
                    {profile?.authMethods?.map((method) => (
                      <Badge key={method} variant="secondary">
                        {method === 'email' ? 'Email & Password' : method.charAt(0).toUpperCase() + method.slice(1)}
                      </Badge>
                    )) || <Badge variant="outline">Loading...</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Social Accounts */}
            {profile?.socialProviders && profile.socialProviders.length > 0 && (
              <Card className="glass shadow-glass">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LinkIcon className="h-5 w-5 mr-2" />
                    Connected Accounts
                  </CardTitle>
                  <CardDescription>
                    Manage your social login connections
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile.socialProviders.map((provider) => (
                    <div key={provider.provider} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {provider.provider.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {provider.provider.charAt(0).toUpperCase() + provider.provider.slice(1)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Connected
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnlinkProvider(provider.provider)}
                        disabled={(profile.authMethods?.length || 0) <= 1}
                      >
                        <Unlink className="h-4 w-4 mr-2" />
                        Unlink
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Danger Zone */}
            <Card className="glass shadow-glass border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center text-destructive">
                  <Trash2 className="h-5 w-5 mr-2" />
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div>
                    <h4 className="font-medium text-foreground">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <DeleteAccountDialog />
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}