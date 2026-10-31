import Icon from '@/components/common/Icon';

// Bố cục lọc kiểu TopCV cho trang danh sách (Việc làm / Dự án thời vụ):
//  - SearchBand: dải màu thương hiệu phía trên với từ khóa + (địa điểm / kỹ năng) + nút Tìm kiếm
//  - FilterSidebar: "Lọc nâng cao" bên trái, dính khi cuộn, gồm các nhóm lựa chọn
//  - ResultsHeader: số kết quả + sắp xếp (kèm nút mở bộ lọc trên điện thoại)

// Ô chọn nằm trong dải tìm kiếm (có icon bên trái)
export function BandSelect({ icon, className = '', children, ...props }) {
  return (
    <div className={`relative md:w-60 ${className}`}>
      {icon && <Icon name={icon} className="w-4 h-4 text-primary-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />}
      <select
        {...props}
        className="w-full h-12 pl-10 pr-8 rounded-xl bg-white text-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-white/70 appearance-none cursor-pointer"
      >
        {children}
      </select>
      <Icon name="chevronDown" className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

export function SearchBand({ title, keyword, onKeyword, onSubmit, placeholder, children }) {
  return (
    <section className="rounded-3xl bg-brand-gradient p-3 sm:p-4 shadow-lift">
      <h1 className="px-1 pb-2.5 text-lg sm:text-xl font-extrabold tracking-tight text-white">{title}</h1>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }} className="flex flex-col md:flex-row gap-2">
        <div className="relative flex-1 min-w-0">
          <Icon name="search" className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            className="w-full h-12 pl-11 pr-3 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-white/70"
            aria-label="Từ khóa tìm kiếm"
            placeholder={placeholder}
            value={keyword}
            onChange={(e) => onKeyword(e.target.value)}
          />
        </div>
        {children}
        <button type="submit" className="h-12 px-9 rounded-xl bg-primary-800 hover:bg-primary-900 text-white text-base font-bold shadow-lg shadow-primary-900/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80">Tìm kiếm</button>
      </form>
    </section>
  );
}

// Khung "Lọc nâng cao". Từ lg trở lên luôn hiện và dính bên trái; điện thoại chỉ hiện khi `open`.
export function FilterSidebar({ open, activeCount = 0, onReset, children }) {
  return (
    <aside className={`${open ? 'block' : 'hidden'} lg:block`}>
      <div className="lg:sticky lg:top-24 rounded-2xl bg-white border border-slate-200 shadow-soft overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-primary-50 border-b border-primary-100">
          <h2 className="flex items-center gap-2 font-bold text-slate-900"><Icon name="skills" className="w-5 h-5 text-primary-700" />Lọc nâng cao</h2>
          {activeCount > 0 && (
            <button type="button" onClick={onReset} className="text-sm font-semibold text-primary-700 hover:underline">Xóa lọc ({activeCount})</button>
          )}
        </div>
        <div className="p-4 space-y-5 lg:max-h-[calc(100vh-10.5rem)] overflow-y-auto">{children}</div>
      </div>
    </aside>
  );
}

export function FilterGroup({ title, children }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold text-slate-900">{title}</legend>
      {children}
    </fieldset>
  );
}

// Danh sách chọn một (radio), dòng đầu thường là "Tất cả"
export function RadioList({ name, value, onChange, options }) {
  return (
    <div className="space-y-0.5">
      {options.map((o) => (
        <label key={String(o.value)} className={`flex items-center gap-2.5 px-2 py-1.5 -mx-2 rounded-lg cursor-pointer text-sm transition-colors ${value === o.value ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}>
          <input type="radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)} className="w-4 h-4 accent-primary-600" />
          {o.label}
        </label>
      ))}
    </div>
  );
}

export const sideSelectCls = 'w-full h-10 px-3 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400';

// Dòng đầu danh sách kết quả: số kết quả bên trái, sắp xếp bên phải; trên điện thoại có thêm nút mở bộ lọc
export function ResultsHeader({ count, sort, sortOptions, onSort, onToggleFilters, filtersOpen, activeCount = 0 }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-3">
      <p className="text-sm text-slate-600">{count}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleFilters}
          aria-expanded={filtersOpen}
          className={`lg:hidden h-9 px-3 rounded-full border text-sm font-semibold inline-flex items-center gap-1.5 ${filtersOpen || activeCount ? 'border-primary-300 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-700'}`}
        >
          <Icon name="skills" className="w-4 h-4" />Bộ lọc
          {activeCount > 0 && <span className="min-w-4 h-4 px-1 rounded-full bg-primary-600 text-white text-[10px] leading-4 text-center">{activeCount}</span>}
        </button>
        <label className="inline-flex items-center gap-2 text-sm text-slate-500">
          <span className="hidden sm:inline">Sắp xếp theo:</span>
          <select
            aria-label="Sắp xếp"
            value={sort}
            onChange={(e) => onSort(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-full bg-white border border-slate-200 text-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            {sortOptions.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
          </select>
        </label>
      </div>
    </div>
  );
}
