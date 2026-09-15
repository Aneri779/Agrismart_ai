import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [role, setRole]               = useState(null);
  const [loading, setLoading]         = useState(true); // true while restoring session
  const [authenticated, setAuth]      = useState(false);

  /* ── helpers ── */
  const _persist = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user',  JSON.stringify(userData));
  };
  const _clear = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  /* ── session restore ── */
  useEffect(() => {
    const token    = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        setRole(parsed.role);
        setAuth(true);
      } catch (_) { _clear(); }
    }
    setLoading(false);
  }, []);

  /* ── login ── */
  const login = useCallback(async (email, password) => {
    try {
      const data = await apiClient.post('/auth/login', { email, password });
      const { accessToken, user: userData } = data;
      _persist(accessToken, userData);
      setUser(userData);
      setRole(userData.role);
      setAuth(true);
      return { success: true, role: userData.role };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.detail || 'Unable to sign in. Please try again.',
      };
    }
  }, []);

  /* ── register ── */
  const register = useCallback(async (payload) => {
    try {
      await apiClient.post('/auth/register', payload);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.detail || 'Unable to create your account. Please try again.',
      };
    }
  }, []);

  /* ── logout ── */
  const logout = useCallback(() => {
    _clear();
    setUser(null);
    setRole(null);
    setAuth(false);
  }, []);

  /* ── update user ── */
  const updateUser = useCallback((newData) => {
    setUser(prev => {
      const updated = { ...prev, ...newData };
      const token = localStorage.getItem('token');
      if (token) _persist(token, updated);
      return updated;
    });
  }, [role]);

  /* ── hasRole helper ── */
  const hasRole = useCallback((r) => role === r, [role]);

  return (
    <AuthContext.Provider value={{
      user, role, loading, authenticated,
      login, register, logout, updateUser, hasRole,
      isAuthenticated: authenticated,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
