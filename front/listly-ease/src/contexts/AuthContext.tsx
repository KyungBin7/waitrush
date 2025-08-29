import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService, AuthResponse } from '@/services/auth.service';
import { tokenStorage, isTokenExpired } from '@/utils/token';

interface AuthContextType {
  user: AuthResponse | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<AuthResponse>;
  socialLogin: (provider: 'google' | 'github', token: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setAuthData: (token: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  const login = async (email: string, password: string): Promise<void> => {
    const response = await authService.login({ email, password });
    const newToken = response.accessToken;
    
    // Store token
    tokenStorage.set(newToken);
    setToken(newToken);
    
    // Get user profile
    const userProfile = await authService.getProfile(newToken);
    setUser(userProfile);
  };

  const signup = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await authService.signup({ email, password });
    return response;
  };

  const socialLogin = async (provider: 'google' | 'github', token: string): Promise<void> => {
    // TODO: Call backend social auth endpoint
    // For now, this is a placeholder that will be implemented when backend endpoints are ready
    throw new Error(`Social login with ${provider} is pending backend implementation`);
  };

  const logout = (): void => {
    tokenStorage.remove();
    setToken(null);
    setUser(null);
  };

  const deleteAccount = async (): Promise<void> => {
    const currentToken = token;
    if (!currentToken) {
      throw new Error('No authentication token found');
    }

    await authService.deleteAccount(currentToken);
    
    // Clear local auth data after successful deletion
    tokenStorage.remove();
    setToken(null);
    setUser(null);
  };

  const setAuthData = async (newToken: string): Promise<void> => {
    tokenStorage.set(newToken);
    setToken(newToken);
    
    // Get user profile
    const userProfile = await authService.getProfile(newToken);
    setUser(userProfile);
  };

  const checkAuth = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      const storedToken = tokenStorage.get();
      
      if (!storedToken || isTokenExpired(storedToken)) {
        tokenStorage.remove();
        setToken(null);
        setUser(null);
        return;
      }

      // Validate token with backend
      const userProfile = await authService.getProfile(storedToken);
      setToken(storedToken);
      setUser(userProfile);
    } catch (error) {
      // Token is invalid, clear it
      tokenStorage.remove();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    signup,
    socialLogin,
    logout,
    checkAuth,
    setAuthData,
    deleteAccount,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};