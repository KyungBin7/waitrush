export const oauthConfig = {
  backend: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
  },
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
    // Backend OAuth endpoints
    authUrl: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/auth/google`,
    callbackUrl: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/auth/google/callback`,
  },
  github: {
    clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || "YOUR_GITHUB_CLIENT_ID",
    // Backend OAuth endpoints
    authUrl: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/auth/github`,
    callbackUrl: `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}/auth/github/callback`,
    scope: "user:email",
  },
};

// Store state values for CSRF protection
const pendingStates = new Set<string>();

export const getGitHubAuthUrl = () => {
  // Redirect directly to backend OAuth endpoint
  return oauthConfig.github.authUrl;
};

export const validateGitHubState = (state: string): boolean => {
  const isValid = pendingStates.has(state);
  if (isValid) {
    pendingStates.delete(state); // Use state only once
  }
  return isValid;
};

export const getGoogleAuthUrl = (state?: string) => {
  // Redirect directly to backend OAuth endpoint
  return oauthConfig.google.authUrl;
};