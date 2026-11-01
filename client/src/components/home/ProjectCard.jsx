import { Link } from 'react-router-dom';
import Icon, { IconBadge } from '@/components/common/Icon';
import { SkillTag } from '@/components/common/Badges';
import SaveJobButton from '@/components/job/SaveJobButton';
import { deadlineInfo, formatMoney } from '@/utils/jobMeta';

// Thẻ vị trí dự án thời vụ (trang chủ, dashboard ứng viên): tên vị trí, dự án, thù lao, hạn nộp, kỹ năng
export default function ProjectCard({ job }) {
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
        <SaveJobButton type="project" id={job.id} className="-mt-1 -mr-1" />
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
