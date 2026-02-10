import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAccessToken, clearAccessToken, getAccessToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore errors
    }
    setUser(null);
    clearAccessToken();
  }, []);

  // Check auth on mount (silent - no console errors for expected 401)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.post('/auth/refresh');
        setAccessToken(res.data.accessToken);
        const userRes = await api.get('/auth/me');
        setUser(userRes.data.user);
      } catch {
        // Expected when not logged in - silently set user to null
        setUser(null);
        clearAccessToken();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Listen for forced logout
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      clearAccessToken();
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (email, password, name) => {
    const res = await api.post('/auth/register', { email, password, name });
    setAccessToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    getAccessToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
