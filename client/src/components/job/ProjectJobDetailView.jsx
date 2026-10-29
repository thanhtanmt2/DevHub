import Icon from '@/components/common/Icon';
import {
  EXPERIENCE_LABELS, formatMoney, formatDate, deadlineInfo, postedText,
} from '@/utils/jobMeta';
import { DeadlineChip, JobSection, InfoList, SkillList } from '@/components/job/JobParts';

// "3 tháng 5 ngày" giữa hai ngày; trả về chuỗi rỗng nếu thiếu dữ liệu
function durationText(start, end) {
  if (!start || !end) return '';
  const days = Math.round((new Date(end) - new Date(start)) / 86400000);
  if (!Number.isFinite(days) || days <= 0) return '';
  const months = Math.floor(days / 30);
  const rest = days % 30;
  if (months && rest) return `${months} tháng ${rest} ngày`;
  if (months) return `${months} tháng`;
  return `${days} ngày`;
}

// Chi tiết một vị trí dự án thời vụ (trang chi tiết + khung xem nhanh ở danh sách)
export default function ProjectJobDetailView({ job, action, compact = false }) {
  const project = job.Project;
  const expired = deadlineInfo(job.deadline).expired;
  const closed = job.status !== 'OPEN';
  const duration = durationText(project?.start_date, project?.expected_end_date);

  const info = (
    <InfoList items={[
      { icon: 'clock', label: 'Kinh nghiệm', value: EXPERIENCE_LABELS[job.experience] },
      { icon: 'users', label: 'Số lượng tuyển', value: job.quantity ? `${job.quantity} người` : '' },
      { icon: 'globe', label: 'Hình thức làm việc', value: 'Làm việc từ xa (Remote)' },
      { icon: 'calendar', label: 'Hạn nộp hồ sơ', value: job.deadline ? formatDate(job.deadline) : 'Không giới hạn' },
      { icon: 'history', label: 'Thời gian thực hiện', value: duration },
      { icon: 'check', label: 'Dự kiến hoàn thành', value: project?.expected_end_date ? formatDate(project.expected_end_date) : '' },
      { icon: 'history', label: 'Ngày đăng', value: postedText(job.created_at) },
    ]} />
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset bg-primary-50 text-primary-700 ring-primary-200">
            <Icon name="sparkles" className="w-3.5 h-3.5" />Dự án thời vụ
          </span>
          {closed
            ? <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">Đã đóng</span>
            : <DeadlineChip deadline={job.deadline} />}
        </div>
        <h1 className={`${compact ? 'text-xl' : 'text-2xl sm:text-3xl'} font-extrabold text-slate-900 tracking-tight`}>{job.title}</h1>
        {project && (
          <p className="mt-1 text-primary-700 font-semibold flex items-center gap-1.5">
            <Icon name="folder" className="w-4 h-4" />Dự án: {project.name}
          </p>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: 'cash', label: 'Thù lao vị trí', value: formatMoney(job.budget), strong: true },
            { icon: 'globe', label: 'Hình thức', value: 'Làm việc từ xa' },
            { icon: 'clock', label: 'Kinh nghiệm', value: EXPERIENCE_LABELS[job.experience] || 'Không yêu cầu' },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-3 rounded-xl bg-primary-50/60 border border-primary-100 px-4 py-3">
              <span className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center flex-shrink-0">
                <Icon name={t.icon} className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-slate-500">{t.label}</p>
                <p className={`font-bold truncate ${t.strong ? 'text-primary-700 text-base' : 'text-slate-900 text-sm'}`}>{t.value}</p>
              </div>
            </div>
          ))}
        </div>

        {action && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {action}
            {expired && !closed && <span className="text-sm text-red-600 font-medium">Vị trí đã hết hạn nộp hồ sơ</span>}
          </div>
        )}
      </div>

      <div className={compact ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'}>
        <div className={`${compact ? '' : 'lg:col-span-2 card !p-6'} space-y-7`}>
          <JobSection title="Mô tả công việc">{job.description || 'Chưa có mô tả chi tiết cho vị trí này.'}</JobSection>
          <JobSection title="Yêu cầu ứng viên">{job.requirements}</JobSection>
          <JobSection title="Quyền lợi được hưởng">{job.benefits}</JobSection>
          {job.Skills?.length > 0 && (
            <section>
              <h3 className="flex items-center gap-2 font-bold text-slate-900 text-base mb-3">
                <span className="w-1 h-5 rounded-full bg-primary-500" />Kỹ năng yêu cầu
              </h3>
              <SkillList skills={job.Skills} />
            </section>
          )}
        </div>

        <aside className={`space-y-6 ${compact ? '' : 'lg:sticky lg:top-20'}`}>
          <div className="card !p-5">
            <h3 className="font-bold text-slate-900 mb-4">Thông tin chung</h3>
            {info}
          </div>
          {project && (
            <div className="card !p-5">
              <h3 className="font-bold text-slate-900 mb-3">Về dự án</h3>
              <p className="font-semibold text-primary-700">{project.name}</p>
              <p className="text-xs text-slate-500 mt-1">Ngân sách dự án: <strong className="text-slate-700">{formatMoney(project.budget)}</strong></p>
              {project.description && (
                <p className="text-sm text-slate-600 leading-relaxed mt-3 pt-3 border-t border-slate-100 whitespace-pre-line">{project.description}</p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
