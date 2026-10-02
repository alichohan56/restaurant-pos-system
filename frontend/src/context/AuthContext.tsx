import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearStoredToken, getStoredToken, setStoredToken } from '../api/apiClient';
import { getCurrentUser, login as loginRequest } from '../services/auth.service';
import type { User } from '../types/auth.types';
import { AuthContext } from './useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(() => getStoredToken() !== null);

  useEffect(() => {
    const storedToken = getStoredToken();

    if (!storedToken) {
      return;
    }

    let active = true;

    getCurrentUser()
      .then((currentUser) => {
        if (!active) return;
        setToken(storedToken);
        setUser(currentUser);
      })
      .catch(() => {
        if (!active) return;
        clearStoredToken();
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (!active) return;
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await loginRequest(email, password);
      setStoredToken(response.accessToken);
      setToken(response.accessToken);
      setUser(response.user);
      navigate('/dashboard', { replace: true });
    },
    [navigate],
  );

  const logout = useCallback(() => {
    clearStoredToken();
    setToken(null);
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: user !== null,
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
