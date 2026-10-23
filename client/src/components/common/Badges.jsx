import Icon from '@/components/common/Icon';
import { CHIP } from '@/utils/colors';

// Thẻ kỹ năng (một tông xanh thương hiệu)
export function SkillTag({ name, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ring-1 ring-inset ${CHIP} ${className}`}>
      {name}
    </span>
  );
}

const WORK_TYPES = {
  FULL_TIME: { label: 'Full-time', icon: 'briefcase' },
  PART_TIME: { label: 'Part-time', icon: 'clock' },
  REMOTE: { label: 'Remote', icon: 'globe' },
  FREELANCE: { label: 'Freelance', icon: 'sparkles' },
};

// Hình thức làm việc: cùng một tông, phân biệt bằng icon
export function WorkTypeBadge({ type, className = '' }) {
  const t = WORK_TYPES[type];
  if (!t) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset bg-slate-50 text-slate-700 ring-slate-200 ${className}`}>
      <Icon name={t.icon} className="w-3.5 h-3.5 text-primary-600" />{t.label}
    </span>
  );
}

// Mức lương / thù lao nổi bật (chữ đậm, nền xanh nhạt)
export function SalaryPill({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 text-sm font-bold ring-1 ring-inset ring-primary-200 ${className}`}>
      <Icon name="cash" className="w-4 h-4" />{children}
    </span>
  );
}
