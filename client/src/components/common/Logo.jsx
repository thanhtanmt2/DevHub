import { Link } from 'react-router-dom';

// Logo DevHub: biểu tượng mạch điện (PNG trong suốt) + tên viết bằng chữ, dùng trực tiếp trên nền header/footer,
// không đặt trong khung ảnh trắng.
//  variant="light": chữ và biểu tượng trắng, dùng trên nền màu thương hiệu (thanh trên cùng, hero, footer)
//  variant="dark":  biểu tượng màu thương hiệu + chữ đậm, dùng trên nền sáng (header trắng, trang đăng nhập, quên mật khẩu...)
const SIZES = {
  sm: { mark: 'h-7', text: 'text-lg', gap: 'gap-2' },
  md: { mark: 'h-9', text: 'text-[22px]', gap: 'gap-2.5' },
  lg: { mark: 'h-12', text: 'text-3xl', gap: 'gap-3' },
};

export default function Logo({ variant = 'light', size = 'md', to = '/', className = '' }) {
  const s = SIZES[size] || SIZES.md;
  const light = variant === 'light';
  const content = (
    <>
      <img
        src={light ? '/logo-mark-white.png' : '/logo-mark.png'}
        alt=""
        className={`${s.mark} w-auto flex-shrink-0 select-none`}
        draggable={false}
      />
      <span className={`${s.text} font-extrabold tracking-tight leading-none ${light ? 'text-white' : 'text-slate-900'}`}>
        Dev<span className={light ? 'text-primary-200' : 'text-primary-600'}>Hub</span>
      </span>
    </>
  );
  const cls = `inline-flex items-center ${s.gap} shrink-0 ${className}`;
  if (!to) return <span className={cls}>{content}</span>;
  return (
    <Link
      to={to}
      aria-label="DevHub — Trang chủ"
      className={`${cls} transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 rounded-lg ${light ? 'focus-visible:ring-white/70' : 'focus-visible:ring-primary-500/60'}`}
    >
      {content}
    </Link>
  );
}
