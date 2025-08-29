export interface GoogleTokenInfo {
  email: string;
  user_id: string;
  aud?: string;
  scope?: string;
  expires_in?: number;
}

export interface GitHubUser {
  id: number;
  login: string;
  email: string | null;
  name?: string;
  avatar_url?: string;
}

export interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

export interface SocialProvider {
  provider: 'google' | 'github';
  providerId: string;
}
