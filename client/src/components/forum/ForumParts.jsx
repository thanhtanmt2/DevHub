import { Link } from 'react-router-dom';
import Avatar from '@/components/common/Avatar';
import Icon from '@/components/common/Icon';
import { RankMedal } from '@/components/candidate/RankBadge';
import { timeAgo } from '@/utils/timeAgo';

export const ROLE_META = {
  ADMIN: { label: 'Quản trị viên', cls: 'bg-red-50 text-red-700 ring-red-200' },
  EMPLOYER: { label: 'Nhà tuyển dụng', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  CANDIDATE: { label: 'Ứng viên', cls: 'bg-primary-50 text-primary-700 ring-primary-200' },
};

export function RoleChip({ role, className = '' }) {
  const m = ROLE_META[role] || ROLE_META.CANDIDATE;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap ${m.cls} ${className}`}>{m.label}</span>;
}

// ─── Màu sắc: mỗi loại thông tin / chuyên mục một màu riêng cho dễ nhận ra ─────────
const TONES = {
  sky: { chip: 'bg-sky-50 text-sky-700 ring-sky-200', icon: 'text-sky-600', tile: 'from-sky-400 to-blue-600' },
  violet: { chip: 'bg-violet-50 text-violet-700 ring-violet-200', icon: 'text-violet-500', tile: 'from-violet-400 to-purple-600' },
  rose: { chip: 'bg-rose-50 text-rose-700 ring-rose-200', icon: 'text-rose-500', tile: 'from-rose-400 to-pink-600' },
  amber: { chip: 'bg-amber-50 text-amber-800 ring-amber-200', icon: 'text-amber-500', tile: 'from-amber-400 to-orange-500' },
  emerald: { chip: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: 'text-emerald-500', tile: 'from-emerald-400 to-teal-600' },
  teal: { chip: 'bg-teal-50 text-teal-700 ring-teal-200', icon: 'text-teal-500', tile: 'from-teal-400 to-cyan-600' },
  yellow: { chip: 'bg-yellow-50 text-yellow-800 ring-yellow-200', icon: 'text-yellow-500', tile: 'from-yellow-300 to-amber-500' },
  indigo: { chip: 'bg-indigo-50 text-indigo-700 ring-indigo-200', icon: 'text-indigo-500', tile: 'from-indigo-400 to-blue-700' },
  slate: { chip: 'bg-slate-100 text-slate-600 ring-slate-200', icon: 'text-slate-400', tile: 'from-slate-400 to-slate-600' },
};

// Biểu tượng chuyên mục: mọi chuyên mục dùng chung hai bong bóng chat dạng viền (kiểu voz).
// variant "bare": chỉ biểu tượng màu cam nhạt (danh sách chuyên mục); "tile": nền kính mờ + biểu tượng trắng (trên banner xanh)
export function CategoryTile({ size = 'md', variant = 'bare', className = '' }) {
  const bare = { lg: 'w-14 h-14', md: 'w-10 h-10', sm: 'w-8 h-8' }[size];
  if (variant === 'tile') {
    return (
      <span className={`${size === 'lg' ? 'w-16 h-16 rounded-2xl' : 'w-10 h-10 rounded-xl'} bg-white/20 ring-1 ring-white/40 text-white flex items-center justify-center flex-shrink-0 ${className}`}>
        <Icon name="commentsOutline" className={size === 'lg' ? 'w-10 h-10' : 'w-6 h-6'} strokeWidth={1.5} />
      </span>
    );
  }
  return <Icon name="commentsOutline" className={`${bare} text-orange-300 flex-shrink-0 ${className}`} strokeWidth={1.5} />;
}

// Số gọn như voz: 6100 → "6,1K"
export const compactNumber = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace('.', ',').replace(/,0$/, '')}K` : String(n));

// Viên thống kê có màu: biểu tượng + số (trả lời, lượt xem, lượt thích...)
export function StatChip({ icon, tone = 'sky', value, label, filled = false, className = '' }) {
  const t = TONES[tone];
  return (
    <span title={label ? `${value} ${label}` : undefined} className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-xs font-bold ring-1 ring-inset whitespace-nowrap ${t.chip} ${className}`}>
      <Icon name={icon} filled={filled} className={`w-4 h-4 ${t.icon}`} strokeWidth={2} />{value}
    </span>
  );
}

// Nhãn trạng thái của chủ đề: Ghim, Khóa, Mới, Nổi bật
export function ThreadBadges({ thread }) {
  const isNew = Date.now() - new Date(thread.created_at).getTime() < 24 * 3600 * 1000;
  const hot = thread.reply_count >= 6 || thread.view_count >= 1000 || thread.like_count >= 16;
  if (!thread.is_pinned && !thread.is_locked && !isNew && !hot) return null; // không có nhãn thì không chừa khoảng trống trước tiêu đề
  const cls = 'inline-flex items-center gap-1 h-5 px-1.5 rounded-md text-[11px] font-bold align-middle whitespace-nowrap';
  return (
    <span className="mr-1.5 inline-flex flex-wrap gap-1 align-middle">
      {thread.is_pinned && <span className={`${cls} bg-amber-100 text-amber-800`}><Icon name="bookmark" filled className="w-3 h-3" />Ghim</span>}
      {thread.is_locked && <span className={`${cls} bg-slate-200 text-slate-700`}><Icon name="lock" className="w-3 h-3" />Khóa</span>}
      {isNew && <span className={`${cls} bg-emerald-100 text-emerald-700`}><Icon name="sparkles" className="w-3 h-3" />Mới</span>}
      {hot && !isNew && <span className={`${cls} bg-orange-100 text-orange-700`}><Icon name="bolt" filled className="w-3 h-3" />Nổi bật</span>}
    </span>
  );
}

// Nội dung bài viết: giữ xuống dòng, khối mã ```...```, tự nhận liên kết http(s). Luôn hiển thị dạng chữ (không chèn HTML) nên an toàn.
const URL_RE = /(https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]])/g;
function Linkified({ text }) {
  const parts = text.split(URL_RE);
  return parts.map((part, i) => (i % 2 === 1
    ? <a key={i} href={part} target="_blank" rel="noopener noreferrer nofollow" className="text-primary-700 underline break-all hover:text-primary-800">{part}</a>
    : <span key={i}>{part}</span>));
}
export function PostContent({ content }) {
  const blocks = String(content || '').split(/```/);
  return (
    <div className="text-[15px] leading-relaxed text-slate-800 break-words">
      {blocks.map((block, i) => (i % 2 === 1
        ? <pre key={i} className="my-2 p-3 rounded-lg bg-slate-900 text-slate-100 text-[13px] leading-snug overflow-x-auto"><code>{block.replace(/^\n/, '')}</code></pre>
        : block ? <p key={i} className="whitespace-pre-wrap"><Linkified text={block} /></p> : null))}
    </div>
  );
}

// Huy hiệu nhỏ ở góc ảnh đại diện: hạng của ứng viên, hoặc biểu tượng vai trò của quản trị viên / nhà tuyển dụng
const ROLE_MEDAL = {
  ADMIN: { grad: 'from-red-500 to-rose-600', icon: 'shield', label: 'Quản trị viên' },
  EMPLOYER: { grad: 'from-emerald-500 to-teal-600', icon: 'building', label: 'Nhà tuyển dụng' },
};
export function AuthorMedal({ author, className = 'w-6 h-6' }) {
  const role = ROLE_MEDAL[author?.role];
  if (role) {
    return (
      <span title={role.label} className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br ${role.grad} text-white ring-2 ring-white shadow ${className}`}>
        <Icon name={role.icon} className="w-[58%] h-[58%]" />
      </span>
    );
  }
  const tier = author?.rank?.tier || author?.rank; // bài viết trả về {key, name}; khung thành viên trả về {tier: {key, name}, ...}
  return tier?.key ? <RankMedal tierKey={tier.key} name={tier.name} className={className} /> : null;
}

// Danh xưng ngắn dưới tên (như "Junior Member" của voz): hạng của ứng viên, công ty của nhà tuyển dụng, "Quản trị viên"
export function memberTitle(m) {
  if (!m) return '';
  if (m.role === 'ADMIN') return 'Quản trị viên';
  if (m.role === 'EMPLOYER') return m.company_name || 'Nhà tuyển dụng';
  return m.rank?.name || m.rank?.tier?.name || 'Ứng viên';
}

// Ảnh đại diện kèm huy hiệu ở góc dưới bên phải
export function AvatarWithMedal({ author, size = 'xl', className = '', medalClassName = 'w-6 h-6' }) {
  return (
    <span className="relative inline-flex flex-shrink-0">
      <Avatar name={author.full_name} src={author.avatar_url} size={size} className={className} />
      <AuthorMedal author={author} className={`absolute -bottom-0.5 -right-0.5 ${medalClassName}`} />
    </span>
  );
}

// Sao chép văn bản vào bộ nhớ tạm (có phương án dự phòng khi trình duyệt không cho dùng Clipboard API)
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      const done = document.execCommand('copy');
      document.body.removeChild(ta);
      return done;
    } catch { return false; }
  }
}

// Cột người đăng cạnh bài (kiểu voz): ảnh lớn có huy hiệu ở góc, tên in đậm màu xanh, danh xưng nhỏ màu xám.
// Bấm vào ảnh / tên (onOpen) để xem đầy đủ thông tin thành viên.
export function AuthorPanel({ author, compact = false, onOpen }) {
  if (!author) return <div className="text-sm text-slate-400">Tài khoản đã bị xóa</div>;
  const open = (children, className = '') => (onOpen
    ? <button type="button" onClick={onOpen} title="Xem thông tin thành viên" aria-label={`Xem thông tin ${author.full_name}`} className={`${className} cursor-pointer`}>{children}</button>
    : <span className={className}>{children}</span>);
  return (
    <div className={compact ? 'flex items-center gap-3' : 'flex md:flex-col items-center md:text-center gap-3 md:gap-2'}>
      {open(
        <AvatarWithMedal
          author={author}
          size={compact ? 'md' : 'xl'}
          className={`ring-2 ring-white shadow-md ${compact ? '' : 'md:!w-20 md:!h-20 md:!text-3xl'}`}
          medalClassName={compact ? 'w-4 h-4' : 'w-6 h-6'}
        />,
        'rounded-full flex-shrink-0 transition hover:ring-4 hover:ring-primary-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-300'
      )}
      <div className="min-w-0 text-left md:text-center">
        {open(<span className="font-bold text-primary-700 leading-tight break-words hover:underline">{author.full_name}</span>)}
        <p className={`mt-0.5 text-xs leading-tight break-words ${author.role === 'ADMIN' ? 'font-semibold text-red-600' : 'text-slate-500'}`}>{memberTitle(author)}</p>
      </div>
    </div>
  );
}

// Một dòng chủ đề: gọn như voz để một trang xem được nhiều chủ đề. Chỉ giữ thông tin cốt lõi (tiêu đề một dòng, người đăng · thời gian,
// Trả lời / Xem, bài mới nhất); nội dung, lượt thích... xem khi bấm vào chủ đề. onOpen: mở ngay tại chỗ (dùng trong workspace).
const POSTS_PER_PAGE = 20; // phải khớp với số bài mỗi trang ở máy chủ
const ROLE_TEXT = { ADMIN: 'text-red-600', EMPLOYER: 'text-emerald-700' };

export function ThreadRow({ thread, showCategory = true, onOpen }) {
  const pages = Math.max(1, Math.ceil((thread.reply_count + 1) / POSTS_PER_PAGE));
  const pageLinks = onOpen || pages < 2 ? [] : Array.from({ length: Math.min(3, pages) }, (_, i) => pages - Math.min(3, pages) + 1 + i); // 3 trang cuối, như voz
  const authorCls = `font-medium ${ROLE_TEXT[thread.author?.role] || 'text-slate-600'}`;
  const title = <span title={thread.title}>{thread.title}</span>;
  return (
    <li
      className={`relative flex items-center gap-3 px-3 sm:px-4 py-2.5 hover:bg-primary-50/40 transition-colors ${onOpen ? 'cursor-pointer' : ''}`}
      {...(onOpen ? { role: 'button', tabIndex: 0, onClick: onOpen, onKeyDown: (e) => { if (e.key === 'Enter') onOpen(); } } : {})}
    >
      <Avatar name={thread.author?.full_name} src={thread.author?.avatar_url} size="md" />

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2 sm:line-clamp-1 break-words">
          <ThreadBadges thread={thread} />
          {onOpen ? title : <Link to={`/forum/t/${thread.id}`} className="hover:text-primary-700 after:absolute after:inset-0">{title}</Link>}
        </h3>
        <p className="mt-0.5 text-xs text-slate-500 flex flex-wrap items-center gap-x-1.5 gap-y-1">
          <span className={authorCls}>{thread.author?.full_name || 'Ẩn danh'}</span>
          <span>· {timeAgo(thread.created_at)}</span>
          {showCategory && thread.category && <span className="hidden sm:inline">· {thread.category.name}</span>}
          {/* Điện thoại: số trả lời / lượt xem ngay trên dòng thông tin */}
          <span className="sm:hidden inline-flex items-center gap-2.5 text-slate-500">
            <span className="inline-flex items-center gap-1"><Icon name="comments" className="w-3.5 h-3.5 text-sky-600" />{thread.reply_count}</span>
            <span className="inline-flex items-center gap-1"><Icon name="eye" className="w-3.5 h-3.5 text-violet-500" />{compactNumber(thread.view_count)}</span>
          </span>
          {pageLinks.length > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1">
              {pageLinks.map((n) => (
                <Link key={n} to={`/forum/t/${thread.id}?page=${n}`} title={`Trang ${n}`} className="relative z-10 min-w-[1.25rem] text-center px-1 rounded bg-slate-100 text-[11px] font-semibold text-slate-500 hover:bg-primary-100 hover:text-primary-700">{n}</Link>
              ))}
            </span>
          )}
        </p>
      </div>

      <dl className="hidden sm:block w-32 flex-shrink-0 text-xs space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <dt className="inline-flex items-center gap-1 text-slate-400"><Icon name="comments" className="w-3.5 h-3.5 text-sky-600" />Trả lời:</dt>
          <dd className="font-bold text-slate-800">{compactNumber(thread.reply_count)}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="inline-flex items-center gap-1 text-slate-400"><Icon name="eye" className="w-3.5 h-3.5 text-violet-500" />Lượt xem:</dt>
          <dd className="font-semibold text-slate-500">{compactNumber(thread.view_count)}</dd>
        </div>
      </dl>

      <div className="hidden lg:flex items-center justify-end gap-2 w-44 flex-shrink-0">
        <div className="min-w-0 text-right text-xs leading-tight">
          <p className="font-medium text-slate-700">{timeAgo(thread.last_post_at)}</p>
          <p className="text-slate-400 truncate">{thread.last_user_name || thread.author?.full_name}</p>
        </div>
        <Avatar name={thread.last_user_name || thread.author?.full_name} src={thread.last_user_avatar || (thread.last_user_name ? null : thread.author?.avatar_url)} size="sm" />
      </div>
    </li>
  );
}

// Phân trang gọn: trang đầu, trang cuối và các trang quanh trang hiện tại
export function Pager({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const set = new Set([1, totalPages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= totalPages));
  const nums = [...set].sort((a, b) => a - b);
  return (
    <nav className="flex flex-wrap items-center gap-1.5 justify-center" aria-label="Phân trang">
      {nums.map((n, i) => (
        <span key={n} className="inline-flex items-center gap-1.5">
          {i > 0 && n - nums[i - 1] > 1 && <span className="text-slate-400">…</span>}
          <button
            type="button"
            onClick={() => onChange(n)}
            aria-current={n === page ? 'page' : undefined}
            className={`min-w-9 h-9 px-2.5 rounded-lg text-sm font-semibold border transition-colors ${n === page ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-700'}`}
          >{n}</button>
        </span>
      ))}
    </nav>
  );
}

export const apiMessage = (err, fallback) => err.response?.data?.message || fallback;
