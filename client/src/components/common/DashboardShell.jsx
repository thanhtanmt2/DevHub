import { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import Navbar from '@/components/common/Navbar';
import Icon from '@/components/common/Icon';

// Khung chung cho các khu vực Admin / Ứng viên / Nhà tuyển dụng:
// Navbar trên cùng + menu bên hông (trên điện thoại chuyển thành thanh cuộn ngang) + nội dung.
export default function DashboardShell({ title, items }) {
  const { pathname } = useLocation();
  const navRef = useRef(null);
  const [moreRight, setMoreRight] = useState(false);

  // Trên điện thoại menu cuộn ngang: đưa mục đang chọn vào giữa và hiện bóng mờ khi còn mục bị che bên phải
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;
    const update = () => setMoreRight(nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 2);
    const active = nav.querySelector('[aria-current="page"]');
    if (active && nav.scrollWidth > nav.clientWidth) {
      nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
    }
    update();
    nav.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      nav.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-col lg:flex-row flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        <aside className="lg:w-60 lg:flex-shrink-0 min-w-0">
          <div className="relative lg:sticky lg:top-[88px] bg-white rounded-2xl border border-gray-200 shadow-soft p-3">
            <p className="hidden lg:block text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-1 pb-2">
              {title}
            </p>
            <nav ref={navRef} className="relative flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 shadow-[inset_3px_0_0_0_theme(colors.primary.600)]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon name={item.icon} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            {moreRight && (
              <div className="lg:hidden pointer-events-none absolute right-0 top-0 bottom-0 w-12 rounded-r-2xl bg-gradient-to-l from-white via-white/80 to-transparent" />
            )}
          </div>
        </aside>
        <main className="flex-1 min-w-0 animate-fade-in"><Outlet /></main>
      </div>
    </div>
  );
}
