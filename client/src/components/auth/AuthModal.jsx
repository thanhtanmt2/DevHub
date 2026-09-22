import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/api/authApi';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export default function AuthModal() {
  const { authModal, closeAuthModal, setAuthModalView, login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoginLoading(true);
    try {
      const user = await googleLogin(credentialResponse.credential);
      const roles = user.Roles?.map((r) => r.name) || [];
      toast.success(`Chào mừng trở lại, ${user.full_name}!`);
      closeAuthModal();

      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (roles.includes('ADMIN')) {
        navigate('/admin');
      } else if (roles.includes('EMPLOYER')) {
        navigate('/employer');
      } else if (location.pathname === '/') {
        navigate('/candidate');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập Google thất bại');
    } finally {
      setLoginLoading(false);
    }
  };

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CANDIDATE',
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && authModal.isOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authModal.isOpen, closeAuthModal]);

  // Reset register/forgot success states when modal closes or view changes
  useEffect(() => {
    if (!authModal.isOpen) {
      setRegisterSuccess(false);
      setForgotSent(false);
    }
  }, [authModal.isOpen, authModal.view]);

  if (!authModal.isOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    try {
      const user = await login(loginForm);
      const roles = user.Roles?.map((r) => r.name) || [];
      toast.success(`Chào mừng trở lại, ${user.full_name}!`);
      closeAuthModal();

      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (roles.includes('ADMIN')) {
        navigate('/admin');
      } else if (roles.includes('EMPLOYER')) {
        navigate('/employer');
      } else if (location.pathname === '/') {
        navigate('/candidate');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Register Submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp');
    }
    if (registerForm.password.length < 8) {
      return toast.error('Mật khẩu tối thiểu 8 ký tự');
    }
    setRegisterLoading(true);
    try {
      await authApi.register({
        full_name: registerForm.full_name,
        email: registerForm.email,
        password: registerForm.password,
        role: registerForm.role,
      });
      setRegisterSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setRegisterLoading(false);
    }
  };

  // Handle Forgot Password Submit
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await authApi.forgotPassword(forgotEmail);
      setForgotSent(true);
    } catch {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8 animate-[fadeIn_0.2s_ease-out]">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Đóng"
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header (Only for forgot password) */}
        {authModal.view === 'forgot' && (
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Khôi phục mật khẩu</h2>
            <p className="text-sm text-gray-500 mt-1">Nhập email của bạn để nhận liên kết đặt lại mật khẩu</p>
          </div>
        )}

        {/* Tabs: Login / Register (Only shown when not in forgot view) */}
        {authModal.view !== 'forgot' && (
          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthModalView('login');
                setRegisterSuccess(false);
              }}
              className={`flex-1 pb-3 text-sm font-semibold text-center transition-colors relative ${
                authModal.view === 'login'
                  ? 'text-primary-600 border-b-2 border-primary-600 -mb-[1px]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalView('register');
                setRegisterSuccess(false);
              }}
              className={`flex-1 pb-3 text-sm font-semibold text-center transition-colors relative ${
                authModal.view === 'register'
                  ? 'text-primary-600 border-b-2 border-primary-600 -mb-[1px]'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Đăng ký
            </button>
          </div>
        )}

        {/* --- VIEW: LOGIN --- */}
        {authModal.view === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setAuthModalView('forgot')}
                className="text-sm text-primary-600 hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>
            <button type="submit" disabled={loginLoading} className="btn-primary w-full">
              {loginLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>

            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="px-3 text-sm text-gray-500">Hoặc</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Đăng nhập Google thất bại')}
                useOneTap
              />
            </div>

            <p className="text-center text-sm text-gray-500 pt-2">
              Chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => setAuthModalView('register')}
                className="text-primary-600 hover:underline font-medium"
              >
                Đăng ký ngay
              </button>
            </p>
          </form>
        )}

        {/* --- VIEW: REGISTER --- */}
        {authModal.view === 'register' && (
          registerSuccess ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-3">📧</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Kiểm tra email của bạn</h3>
              <p className="text-sm text-gray-500 mb-6">
                Chúng tôi đã gửi link xác thực đến <strong>{registerForm.email}</strong>. Vui lòng kiểm tra hộp thư để kích hoạt tài khoản.
              </p>
              <button
                type="button"
                onClick={() => {
                  setRegisterSuccess(false);
                  setAuthModalView('login');
                }}
                className="btn-primary w-full"
              >
                Chuyển sang đăng nhập
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Nguyễn Văn A"
                  value={registerForm.full_name}
                  onChange={(e) => setRegisterForm({ ...registerForm, full_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="you@example.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tôi là</label>
                <select
                  className="input-field"
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                >
                  <option value="CANDIDATE">Người tìm việc / Freelancer</option>
                  <option value="EMPLOYER">Nhà tuyển dụng / Doanh nghiệp</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  required
                  className="input-field"
                  placeholder="Tối thiểu 8 ký tự"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                <input
                  type="password"
                  required
                  className="input-field"
                  placeholder="Nhập lại mật khẩu"
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                />
              </div>
              <button type="submit" disabled={registerLoading} className="btn-primary w-full mt-2">
                {registerLoading ? 'Đang xử lý...' : 'Tạo tài khoản'}
              </button>

              <p className="text-center text-sm text-gray-500 pt-1">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => setAuthModalView('login')}
                  className="text-primary-600 hover:underline font-medium"
                >
                  Đăng nhập
                </button>
              </p>
            </form>
          )
        )}

        {/* --- VIEW: FORGOT PASSWORD --- */}
        {authModal.view === 'forgot' && (
          <div>
            {forgotSent ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✉️</div>
                <h3 className="font-semibold text-lg mb-2">Email đã được gửi</h3>
                <p className="text-gray-500 text-sm mb-5">
                  Nếu email <strong>{forgotEmail}</strong> tồn tại trong hệ thống, bạn sẽ nhận được liên kết đặt lại mật khẩu.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotSent(false);
                    setAuthModalView('login');
                  }}
                  className="btn-primary w-full"
                >
                  Về trang đăng nhập
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email đăng ký</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={forgotLoading} className="btn-primary w-full">
                  {forgotLoading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
                </button>
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthModalView('login')}
                    className="text-sm text-primary-600 hover:underline font-medium"
                  >
                    ← Quay lại đăng nhập
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
