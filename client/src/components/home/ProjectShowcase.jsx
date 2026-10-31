import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectJobApi } from '@/api/projectJobApi';
import Icon, { IconBadge } from '@/components/common/Icon';
import { SkillTag } from '@/components/common/Badges';
import Reveal from '@/components/home/Reveal';
import SectionHeader from '@/components/home/SectionHeader';
import { deadlineInfo, formatMoney } from '@/utils/jobMeta';

const POINTS = [
  'Freelance · Remote · Part-time linh hoạt',
  'Nhận việc trên bảng Kanban của dự án',
  'Được nghiệm thu và đánh giá từng nhiệm vụ',
];

// Ảnh minh họa Workspace Kanban — mô phỏng đúng bảng thật của DevHub: cột theo trạng thái, nhãn công nghệ, vạch ưu tiên, người nhận việc
// (dữ liệu mẫu để người xem hình dung cách làm việc trên DevHub)
const AVATAR = { An: 'bg-blue-500', Bảo: 'bg-orange-500', Minh: 'bg-emerald-500', Trang: 'bg-violet-500' };
const TAG = {
  PostgreSQL: 'bg-blue-50 text-blue-700 ring-blue-200',
  Postman: 'bg-orange-50 text-orange-700 ring-orange-200',
  React: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  'Node.js': 'bg-green-50 text-green-700 ring-green-200',
  Docker: 'bg-sky-50 text-sky-700 ring-sky-200',
  Figma: 'bg-violet-50 text-violet-700 ring-violet-200',
};
const PRIORITY = {
  high: { label: 'Cao', bar: 'border-l-orange-500', dot: 'bg-orange-500', text: 'text-orange-700' },
  normal: { label: 'Bình thường', bar: 'border-l-amber-400', dot: 'bg-amber-400', text: 'text-amber-700' },
};
const COLUMNS = [
  { key: 'todo', label: 'Cần làm', bg: 'bg-slate-100', dot: 'bg-slate-400', text: 'text-slate-700', cards: [
    { title: 'Thiết kế cơ sở dữ liệu', tag: 'PostgreSQL', who: 'An', prio: 'high' },
    { title: 'Viết tài liệu API', tag: 'Postman', who: 'Bảo', prio: 'normal' },
  ] },
  { key: 'doing', label: 'Đang làm', bg: 'bg-sky-50', dot: 'bg-sky-500', text: 'text-sky-700', cards: [
    { title: 'Dựng giao diện trang chủ', tag: 'React', who: 'Minh', prio: 'high', progress: 65 },
    { title: 'API đăng nhập, phân quyền', tag: 'Node.js', who: 'Trang', prio: 'normal' },
  ] },
  { key: 'done', label: 'Hoàn thành', bg: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-700', cards: [
    { title: 'Khởi tạo dự án và CI/CD', tag: 'Docker', who: 'An', prio: 'normal', done: true },
    { title: 'Thiết kế wireframe', tag: 'Figma', who: 'Bảo', prio: 'normal', done: true },
  ] },
];

function Avatar({ name, className = 'w-6 h-6 text-[10px]' }) {
  return (
    <span className={`${className} rounded-full ${AVATAR[name] || 'bg-primary-500'} text-white font-bold flex items-center justify-center ring-2 ring-white flex-shrink-0`}>
      {name.charAt(0)}
    </span>
  );
}

function KanbanMock() {
  return (
    <div className="relative" aria-hidden="true">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-lift overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <IconBadge name="board" tone="blue" size="sm" shape="square" />
            <p className="text-sm font-semibold text-slate-900 truncate">Workspace · Hệ thống quản lý bán hàng</p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:flex -space-x-1.5">
              {Object.keys(AVATAR).map((n) => <Avatar key={n} name={n} />)}
            </div>
            <span className="text-xs font-bold text-emerald-600">68%</span>
          </div>
        </div>
        <div className="h-1 bg-slate-100"><div className="h-full w-[68%] bg-gradient-to-r from-primary-500 to-emerald-500 animate-grow-x" /></div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 sm:p-4 bg-white">
          {COLUMNS.map((col) => (
            <div key={col.key} className={`rounded-xl ${col.bg} p-2.5 ${col.key === 'todo' ? 'hidden sm:block' : ''}`}>
              <div className="flex items-center gap-2 px-1 mb-2.5">
                <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                <p className={`text-xs font-bold ${col.text}`}>{col.label}</p>
                <span className="ml-auto text-[11px] font-semibold text-slate-500 bg-white rounded-full px-1.5">{col.cards.length}</span>
              </div>
              <div className="space-y-2.5">
                {col.cards.map((c) => {
                  const pr = PRIORITY[c.prio];
                  return (
                    <div key={c.title} className={`rounded-lg bg-white border border-slate-200 border-l-4 ${pr.bar} p-2.5 shadow-sm`}>
                      <p className="text-[13px] font-semibold text-slate-800 leading-snug">{c.title}</p>
                      <p className={`mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium ${pr.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${pr.dot}`} />{pr.label}
                      </p>
                      {c.progress && (
                        <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-sky-500 animate-grow-x" style={{ width: `${c.progress}%`, animationDelay: '0.6s' }} />
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center rounded-md px-2 text-[11px] font-medium ring-1 ring-inset ${TAG[c.tag]}`}>{c.tag}</span>
                        {c.done
                          ? <Icon name="verified" className="w-4 h-4 text-emerald-500" />
                          : <Avatar name={c.who} className="w-5 h-5 text-[9px]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -bottom-7 right-4 sm:right-8 animate-float-slow" style={{ animationDelay: '-2s' }}>
        <div className="inline-flex items-center gap-2.5 rounded-full bg-white border border-emerald-200 shadow-lift pl-2 pr-4 py-2">
          <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center">
            <Icon name="check" className="w-4 h-4" strokeWidth={3} />
          </span>
          <span className="text-sm font-semibold text-slate-800 whitespace-nowrap">Đã nghiệm thu · <span className="text-emerald-600">9/10 điểm</span></span>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ job }) {
  const due = deadlineInfo(job.deadline);
  return (
    <Link
      to={`/projects/${job.id}`}
      className="group flex flex-col h-full bg-white rounded-2xl border border-slate-200 p-5 shadow-soft transition-all duration-300 hover:shadow-lift hover:-translate-y-1 hover:border-primary-300"
    >
      <div className="flex items-start gap-3.5">
        <IconBadge name="folder" tone="blue" size="lg" shape="square" className="!w-12 !h-12" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">{job.title}</h3>
          <p className="mt-1 text-sm text-slate-500 truncate">{job.Project?.name}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <span className="text-base font-bold text-primary-700">{formatMoney(job.budget)}</span>
        {due.key !== 'none' && (
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${due.key === 'soon' ? 'text-amber-600' : 'text-slate-500'}`}>
            <Icon name="clock" className="w-3.5 h-3.5" />{due.text}
          </span>
        )}
      </div>
      {job.Skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.Skills.slice(0, 3).map((s) => <SkillTag key={s.id} name={s.name} />)}
        </div>
      )}
    </Link>
  );
}

// Giới thiệu mảng Dự án thời vụ: ảnh minh họa Workspace + các dự án đang tuyển
export default function ProjectShowcase({ count = 0 }) {
  const { data } = useQuery({
    queryKey: ['home-projects'],
    queryFn: () => projectJobApi.getProjectJobs({ page: 1, limit: 3 }),
    staleTime: 60 * 1000,
  });
  const projects = data?.data?.data || [];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-24">
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        <Reveal className="lg:col-span-5">
          <SectionHeader
            icon="sparkles"
            eyebrow="Dự án thời vụ"
            title="Làm dự án thật, nhận đánh giá thật"
            subtitle="Tham gia dự án, nhận việc theo kỹ năng và tích lũy điểm năng lực ngay trên hồ sơ của bạn."
          />
          <ul className="mt-6 space-y-3">
            {POINTS.map((t) => (
              <li key={t} className="flex items-center gap-3 text-slate-700">
                <span className="w-6 h-6 rounded-full bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0">
                  <Icon name="check" className="w-3.5 h-3.5" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link to="/projects" className="btn-primary px-6 py-3">Khám phá dự án<Icon name="arrowRight" className="w-4 h-4" /></Link>
            {count > 0 && <span className="text-sm text-slate-500"><strong className="text-slate-800">{count}</strong> dự án đang tuyển</span>}
          </div>
        </Reveal>

        <Reveal className="lg:col-span-7 pb-7" delay={120}>
          <KanbanMock />
        </Reveal>
      </div>

      {projects.length > 0 && (
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((job, i) => (
            <Reveal key={job.id} delay={i * 90} className={`h-full ${i === 2 ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
              <ProjectCard job={job} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}
