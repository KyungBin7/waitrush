import { OAuthCallback } from "@/components/auth/OAuthCallback";

export default function GitHubCallback() {
  const handleGitHubAuth = async (code: string, state?: string) => {
    // TODO: Implement GitHub OAuth backend integration
    // This will be implemented when backend endpoints are ready
    console.log("GitHub OAuth code received:", { code, state });
    throw new Error("GitHub OAuth backend integration pending implementation");
  };

  return (
    <OAuthCallback 
      provider="github" 
      onAuthSuccess={handleGitHubAuth}
    />
  );
}