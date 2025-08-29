export interface OAuthLoginResponse {
  requiresSignup: boolean;
  accessToken?: string;
  email?: string;
  provider?: 'google' | 'github';
  providerId?: string;
  profileData?: {
    email: string;
    provider: 'google' | 'github';
    name?: string;
    username?: string;
    picture?: string;
  };
}
