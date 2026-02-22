import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAccessToken, clearAccessToken, getAccessToken } from '../services/api';

const AuthContext = createContext(null);

// Module-level promise so React StrictMode's double-invoke of effects
// doesn't fire two concurrent refresh requests (which would cause the
// second one to fail because the first already rotated the token).
let _initRefreshPromise = null;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors
    }
    setUser(null);
    clearAccessToken();
  }, []);

  // Restore session on mount
  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        // Reuse in-flight promise if one already exists (StrictMode double-invoke guard)
        if (!_initRefreshPromise) {
          _initRefreshPromise = api.post('/auth/refresh').finally(() => {
            _initRefreshPromise = null;
          });
        }
        const res = await _initRefreshPromise;
        if (cancelled) return;

        setAccessToken(res.data.accessToken);
        const userRes = await api.get('/auth/me');
        if (cancelled) return;

        setUser(userRes.data.user);
      } catch {
        if (!cancelled) {
          setUser(null);
          clearAccessToken();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    checkAuth();
    return () => { cancelled = true; };
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
