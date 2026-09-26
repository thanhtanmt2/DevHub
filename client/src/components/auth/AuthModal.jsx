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
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form visibility state
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);

  // hàm xử lý đăng nhập gg thành công 
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoginLoading(true);
    try {
      // gọi api login google truyền token cho back end xử lý 
      const user = await googleLogin(credentialResponse.credential);
      // lấy danh sách vai trò của user
      const roles = user.Roles?.map((r) => r.name) || [];
      toast.success(`Chào mừng trở lại, ${user.full_name}!`);
      closeAuthModal();

      // kiểm tra xem trước khi đăng nhập user đã cố gắng truy cập vào trang nào khác 
      const from = location.state?.from?.pathname;
      if (from) {
        // replace true để tránh back về trang login sau khi đăng nhập
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
  // hook useState để tạo ra một cấu trúc lưu trữ toàn bộ dữ liệu
  const [registerForm, setRegisterForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CANDIDATE', // mặc định sẽ là ứng viên 
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Đóng cửa sổ bằng phím tắt 
  useEffect(() => {
    // hàm chứa toàn bộ thông tin phím được bấm 
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && authModal.isOpen) {
        closeAuthModal();
      }
    };
    // truyền hàm vào window để lắng nghe sự kiện gõ phím 
    window.addEventListener('keydown', handleKeyDown);
    // gỡ bộ lắng nghe phím khi thoát khỏi Modal 
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

  // Hàm xử lý khi bấm Đăng nhập 
  const handleLoginSubmit = async (e) => {
    e.preventDefault(); // chặn load lại trang web 
    setLoginLoading(true); // bật loading
    try {
      const user = await login(loginForm);
      // gán vai trò của user vào biến roles 
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

  // Hàm xử lý khi bấm Đăng ký 
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
      // gọi hàm API để gửi dữ liệu lên server 
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

  // Hàm xử lý khi bấm gửi link đặt lại mk 
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
      onMouseDown={(e) => {
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
              className={`flex-1 pb-3 text-sm font-semibold text-center transition-colors relative ${authModal.view === 'login'
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
              className={`flex-1 pb-3 text-sm font-semibold text-center transition-colors relative ${authModal.view === 'register'
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
          <form onSubmit={handleLoginSubmit} className="space-y-4" autoComplete="off">
            {/* Hidden dummy inputs để đánh lừa trình duyệt không autofill */}
            <input type="text" style={{ display: 'none' }} />
            <input type="password" style={{ display: 'none' }} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email_devhub"
                autoComplete="new-password"
                required
                className="input-field"
                placeholder="you@example.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  name="password_devhub"
                  autoComplete="new-password"
                  required
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showLoginPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                  checked={loginForm.rememberMe || false}
                  onChange={(e) => setLoginForm({ ...loginForm, rememberMe: e.target.checked })}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                  Lưu mật khẩu
                </label>
              </div>
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
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1" autoComplete="off">
              {/* Hidden dummy inputs để đánh lừa trình duyệt không autofill */}
              <input type="text" style={{ display: 'none' }} />
              <input type="password" style={{ display: 'none' }} />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  name="fullname_devhub"
                  autoComplete="new-password"
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
                  name="email_devhub"
                  autoComplete="new-password"
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
                <div className="relative">
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    name="password_devhub"
                    autoComplete="new-password"
                    required
                    className="input-field pr-10"
                    placeholder="Tối thiểu 8 ký tự"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showRegisterPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showRegisterPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input
                    type={showRegisterConfirmPassword ? 'text' : 'password'}
                    name="confirm_password_devhub"
                    autoComplete="new-password"
                    required
                    className="input-field pr-10"
                    placeholder="Nhập lại mật khẩu"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showRegisterConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showRegisterConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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
