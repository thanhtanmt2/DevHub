import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [authModal, setAuthModal] = useState({ isOpen: false, view: 'login' });

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

  // Sync auth modal with URL query param ?auth=login or ?auth=register
  useEffect(() => {
    const authParam = searchParams.get('auth');
    if (authParam === 'login' || authParam === 'register' || authParam === 'forgot') {
      setAuthModal({ isOpen: true, view: authParam });
    }
  }, [searchParams]);

  const openAuthModal = (view = 'login') => {
    setAuthModal({ isOpen: true, view });
  };

  const openLoginModal = () => openAuthModal('login');
  const openRegisterModal = () => openAuthModal('register');
  const openForgotPasswordModal = () => openAuthModal('forgot');

  const closeAuthModal = () => {
    setAuthModal(prev => ({ ...prev, isOpen: false }));
    if (searchParams.get('auth')) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('auth');
      setSearchParams(newParams, { replace: true });
    }
  };

  const setAuthModalView = (view) => {
    setAuthModal(prev => ({ ...prev, view }));
  };

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
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        getUserRoles,
        hasRole,
        isAdmin,
        isCandidate,
        isEmployer,
        authModal,
        openAuthModal,
        openLoginModal,
        openRegisterModal,
        openForgotPasswordModal,
        closeAuthModal,
        setAuthModalView,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

