import { useState, useEffect } from 'react';
import { tokenStorage, isTokenExpired, getTokenPayload } from '@/utils/token';
import { authService, type AuthResponse } from '@/services/auth.service';

interface UseAuthResult {
  isAuthenticated: boolean;
  user: AuthResponse | null;
  loading: boolean;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    tokenStorage.remove();
    setIsAuthenticated(false);
    setUser(null);
  };

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = tokenStorage.get();
      
      if (!token || isTokenExpired(token)) {
        logout();
        return;
      }

      // Get user profile from API
      const userProfile = await authService.getProfile(token);
      setUser(userProfile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return {
    isAuthenticated,
    user,
    loading,
    logout,
    checkAuth,
  };
}

export function useAuthUserId(): string | null {
  const token = tokenStorage.get();
  if (!token || isTokenExpired(token)) {
    return null;
  }
  
  const payload = getTokenPayload(token);
  return payload?.sub as string || null;
}