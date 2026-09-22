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
          <Link to="/jobs" className="btn-primary px-8 py-3 text-base">Tìm việc ngay</Link>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[{icon:'💼', title:'Việc làm IT chất lượng', desc:'Kết nối với hàng trăm cơ hội từ các doanh nghiệp uy tín'},
          {icon:'⭐', title:'Hồ sơ được xác thực', desc:'Điểm năng lực được đánh giá từ dự án thực chiến, không chỉ tự khai báo'},
          {icon:'🚀', title:'Workspace tích hợp', desc:'Quản lý dự án, giao việc và nghiệm thu ngay trên nền tảng'}
        ].map((item, i) => (
          <div key={i} className="card text-center">
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
            <p className="text-gray-500 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
