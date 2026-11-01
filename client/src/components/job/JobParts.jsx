import Icon from '@/components/common/Icon';
import CompanyLogo from '@/components/common/CompanyLogo';
import { SkillTag } from '@/components/common/Badges';
import { deadlineInfo, formatDate } from '@/utils/jobMeta';
import { APPLICATION_STATUS_LABELS } from '@/utils/applicationStatus';
import { timeAgo } from '@/utils/timeAgo';

// Chip hạn nộp hồ sơ: còn bao nhiêu ngày / đã hết hạn
const DEADLINE_STYLE = {
  ok: 'bg-slate-50 text-slate-600 ring-slate-200',
  soon: 'bg-amber-50 text-amber-700 ring-amber-200',
  expired: 'bg-red-50 text-red-600 ring-red-200',
  none: 'bg-slate-50 text-slate-500 ring-slate-200',
};
export function DeadlineChip({ deadline, className = '' }) {
  const info = deadlineInfo(deadline);
  const label = info.key === 'none' ? 'Nhận hồ sơ không giới hạn' : info.expired ? `Hết hạn ${formatDate(deadline)}` : `${info.text} · ${formatDate(deadline)}`;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${DEADLINE_STYLE[info.key]} ${className}`}>
      <Icon name="clock" className="w-3.5 h-3.5" />{label}
    </span>
  );
}

// Một dòng thông tin ngắn có icon (địa điểm, kinh nghiệm...) dùng ở thẻ danh sách
export function MetaItem({ icon, children }) {
  if (!children) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
      <Icon name={icon} className="w-4 h-4 text-slate-400" />{children}
    </span>
  );
}

// Khối nội dung có tiêu đề (Mô tả công việc / Yêu cầu ứng viên / Quyền lợi...)
export function JobSection({ title, children }) {
  if (!children) return null;
  return (
    <section>
      <h3 className="flex items-center gap-2 font-bold text-slate-900 text-base mb-3">
        <span className="w-1 h-5 rounded-full bg-primary-500" />{title}
      </h3>
      <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{children}</div>
    </section>
  );
}

// Bảng "Thông tin chung": mỗi phần tử { icon, label, value }, tự bỏ các dòng trống
export function InfoList({ items }) {
  const rows = items.filter((i) => i.value);
  return (
    <dl className="space-y-3.5">
      {rows.map((i) => (
        <div key={i.label} className="flex items-start gap-3">
          <span className="w-9 h-9 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0">
            <Icon name={i.icon} className="w-[18px] h-[18px]" />
          </span>
          <div className="min-w-0">
            <dt className="text-xs text-slate-500">{i.label}</dt>
            <dd className="text-sm font-semibold text-slate-900 break-words">{i.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

// Thẻ thông tin công ty
export function CompanyCard({ company }) {
  if (!company) return null;
  return (
    <div className="flex items-start gap-3">
      <CompanyLogo company={company} className="w-14 h-14 text-xl" />
      <div className="min-w-0">
        <p className="font-bold text-slate-900">{company.name}</p>
        {company.address && (
          <p className="text-xs text-slate-500 mt-1 flex items-start gap-1.5">
            <Icon name="mapPin" className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />{company.address}
          </p>
        )}
        {company.website && (
          <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-700 hover:underline mt-1 inline-flex items-center gap-1.5">
            <Icon name="globe" className="w-3.5 h-3.5" />{company.website}
          </a>
        )}
      </div>
    </div>
  );
}

export function SkillList({ skills = [] }) {
  if (!skills.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((s) => <SkillTag key={s.id} name={s.name} className="!px-3 !py-1 !text-sm" />)}
    </div>
  );
}

// Huy hiệu "Đã ứng tuyển" kèm trạng thái hồ sơ, để ứng viên nhìn là biết ngay (không cần mở chi tiết)
export function AppliedBadge({ application, className = '' }) {
  if (!application) return null;
  const rejected = application.status === 'REJECTED';
  const status = APPLICATION_STATUS_LABELS[application.status];
  return (
    <span
      title={application.applied_at ? `Bạn đã nộp hồ sơ ${timeAgo(application.applied_at)} (${formatDate(application.applied_at)})` : 'Bạn đã nộp hồ sơ'}
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset whitespace-nowrap ${
        rejected ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      } ${className}`}
    >
      <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} />Đã ứng tuyển{status ? ` · ${status}` : ''}
    </span>
  );
}
