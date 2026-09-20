import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { setLoading(false); return; }
    try {
      const { data } = await authApi.getMe();
      setUser(data.data);
    } catch {
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const getUserRoles = () => user?.Roles?.map(r => r.name) || [];
  const hasRole = (role) => getUserRoles().includes(role);
  const isAdmin = () => hasRole('ADMIN');
  const isCandidate = () => hasRole('CANDIDATE');
  const isEmployer = () => hasRole('EMPLOYER');

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, getUserRoles, hasRole, isAdmin, isCandidate, isEmployer }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
