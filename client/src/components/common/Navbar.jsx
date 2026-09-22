import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAdmin, isCandidate, isEmployer, openLoginModal, openRegisterModal } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất');
    navigate('/');
  };

  const getDashboardLink = () => {
    if (isAdmin()) return '/admin';
    if (isCandidate()) return '/candidate';
    if (isEmployer()) return '/employer';
    return '/';
  };

  return (
    <nav className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            DevHub
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/projects" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              Dự án thời vụ
            </Link>
            <Link to="/jobs" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              Tuyển dụng công ty
            </Link>
            {user ? (
              <>
                <Link to={getDashboardLink()} className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn-secondary text-sm">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={openRegisterModal}
                  className="btn-primary text-sm"
                >
                  Đăng ký
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

