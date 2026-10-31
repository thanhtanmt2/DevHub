import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/common/Icon';
import useEscapeKey from '@/hooks/useEscapeKey';
import { SUPPORT, telHref, zaloHref, mailHref } from '@/config/support';

const OPTIONS = [
  { key: 'zalo', icon: 'chat', title: 'Chat Zalo DevHub', sub: 'Nhắn tin nhận tư vấn ngay', href: zaloHref(SUPPORT.zalo), external: true },
  { key: 'hotline', icon: 'phone', title: 'Hotline tư vấn', sub: SUPPORT.hotline, href: telHref(SUPPORT.hotline) },
  { key: 'tech', icon: 'headset', title: 'Hỗ trợ kỹ thuật', sub: SUPPORT.techHotline, href: telHref(SUPPORT.techHotline) },
  { key: 'mail', icon: 'mail', title: 'Gửi email hỗ trợ', sub: SUPPORT.email, href: mailHref(SUPPORT.email, 'Cần hỗ trợ trên DevHub') },
];

// Nút hỗ trợ nổi ở góc phải dưới: có vòng sóng lan ra để gây chú ý, bấm vào mở bảng thông tin liên hệ.
// Đóng bằng nút X, phím Esc hoặc bấm ra ngoài.
export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  useEscapeKey(() => setOpen(false), open);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <div ref={rootRef} className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-3">
      {open && (
        <div
          id="support-panel"
          role="dialog"
          aria-label="Hỗ trợ trực tuyến"
          className="animate-panel-in w-[340px] max-w-[calc(100vw-2.5rem)] rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/10 overflow-hidden"
        >
          <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
            <span className="w-12 h-12 rounded-2xl bg-white text-primary-600 flex items-center justify-center shadow-md flex-shrink-0">
              <Icon name="chat" className="w-6 h-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold leading-tight">Hỗ trợ trực tuyến</p>
              <p className="mt-0.5 text-sm text-white">Luôn sẵn sàng hỗ trợ bạn</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Đóng" className="p-1.5 -mr-1 rounded-full text-white hover:bg-white/20 transition-colors">
              <Icon name="x" className="w-5 h-5" />
            </button>
          </div>

          <ul className="p-3 space-y-2">
            {OPTIONS.map((o) => (
              <li key={o.key}>
                <a
                  href={o.href}
                  target={o.external ? '_blank' : undefined}
                  rel={o.external ? 'noopener noreferrer' : undefined}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-3 transition-all hover:bg-primary-50 hover:border-primary-200 hover:-translate-y-0.5"
                >
                  <span className="w-11 h-11 rounded-xl bg-white text-primary-600 shadow-sm ring-1 ring-slate-100 flex items-center justify-center flex-shrink-0 transition-colors group-hover:bg-primary-600 group-hover:text-white group-hover:ring-primary-600">
                    <Icon name={o.icon} className="w-5 h-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-slate-900">{o.title}</span>
                    <span className="block text-sm text-slate-500 truncate">{o.sub}</span>
                  </span>
                  <Icon name="arrowRight" className="ml-auto w-4 h-4 text-slate-300 transition group-hover:text-primary-600 group-hover:translate-x-0.5" />
                </a>
              </li>
            ))}
          </ul>

          <div className="px-5 py-3 bg-primary-50 text-center">
            <p className="text-[11px] font-bold tracking-widest uppercase text-primary-700">DevHub luôn lắng nghe bạn!</p>
            <p className="mt-0.5 text-xs text-slate-500">{SUPPORT.hours}</p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="support-panel"
        aria-label={open ? 'Đóng hỗ trợ' : 'Mở hỗ trợ trực tuyến'}
        className="relative w-14 h-14 rounded-full bg-primary-600 text-white border-[3px] border-white shadow-xl shadow-primary-900/35 flex items-center justify-center transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300"
      >
        {!open && (
          <>
            <span className="absolute inset-0 rounded-full bg-primary-500 animate-fab-ring pointer-events-none" />
            <span className="absolute inset-0 rounded-full bg-primary-500 animate-fab-ring pointer-events-none" style={{ animationDelay: '1.3s' }} />
          </>
        )}
        <Icon name={open ? 'x' : 'chat'} className="relative w-7 h-7" />
      </button>
    </div>
  );
}
