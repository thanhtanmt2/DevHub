import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { jobApi } from '@/api/jobApi';
import { projectJobApi } from '@/api/projectJobApi';
import { skillApi } from '@/api/skillApi';
import Icon, { IconBadge } from '@/components/common/Icon';
import CompanyLogo from '@/components/common/CompanyLogo';
import { SkillTag, WorkTypeBadge, SalaryPill } from '@/components/common/Badges';
import { CHIP } from '@/utils/colors';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);
const jobSalary = (min, max) => {
  if (!min && !max) return 'Thỏa thuận';
  if (min && max) return `${fmt(min)} – ${fmt(max)}đ`;
  return min ? `Từ ${fmt(min)}đ` : `Đến ${fmt(max)}đ`;
};

const FEATURES = [
  { icon: 'briefcase', title: 'Dự án thời vụ', desc: 'Nhận dự án Freelance, Remote, Part-time phù hợp kỹ năng và thời gian của bạn.' },
  { icon: 'building', title: 'Tuyển dụng công ty', desc: 'Ứng tuyển trực tiếp vào các vị trí IT từ doanh nghiệp đã được DevHub xác thực.' },
  { icon: 'board', title: 'Workspace Kanban', desc: 'Nhận việc, cập nhật tiến độ và nộp sản phẩm ngay trên bảng làm việc của dự án.' },
  { icon: 'document', title: 'Hồ sơ & nhiều CV', desc: 'Lưu nhiều bản CV, chọn CV phù hợp cho từng vị trí chỉ với một lần bấm.' },
  { icon: 'star', title: 'Đánh giá năng lực', desc: 'Hoàn thành dự án, nhận điểm đánh giá để nhà tuyển dụng thấy rõ năng lực thực tế.' },
  { icon: 'cash', title: 'Thù lao minh bạch', desc: 'Theo dõi thù lao và trạng thái thanh toán của từng dự án ngay trong hồ sơ.' },
];

const STEPS = [
  { n: 1, title: 'Tạo hồ sơ năng lực', desc: 'Cập nhật kỹ năng, kinh nghiệm và CV để nhà tuyển dụng dễ tìm thấy bạn.' },
  { n: 2, title: 'Ứng tuyển dự án / việc làm', desc: 'Chọn cơ hội phù hợp và theo dõi trạng thái hồ sơ theo thời gian thực.' },
  { n: 3, title: 'Làm việc & nhận đánh giá', desc: 'Hoàn thành công việc trong Workspace, được nghiệm thu và đánh giá năng lực.' },
];

function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="card card-hover !p-5 flex gap-4 group">
      <CompanyLogo company={job.Company} className="w-12 h-12 text-lg" />
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">{job.title}</h3>
        <p className="text-sm text-slate-500 truncate">{job.Company?.name || 'Doanh nghiệp'}</p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <SalaryPill>{jobSalary(job.salary_min, job.salary_max)}</SalaryPill>
          <WorkTypeBadge type={job.work_type} />
        </div>
        {job.Skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.Skills.slice(0, 3).map((s) => <SkillTag key={s.id} name={s.name} />)}
          </div>
        )}
      </div>
    </Link>
  );
}

function ProjectCard({ job }) {
  return (
    <Link to={`/projects/${job.id}`} className="card card-hover !p-5 flex gap-4 group">
      <IconBadge name="folder" size="lg" tone="blue" shape="square" className="!w-12 !h-12" />
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">{job.title}</h3>
        <p className="text-sm text-slate-500 truncate">{job.Project?.name}</p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <SalaryPill>{job.budget ? `${fmt(job.budget)}đ` : 'Thỏa thuận'}</SalaryPill>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset bg-slate-50 text-slate-700 ring-slate-200">
            <Icon name="sparkles" className="w-3.5 h-3.5 text-primary-600" />Dự án thời vụ
          </span>
        </div>
        {job.Skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.Skills.slice(0, 3).map((s) => <SkillTag key={s.id} name={s.name} />)}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { user, openRegisterModal, isAdmin, isCandidate, isEmployer } = useAuth();
  const navigate = useNavigate();
  const dashboardLink = isAdmin() ? '/admin' : isCandidate() ? '/candidate' : isEmployer() ? '/employer' : '/';

  const [searchType, setSearchType] = useState('jobs');
  const [keyword, setKeyword] = useState('');

  const { data: jobsRes } = useQuery({ queryKey: ['home-jobs'], queryFn: () => jobApi.getJobs({ page: 1, limit: 3 }) });
  const { data: projectsRes } = useQuery({ queryKey: ['home-projects'], queryFn: () => projectJobApi.getProjectJobs({ page: 1, limit: 3 }) });
  const { data: skillsRes } = useQuery({ queryKey: ['public-skills'], queryFn: () => skillApi.getPublicSkills() });

  const jobs = jobsRes?.data?.data || [];
  const projects = projectsRes?.data?.data || [];
  const skills = skillsRes?.data?.data || [];
  const totalJobs = jobsRes?.data?.pagination?.total ?? 0;
  const totalProjects = projectsRes?.data?.pagination?.total ?? 0;

  const handleSearch = (e) => {
    e.preventDefault();
    const q = keyword.trim() ? `?keyword=${encodeURIComponent(keyword.trim())}` : '';
    navigate(`/${searchType === 'jobs' ? 'jobs' : 'projects'}${q}`);
  };

  const stats = [
    { icon: 'building', value: totalJobs, label: 'Việc làm đang mở' },
    { icon: 'sparkles', value: totalProjects, label: 'Dự án thời vụ' },
    { icon: 'skills', value: skills.length, label: 'Kỹ năng IT' },
  ];

  return (
    <div>
      {/* ───────── Hero (nền sáng để tách khỏi header/footer xanh) ───────── */}
      <section className="bg-gradient-to-b from-primary-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-14 pb-28 lg:pt-20 lg:pb-32 text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-primary-100 text-primary-700 text-xs font-semibold shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            Nền tảng dành riêng cho nhân sự IT
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
            Kết nối nhân sự <span className="text-primary-600">IT</span><br className="hidden sm:block" /> với cơ hội thực tế
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
            Tìm việc làm, dự án Freelance, Remote & Part-time; làm việc và được đánh giá năng lực ngay trên một nền tảng.
          </p>

          {/* Ô tìm kiếm */}
          <form onSubmit={handleSearch} className="mt-8 bg-white rounded-2xl p-2 shadow-lg shadow-primary-600/10 border border-primary-100 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto text-left">
            <div className="relative sm:w-44 flex-shrink-0">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full h-12 pl-3 pr-8 rounded-xl bg-slate-50 text-slate-800 text-sm font-semibold border-0 focus:ring-2 focus:ring-primary-500/40 outline-none appearance-none cursor-pointer"
                aria-label="Loại cơ hội"
              >
                <option value="jobs">Việc làm</option>
                <option value="projects">Dự án thời vụ</option>
              </select>
              <Icon name="chevronRight" className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
            </div>
            <div className="relative flex-1">
              <Icon name="search" className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Vị trí, công nghệ, công ty..."
                className="w-full h-12 pl-10 pr-3 rounded-xl text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary-500/40"
              />
            </div>
            <button type="submit" className="btn-primary h-12 px-7 text-base">Tìm kiếm</button>
          </form>

          {skills.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-slate-500">Phổ biến:</span>
              {skills.slice(0, 6).map((s) => (
                <Link key={s.id} to={`/jobs?skill_id=${s.id}`}
                  className="px-3 py-1 rounded-full bg-white hover:bg-primary-50 border border-primary-100 text-primary-700 transition-colors">
                  {s.name}
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {user ? (
              <Link to={dashboardLink} className="btn-primary px-6 py-2.5">Vào Dashboard</Link>
            ) : (
              <button type="button" onClick={openRegisterModal} className="btn-primary px-6 py-2.5">Đăng ký miễn phí</button>
            )}
          </div>
        </div>
      </section>

      {/* ───────── Số liệu (đè lên hero) ───────── */}
      <section className="relative z-10 -mt-16 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-lift border border-gray-100 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-4 p-6">
              <IconBadge name={s.icon} tone="blue" size="lg" shape="square" />
              <div>
                <p className="text-3xl font-extrabold text-slate-900 leading-none">{s.value}</p>
                <p className="text-sm text-slate-500 mt-1.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Mới nhất ───────── */}
      {(jobs.length > 0 || projects.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-sm font-semibold text-primary-600">Doanh nghiệp tuyển dụng</p>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Việc làm mới nhất</h2>
                </div>
                <Link to="/jobs" className="text-sm font-semibold text-primary-600 hover:text-primary-700">Xem tất cả →</Link>
              </div>
              <div className="space-y-4">
                {jobs.length ? jobs.map((j) => <JobCard key={j.id} job={j} />) : <p className="text-sm text-slate-400">Chưa có việc làm nào.</p>}
              </div>
            </div>
            <div>
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-sm font-semibold text-primary-600">Freelance · Remote · Part-time</p>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Dự án thời vụ mới nhất</h2>
                </div>
                <Link to="/projects" className="text-sm font-semibold text-primary-600 hover:text-primary-700">Xem tất cả →</Link>
              </div>
              <div className="space-y-4">
                {projects.length ? projects.map((p) => <ProjectCard key={p.id} job={p} />) : <p className="text-sm text-slate-400">Chưa có dự án nào.</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ───────── Khám phá theo kỹ năng ───────── */}
      {skills.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Khám phá theo kỹ năng</h2>
            <p className="mt-2 text-slate-500">Chọn công nghệ bạn giỏi để xem ngay các cơ hội phù hợp</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {skills.slice(0, 16).map((s) => (
              <Link key={s.id} to={`/jobs?skill_id=${s.id}`}
                className={`px-4 py-2 rounded-full text-sm font-semibold ring-1 ring-inset ${CHIP} hover:bg-primary-600 hover:text-white hover:ring-primary-600 hover:-translate-y-0.5 hover:shadow-md transition-all`}>
                {s.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ───────── Tính năng ───────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Mọi thứ bạn cần, trong một nơi</h2>
          <p className="mt-3 text-slate-500">Từ tìm cơ hội đến hoàn thành công việc và được ghi nhận.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="card card-hover !p-6">
              <span className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-lg shadow-primary-600/25">
                <Icon name={f.icon} className="w-6 h-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── 3 bước ───────── */}
      <section className="mt-20 bg-gradient-to-br from-primary-50 via-white to-sky-50 border-y border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Bắt đầu chỉ với 3 bước</h2>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="hidden md:block absolute top-7 left-[16%] right-[16%] border-t-2 border-dashed border-primary-200" />
            {STEPS.map((s) => (
              <div key={s.n} className="relative text-center">
                <span className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center text-xl font-extrabold shadow-lg shadow-primary-600/30 ring-4 ring-white">
                  {s.n}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Kêu gọi hành động ───────── */}
      {!user && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative overflow-hidden rounded-3xl bg-brand-gradient text-white p-8 sm:p-10 shadow-lift">
              <p className="text-sm font-semibold text-white">Dành cho ứng viên</p>
              <h3 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight">Tìm dự án đầu tiên của bạn</h3>
              <ul className="mt-5 space-y-2 text-white text-sm">
                {['Hồ sơ năng lực và nhiều bản CV', 'Làm việc trên bảng Kanban của dự án', 'Nhận đánh giá và thù lao minh bạch'].map((t) => (
                  <li key={t} className="flex items-center gap-2"><Icon name="check" className="w-4 h-4 text-white" strokeWidth={2.5} />{t}</li>
                ))}
              </ul>
              <button type="button" onClick={openRegisterModal} className="btn-light mt-7 px-7 py-3">Đăng ký ứng viên</button>
            </div>
            <div className="relative overflow-hidden rounded-3xl bg-white border-2 border-primary-100 p-8 sm:p-10 shadow-lift">
              <p className="relative text-sm font-semibold text-primary-600">Dành cho nhà tuyển dụng</p>
              <h3 className="relative mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Tìm đúng nhân sự IT cho bạn</h3>
              <ul className="mt-5 space-y-2 text-slate-600 text-sm">
                {['Đăng tin sau khi doanh nghiệp được xác thực', 'Tìm kiếm ứng viên theo kỹ năng và điểm năng lực', 'Quản lý hồ sơ ứng tuyển tập trung'].map((t) => (
                  <li key={t} className="flex items-center gap-2"><Icon name="check" className="w-4 h-4 text-primary-600" strokeWidth={2.5} />{t}</li>
                ))}
              </ul>
              <button type="button" onClick={openRegisterModal} className="btn-primary relative mt-7 px-7 py-3">Đăng ký doanh nghiệp</button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
