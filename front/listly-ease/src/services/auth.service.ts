const API_BASE_URL = '/api';

export interface SignupRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface SocialLoginRequest {
  provider: 'google' | 'github';
  token: string;
}

export interface SocialSignupRequest {
  email: string;
  provider: 'google' | 'github';
  providerId: string;
  additionalData?: {
    name?: string;
    username?: string;
    picture?: string;
  };
}

class AuthService {
  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Invalid credentials. Please try again.';
      case 409:
        return 'This email is already registered.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An unexpected error occurred.';
    }
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: this.getDefaultErrorMessage(response.status),
        statusCode: response.status,
      }));
      
      const error = new Error(errorData.message || `HTTP error! status: ${response.status}`) as Error & { statusCode: number };
      error.statusCode = response.status;
      throw error;
    }

    return response.json();
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(token: string): Promise<AuthResponse> {
    return this.makeRequest<AuthResponse>('/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async socialLogin(data: SocialLoginRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>(`/auth/social/${data.provider}`, {
      method: 'POST',
      body: JSON.stringify({ token: data.token }),
    });
  }

  async socialSignup(data: SocialSignupRequest): Promise<LoginResponse> {
    return this.makeRequest<LoginResponse>('/auth/social-signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(token: string): Promise<{ message: string; deletedAt: string }> {
    return this.makeRequest<{ message: string; deletedAt: string }>('/auth/account', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

export const authService = new AuthService();