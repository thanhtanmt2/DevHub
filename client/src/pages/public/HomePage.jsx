import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { user, openRegisterModal } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
          Nền tảng kết nối nhân sự <span className="text-primary-600">IT</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Tìm kiếm cơ hội Freelance, Remote & Part-time trong lĩnh vực Công nghệ thông tin.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/projects" className="btn-primary px-8 py-3 text-base">Tìm dự án thời vụ</Link>
          <Link to="/jobs" className="btn-secondary px-8 py-3 text-base">Tìm việc công ty</Link>
          {!user && (
            <button
              type="button"
              onClick={openRegisterModal}
              className="btn-secondary px-8 py-3 text-base"
            >
              Đăng ký miễn phí
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
