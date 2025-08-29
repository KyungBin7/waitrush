import { OAuthCallback } from "@/components/auth/OAuthCallback";

export default function GoogleCallback() {
  const handleGoogleAuth = async (code: string, state?: string) => {
    // TODO: Implement Google OAuth backend integration
    // This will be implemented when backend endpoints are ready
    console.log("Google OAuth code received:", { code, state });
    throw new Error("Google OAuth backend integration pending implementation");
  };

  return (
    <OAuthCallback 
      provider="google" 
      onAuthSuccess={handleGoogleAuth}
    />
  );
}