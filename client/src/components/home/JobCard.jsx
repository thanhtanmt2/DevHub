import { Link } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import CompanyLogo, { brandName } from '@/components/common/CompanyLogo';
import { SkillTag, WorkTypeBadge } from '@/components/common/Badges';
import { deadlineInfo, formatSalaryShort, shortLocation } from '@/utils/jobMeta';
import { timeAgo } from '@/utils/timeAgo';
import SaveJobButton from '@/components/job/SaveJobButton';

const MAX_SKILLS = 3;

// Thẻ việc làm ở trang chủ: logo, vị trí, lương nổi bật, địa điểm, kỹ năng.
// Đề xuất theo hồ sơ chỉ thể hiện qua thứ tự sắp xếp, thẻ không hiện % hay lý do phù hợp.
export default function JobCard({ job }) {
  const skills = job.Skills || [];
  const more = skills.length - MAX_SKILLS;
  const due = deadlineInfo(job.deadline);

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group flex flex-col h-full bg-white rounded-2xl border border-slate-200 p-5 shadow-soft transition-all duration-300 hover:shadow-lift hover:-translate-y-1 hover:border-primary-300"
    >
      <div className="flex items-start gap-3.5">
        <CompanyLogo company={job.Company} className="w-14 h-14 text-lg" />
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary-700 transition-colors">{job.title}</h3>
          <p className="mt-1 text-sm text-slate-500 truncate">{brandName(job.Company?.name) || 'Doanh nghiệp'}</p>
        </div>
        <SaveJobButton type="job" id={job.id} className="-mt-1 -mr-1" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="text-base font-bold text-primary-700">{formatSalaryShort(job.salary_min, job.salary_max)}</span>
        <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
          <Icon name="mapPin" className="w-4 h-4 text-slate-400" />{shortLocation(job.location) || 'Toàn quốc'}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {skills.slice(0, MAX_SKILLS).map((s) => <SkillTag key={s.id} name={s.name} />)}
        {more > 0 && <span className="text-xs font-medium text-slate-400">+{more}</span>}
      </div>

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between gap-2 pt-4 border-t border-slate-100">
          <WorkTypeBadge type={job.work_type} />
          {due.key !== 'none' ? (
            <span className={`inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap ${due.key === 'soon' ? 'text-amber-600' : 'text-slate-500'}`}>
              <Icon name="clock" className="w-3.5 h-3.5" />{due.text}
            </span>
          ) : job.posted_at && <span className="text-xs text-slate-400 whitespace-nowrap">Đăng {timeAgo(job.posted_at)}</span>}
        </div>
      </div>
    </Link>
  );
}

// Khung chờ tải có cùng kích thước với thẻ thật để trang không bị giật
export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-soft" aria-hidden="true">
      <div className="flex items-start gap-3.5">
        <div className="skeleton w-14 h-14 rounded-xl" />
        <div className="flex-1 space-y-2.5 pt-1">
          <div className="skeleton h-4 rounded w-4/5" />
          <div className="skeleton h-3.5 rounded w-2/5" />
        </div>
      </div>
      <div className="skeleton h-5 rounded w-1/2 mt-5" />
      <div className="flex gap-2 mt-4">
        <div className="skeleton h-6 rounded-md w-16" />
        <div className="skeleton h-6 rounded-md w-20" />
        <div className="skeleton h-6 rounded-md w-14" />
      </div>
      <div className="skeleton h-6 rounded-full w-24 mt-8" />
    </div>
  );
}
