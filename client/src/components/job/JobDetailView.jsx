import Icon from '@/components/common/Icon';
import { WorkTypeBadge } from '@/components/common/Badges';
import {
  WORK_TYPE_LABELS, EXPERIENCE_LABELS, LEVEL_LABELS, formatSalaryShort, formatDate, deadlineInfo, postedText,
} from '@/utils/jobMeta';
import { DeadlineChip, JobSection, InfoList, CompanyCard, SkillList } from '@/components/job/JobParts';

// Chi tiết một tin tuyển dụng (dùng cho trang chi tiết và khung xem nhanh ở danh sách).
// `action` là nút Ứng tuyển do trang cha truyền vào; `compact` = bố cục một cột cho khung xem nhanh.
export default function JobDetailView({ job, action, compact = false }) {
  const expired = deadlineInfo(job.deadline).expired;
  const address = job.work_address || job.location;

  const info = (
    <InfoList items={[
      { icon: 'badge', label: 'Cấp bậc', value: LEVEL_LABELS[job.position_level] },
      { icon: 'clock', label: 'Kinh nghiệm', value: EXPERIENCE_LABELS[job.experience] },
      { icon: 'users', label: 'Số lượng tuyển', value: job.quantity ? `${job.quantity} người` : '' },
      { icon: 'briefcase', label: 'Hình thức làm việc', value: WORK_TYPE_LABELS[job.work_type] },
      { icon: 'calendar', label: 'Hạn nộp hồ sơ', value: job.deadline ? formatDate(job.deadline) : 'Không giới hạn' },
      { icon: 'history', label: 'Ngày đăng', value: postedText(job.posted_at) },
      { icon: 'eye', label: 'Lượt xem', value: job.view_count ? `${job.view_count}` : '' },
    ]} />
  );

  return (
    <div className="space-y-6">
      {/* Đầu tin: tên, công ty, 3 thông tin chính + nút ứng tuyển */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <WorkTypeBadge type={job.work_type} />
          <DeadlineChip deadline={job.deadline} />
        </div>
        <h1 className={`${compact ? 'text-xl' : 'text-2xl sm:text-3xl'} font-extrabold text-slate-900 tracking-tight`}>{job.title}</h1>
        {job.Company && (
          <p className="mt-1 text-primary-700 font-semibold flex items-center gap-1.5">
            <Icon name="building" className="w-4 h-4" />{job.Company.name}
          </p>
        )}

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: 'cash', label: 'Mức lương', value: formatSalaryShort(job.salary_min, job.salary_max), strong: true },
            { icon: 'mapPin', label: 'Địa điểm', value: job.location || 'Toàn quốc / Remote' },
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
            {expired && <span className="text-sm text-red-600 font-medium">Tin đã hết hạn nộp hồ sơ</span>}
          </div>
        )}
      </div>

      <div className={compact ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'}>
        {/* Nội dung chính */}
        <div className={`${compact ? '' : 'lg:col-span-2 card !p-6'} space-y-7`}>
          <JobSection title="Mô tả công việc">{job.description}</JobSection>
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
          <JobSection title="Địa điểm làm việc">
            {address && (
              <span className="flex items-start gap-2"><Icon name="mapPin" className="w-4 h-4 mt-0.5 text-primary-600 flex-shrink-0" />{address}</span>
            )}
          </JobSection>
          <JobSection title="Thời gian làm việc">{job.working_time}</JobSection>
        </div>

        {/* Cột bên: thông tin chung + công ty */}
        <aside className={`space-y-6 ${compact ? '' : 'lg:sticky lg:top-20'}`}>
          <div className="card !p-5">
            <h3 className="font-bold text-slate-900 mb-4">Thông tin chung</h3>
            {info}
          </div>
          {job.Company && (
            <div className="card !p-5">
              <h3 className="font-bold text-slate-900 mb-4">Thông tin công ty</h3>
              <CompanyCard company={job.Company} />
              {job.Company.description && (
                <p className="text-xs text-slate-600 leading-relaxed mt-3 pt-3 border-t border-slate-100 line-clamp-5 whitespace-pre-line">{job.Company.description}</p>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
