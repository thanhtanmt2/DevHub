// file này quản lý trạng thái đăng nhập và thông tin người dùng
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authApi } from '@/api/authApi';

const AuthContext = createContext(null);
// AuthProvider là một component React nhận children props và cung cấp AuthContext cho các component con
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // lưu thông tin user đang đăng nhập
  const [loading, setLoading] = useState(true); // trạng thái loading khi tải user
  const [searchParams, setSearchParams] = useSearchParams(); // tham số URL 
  const [authModal, setAuthModal] = useState({ isOpen: false, view: 'login' }); // trạng thái modal

  // tải thông tin user từ localStorage
  const loadUser = useCallback(async () => {
    // khi F5, biến bị mất, lấy accessToken trong localStorage 
    const token = localStorage.getItem('accessToken');
    // nếu chưa có token (khách vãn lai) --> không thực hiện gì 
    if (!token) { setLoading(false); return; }
    // nếu có gửi xuống backend 
    try {
      const { data } = await authApi.getMe();
      setUser(data.data);
      // trường hợp token hết hạn, hoặc bị giả mạo thì xóa chúng 
    } catch {
      localStorage.removeItem('accessToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // tự động kích hoạt hàm loadUser mỗi khi app khởi động hoặc load lại 
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

  const googleLogin = async (token) => {
    const { data } = await authApi.googleLogin(token);
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  };

  const logout = async () => {
    try { await authApi.logout(); } catch { }
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
        googleLogin,
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

