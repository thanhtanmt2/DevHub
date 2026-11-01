import { createContext, useContext, useEffect, useState } from 'react';
import Icon from '@/components/common/Icon';

// Bố cục lọc kiểu TopCV cho trang danh sách (Việc làm / Dự án thời vụ):
//  - SearchBand: dải màu thương hiệu phía trên với từ khóa + (địa điểm / kỹ năng) + nút Tìm kiếm;
//    dính phía dưới Navbar khi cuộn xuống và tự thu gọn để không chiếm diện tích màn hình.
//  - FilterSidebar: "Lọc nâng cao" bên trái, dính khi cuộn, gồm các nhóm lựa chọn
//  - ResultsHeader: số kết quả + sắp xếp (kèm nút mở bộ lọc trên điện thoại)

const CompactSearchContext = createContext(false);

// Ô chọn nằm trong dải tìm kiếm (có icon bên trái)
export function BandSelect({ icon, className = '', children, ...props }) {
  const compact = useContext(CompactSearchContext);
  return (
    <div className={`relative transition-all duration-200 ${compact ? 'w-36 sm:w-44 md:w-52 shrink-0' : 'md:w-60'} ${className}`}>
      {icon && (
        <Icon
          name={icon}
          className={`text-primary-700 absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 ${
            compact ? 'w-3.5 h-3.5 left-2.5' : 'w-4 h-4 left-3.5'
          }`}
        />
      )}
      <select
        {...props}
        className={`w-full bg-white text-slate-800 font-medium outline-none focus:ring-2 focus:ring-white/70 appearance-none cursor-pointer transition-all duration-200 ${
          compact ? 'h-9 pl-8 pr-7 rounded-lg text-xs sm:text-sm' : 'h-12 pl-10 pr-8 rounded-xl text-sm'
        }`}
      >
        {children}
      </select>
      <Icon
        name="chevronDown"
        className={`text-slate-400 absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 ${
          compact ? 'w-3.5 h-3.5 right-2.5' : 'w-4 h-4 right-3'
        }`}
      />
    </div>
  );
}

export function SearchBand({ title, keyword, onKeyword, onSubmit, placeholder, children }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let rafId = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        const y = window.scrollY;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        // Ngưỡng trễ (hysteresis) để tránh nhấp nháy khi cuộn quanh ranh giới
        setCompact((prev) => {
          if (!prev && y > 60 && scrollable > 220) return true;
          if (prev && y < 12) return false;
          return prev;
        });
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <CompactSearchContext.Provider value={compact}>
      <div
        className={`sticky top-16 md:top-[72px] z-20 transition-all duration-200 ${
          compact ? 'py-1.5 -mx-2 px-2 bg-slate-50/90 backdrop-blur-md' : ''
        }`}
      >
        <section
          className={`bg-brand-gradient transition-all duration-200 ${
            compact ? 'rounded-2xl px-2.5 py-2 sm:px-3.5 sm:py-2 shadow-md' : 'rounded-3xl p-3 sm:p-4 shadow-lift'
          }`}
        >
          <h1
            className={`px-1 font-extrabold tracking-tight text-white overflow-hidden transition-all duration-200 ${
              compact ? 'max-h-0 pb-0 opacity-0 text-sm' : 'max-h-12 pb-2.5 opacity-100 text-lg sm:text-xl'
            }`}
          >
            {title}
          </h1>
          <form
            onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }}
            className={`flex transition-all duration-200 ${
              compact ? 'flex-row items-center gap-1.5 sm:gap-2' : 'flex-col md:flex-row gap-2'
            }`}
          >
            <div className="relative flex-1 min-w-0">
              <Icon
                name="search"
                className={`text-slate-400 absolute top-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200 ${
                  compact ? 'w-4 h-4 left-3' : 'w-5 h-5 left-3.5'
                }`}
              />
              <input
                className={`w-full bg-white text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-white/70 transition-all duration-200 ${
                  compact ? 'h-9 pl-9 pr-2.5 rounded-lg text-sm' : 'h-12 pl-11 pr-3 rounded-xl text-base'
                }`}
                aria-label="Từ khóa tìm kiếm"
                placeholder={placeholder}
                value={keyword}
                onChange={(e) => onKeyword(e.target.value)}
              />
            </div>
            {children}
            <button
              type="submit"
              className={`bg-primary-800 hover:bg-primary-900 text-white font-bold shadow-lg shadow-primary-900/30 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 whitespace-nowrap shrink-0 ${
                compact ? 'h-9 px-3.5 sm:px-5 rounded-lg text-xs sm:text-sm' : 'h-12 px-9 rounded-xl text-base'
              }`}
            >
              Tìm kiếm
            </button>
          </form>
        </section>
      </div>
    </CompactSearchContext.Provider>
  );
}

// Khung "Lọc nâng cao". Từ lg trở lên luôn hiện và dính bên trái; điện thoại chỉ hiện khi `open`.
export function FilterSidebar({ open, activeCount = 0, onReset, children }) {
  return (
    <aside className={`${open ? 'block' : 'hidden'} lg:block`}>
      <div className="lg:sticky lg:top-36 rounded-2xl bg-white border border-slate-200 shadow-soft overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-primary-50 border-b border-primary-100">
          <h2 className="flex items-center gap-2 font-bold text-slate-900"><Icon name="skills" className="w-5 h-5 text-primary-700" />Lọc nâng cao</h2>
          {activeCount > 0 && (
            <button type="button" onClick={onReset} className="text-sm font-semibold text-primary-700 hover:underline">Xóa lọc ({activeCount})</button>
          )}
        </div>
        <div className="p-4 space-y-5 lg:max-h-[calc(100vh-13.5rem)] overflow-y-auto">{children}</div>
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
