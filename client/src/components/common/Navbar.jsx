import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout, isAdmin, isCandidate, isEmployer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Đã đăng xuất');
    navigate('/login');
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
            <Link to="/jobs" className="text-sm text-gray-600 hover:text-primary-600 transition-colors">
              Tìm việc
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
                <Link to="/login" className="text-sm text-gray-600 hover:text-primary-600">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
