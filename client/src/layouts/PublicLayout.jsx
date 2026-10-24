import { Outlet, Link } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Icon from '@/components/common/Icon';
import { useAuth } from '@/contexts/AuthContext';

const linkCls = 'text-sm text-white hover:text-white transition-colors text-left';

// Liên kết trong footer: đã đăng nhập thì đi thẳng tới trang, chưa đăng nhập thì mở hộp thoại đăng ký/đăng nhập
function FooterLink({ to, user, onGuest, children }) {
  if (!to || user) return <Link to={to || '/'} className={linkCls}>{children}</Link>;
  return <button type="button" onClick={onGuest} className={linkCls}>{children}</button>;
}

export default function PublicLayout() {
  const { user, openLoginModal, openRegisterModal } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-primary-600 text-white">

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Thương hiệu */}
            <div>
              <Link to="/" className="inline-flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-xl bg-white text-primary-700 flex items-center justify-center font-extrabold text-xl shadow-md">D</span>
                <span className="text-2xl font-bold text-white tracking-tight">DevHub</span>
              </Link>
              <p className="mt-4 text-sm leading-relaxed text-white max-w-xs">
                Nền tảng kết nối nhân sự IT với việc làm và dự án thực tế — làm việc, nghiệm thu và được đánh giá năng lực ngay trên một nơi.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-white">
                {['Dự án thực tế, thù lao minh bạch', 'Workspace Kanban cho từng dự án', 'Doanh nghiệp được xác thực'].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                      <Icon name="check" className="w-3 h-3 text-white" strokeWidth={3} />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            {/* Khám phá */}
            <div>
              <h4 className="text-white font-semibold mb-4">Khám phá</h4>
              <ul className="space-y-3 flex flex-col items-start">
                <li><Link to="/" className={linkCls}>Trang chủ</Link></li>
                <li><Link to="/jobs" className={linkCls}>Việc làm tại doanh nghiệp</Link></li>
                <li><Link to="/projects" className={linkCls}>Dự án thời vụ</Link></li>
              </ul>
            </div>

            {/* Ứng viên */}
            <div>
              <h4 className="text-white font-semibold mb-4">Dành cho ứng viên</h4>
              <ul className="space-y-3 flex flex-col items-start">
                <li><FooterLink to="/candidate/profile" user={user} onGuest={openRegisterModal}>Tạo hồ sơ năng lực</FooterLink></li>
                <li><Link to="/projects" className={linkCls}>Ứng tuyển dự án thời vụ</Link></li>
                <li><FooterLink to="/candidate/workspaces" user={user} onGuest={openLoginModal}>Theo dõi công việc trong Workspace</FooterLink></li>
              </ul>
            </div>

            {/* Nhà tuyển dụng */}
            <div>
              <h4 className="text-white font-semibold mb-4">Dành cho nhà tuyển dụng</h4>
              <ul className="space-y-3 flex flex-col items-start">
                <li><FooterLink to="/employer/jobs" user={user} onGuest={openRegisterModal}>Đăng tin tuyển dụng</FooterLink></li>
                <li><FooterLink to="/employer/candidates" user={user} onGuest={openLoginModal}>Tìm kiếm ứng viên IT</FooterLink></li>
                <li><FooterLink to="/employer/jobs" user={user} onGuest={openLoginModal}>Quản lý tin & hồ sơ ứng tuyển</FooterLink></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-white">
            <p>© 2026 <strong className="text-white">DevHub</strong> – Nền tảng kết nối nhân sự IT</p>
            <p>Được xây dựng cho cộng đồng lập trình viên Việt Nam</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
