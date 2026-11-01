import { Outlet, Link } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Icon from '@/components/common/Icon';
import Logo from '@/components/common/Logo';
import SupportWidget from '@/components/common/SupportWidget';
import { useAuth } from '@/contexts/AuthContext';
import { SUPPORT, telHref, zaloHref, mailHref } from '@/config/support';

const linkCls = 'text-[15px] text-white hover:underline underline-offset-4 transition-colors text-left';

// Liên kết trong footer: đã đăng nhập thì đi thẳng tới trang, chưa đăng nhập thì mở hộp thoại đăng ký/đăng nhập
function FooterLink({ to, user, onGuest, children }) {
  if (!to || user) return <Link to={to || '/'} className={linkCls}>{children}</Link>;
  return <button type="button" onClick={onGuest} className={linkCls}>{children}</button>;
}

const ContactRow = ({ icon, href, children }) => (
  <li>
    <a href={href} className="group inline-flex items-center gap-3 text-[15px] text-white hover:underline underline-offset-4">
      <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-white/25">
        <Icon name={icon} className="w-[18px] h-[18px]" />
      </span>
      {children}
    </a>
  </li>
);

export default function PublicLayout() {
  const { user, openLoginModal, openRegisterModal } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar topBar />
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer màu thương hiệu bo tròn hai góc trên, thanh bản quyền nền sáng hơn ở dưới cùng */}
      <footer className="mt-4 bg-primary-600 text-white rounded-t-[2.5rem] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-10 gap-y-10">
            {/* Thương hiệu + liên hệ */}
            <div className="sm:col-span-2 lg:col-span-4">
              <Logo variant="light" size="lg" />
              <p className="mt-5 text-[15px] leading-relaxed text-white max-w-md">
                Nền tảng kết nối nhân sự IT với việc làm và dự án thực tế — làm việc, nghiệm thu và được đánh giá năng lực ngay trên một nơi.
              </p>
              <h4 className="mt-7 text-xl font-bold">Liên hệ để được hỗ trợ</h4>
              <ul className="mt-4 space-y-3">
                <ContactRow icon="phone" href={telHref(SUPPORT.hotline)}>Hotline: {SUPPORT.hotline}</ContactRow>
                <ContactRow icon="mail" href={mailHref(SUPPORT.email)}>{SUPPORT.email}</ContactRow>
                <li className="inline-flex items-center gap-3 text-[15px]">
                  <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Icon name="clock" className="w-[18px] h-[18px]" />
                  </span>
                  {SUPPORT.hours}
                </li>
              </ul>
              <a
                href={zaloHref(SUPPORT.zalo)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-primary-700 text-sm font-bold shadow-md hover:bg-primary-50 transition-colors"
              >
                <Icon name="chat" className="w-5 h-5" />Nhắn tin Zalo hỗ trợ
              </a>
            </div>

            {/* Khám phá */}
            <div className="lg:col-span-2">
              <h4 className="text-xl font-bold mb-5">Khám phá</h4>
              <ul className="space-y-3 flex flex-col items-start">
                <li><Link to="/" className={linkCls}>Trang chủ</Link></li>
                <li><Link to="/jobs" className={linkCls}>Việc làm</Link></li>
                <li><Link to="/projects" className={linkCls}>Dự án thời vụ</Link></li>
              </ul>
            </div>

            {/* Ứng viên */}
            <div className="lg:col-span-3">
              <h4 className="text-xl font-bold mb-5">Ứng viên</h4>
              <ul className="space-y-3 flex flex-col items-start">
                <li><FooterLink to="/candidate/profile" user={user} onGuest={openRegisterModal}>Tạo hồ sơ năng lực</FooterLink></li>
                <li><Link to="/projects" className={linkCls}>Ứng tuyển dự án thời vụ</Link></li>
                <li><FooterLink to="/candidate/workspaces" user={user} onGuest={openLoginModal}>Workspace của tôi</FooterLink></li>
              </ul>
            </div>

            {/* Nhà tuyển dụng */}
            <div className="lg:col-span-3">
              <h4 className="text-xl font-bold mb-5">Nhà tuyển dụng</h4>
              <ul className="space-y-3 flex flex-col items-start">
                <li><FooterLink to="/employer/jobs" user={user} onGuest={openRegisterModal}>Đăng tin tuyển dụng</FooterLink></li>
                <li><FooterLink to="/employer/candidates" user={user} onGuest={openLoginModal}>Tìm kiếm ứng viên IT</FooterLink></li>
                <li><FooterLink to="/employer/jobs" user={user} onGuest={openLoginModal}>Quản lý tin & hồ sơ ứng tuyển</FooterLink></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-1 sm:gap-4 text-sm text-white text-center sm:text-left">
            <p>© 2026 <strong>DevHub</strong> – Nền tảng kết nối nhân sự IT</p>
            <p>Đồ án tiểu luận chuyên ngành · Khoa Công nghệ Thông tin, ĐH Công nghệ Kỹ thuật TP.HCM</p>
          </div>
        </div>
      </footer>

      <SupportWidget />
    </div>
  );
}
