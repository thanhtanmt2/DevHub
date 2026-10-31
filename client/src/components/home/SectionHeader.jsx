import Icon from '@/components/common/Icon';

// Tiêu đề của một mục ở trang chủ: nhãn nhỏ (có icon) + tiêu đề lớn + (tuỳ chọn) mô tả ngắn và nút/liên kết bên phải
export default function SectionHeader({ eyebrow, icon, title, subtitle, action, center = false }) {
  return (
    <div className={`flex gap-4 ${center ? 'flex-col items-center text-center' : 'flex-col sm:flex-row sm:items-end sm:justify-between'}`}>
      <div className={center ? 'max-w-2xl' : 'min-w-0'}>
        {eyebrow && (
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-700">
            {icon && <Icon name={icon} className="w-4 h-4" />}{eyebrow}
          </p>
        )}
        <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 text-balance">{title}</h2>
        {subtitle && <p className="mt-2 text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
