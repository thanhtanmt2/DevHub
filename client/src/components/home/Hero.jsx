import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/common/Icon';
import CountUp from '@/components/home/CountUp';
import NetworkGlobe from '@/components/home/NetworkGlobe';
import CircuitLines from '@/components/home/CircuitLines';
import { PROVINCES, LOCATION_ANYWHERE } from '@/utils/jobMeta';

const SEARCH_TYPES = [
  { key: 'jobs', label: 'Việc làm', path: '/jobs' },
  { key: 'projects', label: 'Dự án thời vụ', path: '/projects' },
];

const STATS = [
  { key: 'open_jobs', label: 'Việc làm đang mở' },
  { key: 'companies', label: 'Doanh nghiệp xác thực' },
  { key: 'project_jobs', label: 'Dự án thời vụ' },
  { key: 'candidates', label: 'Ứng viên' },
];

const inDelay = (s) => ({ animationDelay: `${s}s` });

// Phần đầu trang: lời chào, ô tìm kiếm, kỹ năng phổ biến, số liệu — trên nền động "kết nối" (địa cầu + mạch điện phát tia sáng)
export default function Hero({ overview }) {
  const navigate = useNavigate();
  const { user, isAdmin, isCandidate, isEmployer, openRegisterModal } = useAuth();
  const [type, setType] = useState('jobs');
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');

  const stats = overview?.stats;
  const skills = overview?.top_skills || [];
  const dashboardLink = isAdmin() ? '/admin' : isCandidate() ? '/candidate' : isEmployer() ? '/employer' : '/';

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (type === 'jobs' && location) params.set('location', location);
    const qs = params.toString();
    navigate(`${SEARCH_TYPES.find((t) => t.key === type).path}${qs ? `?${qs}` : ''}`);
  };

  return (
    // Nền lấy từ bảng màu thương hiệu (primary) như header/footer — không ghi cứng mã màu để hai bên không bao giờ lệch nhau
    <section className="relative isolate overflow-hidden rounded-b-[2.5rem] text-white bg-primary-600">
      {/* Quầng sáng phía quả địa cầu để tia sáng nổi bật */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_80%_at_74%_46%,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_72%)]"
        aria-hidden="true"
      />
      {/* Nền động (chỉ trang trí): mạch điện lan ra từ quả địa cầu, các tia sáng nối người dùng khắp thế giới */}
      <div
        className="pointer-events-none select-none absolute aspect-square -right-32 top-4 w-[430px] opacity-50 sm:-right-20 sm:w-[540px] sm:opacity-70 lg:right-[-5%] lg:top-1/2 lg:-translate-y-1/2 lg:w-[min(60vw,900px)] lg:opacity-100"
        aria-hidden="true"
      >
        <CircuitLines className="absolute inset-0 w-full h-full" />
        <NetworkGlobe className="absolute inset-0" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="max-w-2xl lg:max-w-[610px] min-w-0">
          <span className="animate-hero-in inline-flex items-center gap-2 max-w-full px-3.5 py-1.5 rounded-full bg-white/15 border border-white/30 text-white text-xs font-semibold backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse-dot-light flex-shrink-0" />
            <span className="truncate">{user ? `Xin chào, ${user.full_name || user.email}` : 'Nền tảng dành riêng cho nhân sự IT'}</span>
          </span>

          <h1 className="animate-hero-in mt-5 text-4xl sm:text-5xl lg:text-[3.1rem] font-extrabold tracking-tight leading-[1.12] text-white text-balance" style={inDelay(0.08)}>
            Tìm việc làm IT <span className="relative whitespace-nowrap after:content-[''] after:absolute after:inset-x-0 after:-bottom-0.5 after:h-2.5 after:rounded-full after:bg-white/30 after:-z-10">phù hợp</span> với kỹ năng của bạn
          </h1>
          <p className="animate-hero-in mt-5 text-lg text-white max-w-xl" style={inDelay(0.16)}>
            Việc làm từ doanh nghiệp đã xác thực và dự án thời vụ thực tế — làm việc, nghiệm thu và nhận đánh giá năng lực ngay trên DevHub.
          </p>

          {/* Tìm kiếm */}
          <div className="animate-hero-in mt-8" style={inDelay(0.24)}>
            <div className="inline-flex p-1 rounded-xl bg-white/15 border border-white/30" role="tablist" aria-label="Loại cơ hội">
              {SEARCH_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={type === t.key}
                  onClick={() => setType(t.key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${type === t.key ? 'bg-white text-primary-700 shadow' : 'text-white hover:bg-white/15'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSearch} className="mt-3 bg-white rounded-2xl p-2 shadow-2xl shadow-primary-900/30 flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1 min-w-0">
                <Icon name="search" className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  aria-label="Từ khóa tìm kiếm"
                  placeholder={type === 'jobs' ? 'Vị trí, công nghệ, công ty...' : 'Tên dự án, công nghệ...'}
                  className="w-full h-12 pl-11 pr-3 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/40"
                />
              </div>
              {type === 'jobs' && (
                <div className="relative sm:w-48 sm:border-l sm:border-slate-200">
                  <Icon name="mapPin" className="w-4 h-4 text-primary-600 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    aria-label="Địa điểm"
                    className="w-full h-12 pl-9 pr-8 rounded-xl text-slate-800 text-sm font-medium bg-white outline-none focus:ring-2 focus:ring-primary-500/40 appearance-none cursor-pointer"
                  >
                    <option value="">Tất cả địa điểm</option>
                    <option value={LOCATION_ANYWHERE}>Toàn quốc / Remote</option>
                    <optgroup label="Tỉnh / Thành phố">
                      {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                    </optgroup>
                  </select>
                  <Icon name="chevronDown" className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
              <button type="submit" className="btn-primary h-12 px-6 text-base">Tìm kiếm</button>
            </form>
          </div>

          {/* Kỹ năng được yêu cầu nhiều */}
          {skills.length > 0 && (
            <div className="animate-hero-in mt-5 flex flex-wrap items-center gap-2 text-sm" style={inDelay(0.32)}>
              <span className="text-white">Phổ biến:</span>
              {skills.slice(0, 5).map((s) => (
                <Link
                  key={s.id}
                  to={`/jobs?skill_id=${s.id}`}
                  className="px-3 py-1 rounded-full bg-white/15 border border-white/30 text-white hover:bg-white hover:text-primary-700 transition-colors"
                >
                  {s.name}
                </Link>
              ))}
            </div>
          )}

          <div className="animate-hero-in mt-4 text-sm text-white" style={inDelay(0.38)}>
            {user ? (
              <Link to={dashboardLink} className="inline-flex items-center gap-1.5 font-semibold underline underline-offset-4 hover:no-underline">
                Vào Dashboard<Icon name="arrowRight" className="w-4 h-4" />
              </Link>
            ) : (
              <>Bạn là doanh nghiệp?{' '}
                <button type="button" onClick={() => openRegisterModal('EMPLOYER')} className="font-semibold underline underline-offset-4 hover:no-underline">
                  Đăng ký tuyển dụng
                </button>
              </>
            )}
          </div>

          {/* Số liệu */}
          <dl className="animate-hero-in mt-9 pt-7 border-t border-white/30 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5" style={inDelay(0.46)}>
            {STATS.map((s) => (
              // dt (nhãn) đứng trước dd (giá trị) trong HTML cho đúng ngữ nghĩa; flex-col-reverse để số hiện phía trên nhãn
              <div key={s.key} className="flex flex-col-reverse justify-end">
                <dt className="mt-1.5 text-sm text-white">{s.label}</dt>
                <dd className="text-3xl font-extrabold text-white leading-none">
                  {stats ? <CountUp value={stats[s.key] || 0} /> : <span className="inline-block h-8 w-14 rounded-md bg-white/25 align-middle" />}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
