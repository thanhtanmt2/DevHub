import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const FEATURES = [
  {
    title: 'Dự án thời vụ',
    desc: 'Nhận các dự án Freelance, Remote, Part-time phù hợp kỹ năng và thời gian của bạn.',
    to: '/projects',
    cta: 'Xem dự án',
    tone: 'bg-blue-50 text-blue-600',
    icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  },
  {
    title: 'Tuyển dụng công ty',
    desc: 'Ứng tuyển trực tiếp vào các vị trí IT từ doanh nghiệp đã được DevHub xác thực.',
    to: '/jobs',
    cta: 'Xem việc làm',
    tone: 'bg-emerald-50 text-emerald-600',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    title: 'Workspace làm việc',
    desc: 'Nhận việc, cập nhật tiến độ và nộp sản phẩm trên bảng Kanban ngay trong hệ thống.',
    to: null,
    cta: null,
    tone: 'bg-violet-50 text-violet-600',
    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  },
];

const STEPS = [
  { n: '1', title: 'Tạo hồ sơ năng lực', desc: 'Cập nhật kỹ năng, kinh nghiệm và CV để nhà tuyển dụng dễ tìm thấy bạn.' },
  { n: '2', title: 'Ứng tuyển dự án / việc làm', desc: 'Chọn cơ hội phù hợp và theo dõi trạng thái hồ sơ theo thời gian thực.' },
  { n: '3', title: 'Làm việc & nhận đánh giá', desc: 'Hoàn thành công việc trong Workspace, được nghiệm thu và đánh giá năng lực.' },
];

export default function HomePage() {
  const { user, openRegisterModal, isAdmin, isCandidate, isEmployer } = useAuth();
  const dashboardLink = isAdmin() ? '/admin' : isCandidate() ? '/candidate' : isEmployer() ? '/employer' : '/';

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-100/60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-violet-100/50 blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-primary-100 text-primary-700 text-xs font-semibold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            Nền tảng dành riêng cho nhân sự IT
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Kết nối nhân sự <span className="text-primary-600">IT</span>
            <br className="hidden sm:block" /> với cơ hội thực tế
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto">
            Tìm kiếm cơ hội Freelance, Remote & Part-time trong lĩnh vực Công nghệ thông tin, làm việc và được đánh giá ngay trên một nền tảng.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/projects" className="btn-primary px-8 py-3 text-base">Tìm dự án thời vụ</Link>
            <Link to="/jobs" className="btn-secondary px-8 py-3 text-base">Tìm việc công ty</Link>
            {user ? (
              <Link to={dashboardLink} className="btn-secondary px-8 py-3 text-base">Vào Dashboard</Link>
            ) : (
              <button type="button" onClick={openRegisterModal} className="btn-secondary px-8 py-3 text-base">
                Đăng ký miễn phí
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Tính năng */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Mọi thứ bạn cần, trong một nơi</h2>
          <p className="mt-3 text-slate-500">Từ tìm cơ hội đến hoàn thành công việc và được ghi nhận.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="card hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
              <span className={`w-12 h-12 rounded-xl flex items-center justify-center ${f.tone}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={f.icon} />
                </svg>
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed flex-1">{f.desc}</p>
              {f.to && (
                <Link to={f.to} className="mt-5 text-sm font-semibold text-primary-600 hover:text-primary-700">
                  {f.cta} →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Quy trình */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Bắt đầu chỉ với 3 bước</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.n} className="text-center">
                <span className="w-12 h-12 mx-auto rounded-full bg-primary-600 text-white flex items-center justify-center text-lg font-bold shadow-md">
                  {s.n}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kêu gọi hành động */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="rounded-3xl bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-12 sm:py-14 text-center shadow-lift">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Sẵn sàng bắt đầu cùng DevHub?</h2>
            <p className="mt-3 text-primary-100">Tạo tài khoản miễn phí để ứng tuyển và nhận dự án ngay hôm nay.</p>
            <button
              type="button"
              onClick={openRegisterModal}
              className="mt-7 inline-flex items-center justify-center px-8 py-3 rounded-lg bg-white text-primary-700 font-semibold shadow-sm hover:shadow-md hover:bg-primary-50 transition-all"
            >
              Đăng ký miễn phí
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
