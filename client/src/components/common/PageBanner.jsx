import Icon from '@/components/common/Icon';

// Banner đầu trang: luôn dùng màu thương hiệu (xanh) để toàn hệ thống đồng bộ.
// compact: bản thấp hơn, dùng cho các trang quản trị cần nhiều chỗ cho bảng/danh sách.
export default function PageBanner({ title, subtitle, icon, compact = false, children }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-brand-gradient text-white shadow-lift ${compact ? 'p-4 sm:p-5' : 'p-6 sm:p-7'}`}>

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {icon && (
            <span className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-xl bg-white/15 backdrop-blur flex items-center justify-center flex-shrink-0 ring-1 ring-white/25`}>
              <Icon name={icon} className={compact ? 'w-5 h-5' : 'w-6 h-6'} />
            </span>
          )}
          <div className="min-w-0">
            <h1 className={`${compact ? 'text-xl' : 'text-2xl'} font-bold tracking-tight truncate`}>{title}</h1>
            {subtitle && <p className="text-white text-sm mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="flex flex-wrap items-center gap-3 flex-shrink-0">{children}</div>}
      </div>
    </div>
  );
}
