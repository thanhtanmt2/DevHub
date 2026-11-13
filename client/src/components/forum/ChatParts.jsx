import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import Icon from '@/components/common/Icon';

// Các thành phần của khung trò chuyện kiểu Zalo: chọn emoji, thả cảm xúc, trả lời / sao chép / ghim / thu hồi / xóa ở phía mình,
// thanh tin nhắn đã ghim và menu của cuộc trò chuyện (ghim hội thoại, xóa hội thoại).

// Sáu cảm xúc thả vào tin nhắn (khóa lưu ở server → emoji hiển thị)
export const REACTIONS = [
  { key: 'like', emoji: '👍', label: 'Thích' },
  { key: 'love', emoji: '❤️', label: 'Yêu thích' },
  { key: 'haha', emoji: '😆', label: 'Haha' },
  { key: 'wow', emoji: '😮', label: 'Wow' },
  { key: 'sad', emoji: '😢', label: 'Buồn' },
  { key: 'angry', emoji: '😡', label: 'Phẫn nộ' },
];

const EMOJI_GROUPS = [
  { key: 'face', label: 'Cảm xúc', icon: '😀', list: '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 😉 😍 🥰 😘 😋 😛 😜 🤪 🤗 🤔 😎 🥳 😏 😴 😭 😢 😤 😡 😱 😳 🥺'.split(' ') },
  { key: 'hand', label: 'Cử chỉ', icon: '👍', list: '👍 👎 👌 ✌️ 🤞 🤟 🤘 👏 🙌 🙏 💪 👋 🤝 ✋ 👊 🤙 👀 🫶 🤷 🙈 🙉 🙊'.split(' ') },
  { key: 'symbol', label: 'Biểu tượng', icon: '❤️', list: '❤️ 🧡 💛 💚 💙 💜 🖤 💔 💕 💖 💯 🔥 ✨ ⭐ 🎉 🎊 🎁 🌹 ☕ 🍀 ✅ ❌ ❓ ❗ ⚡ 💡 📌 🚀'.split(' ') },
  { key: 'thing', label: 'Đồ ăn và vật', icon: '🍜', list: '🍜 🍕 🍔 🍟 🍣 🍰 🍩 🍺 🍻 🥤 🍎 🍉 🐶 🐱 🐼 🐻 🌞 🌈 ⚽ 🎮 💻 📱 📚 ✏️'.split(' ') },
];

// Bấm ra ngoài hoặc nhấn Esc thì đóng
export function useOutside(ref, active, onClose) {
  useEffect(() => {
    if (!active) return undefined;
    const down = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const key = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [active, ref, onClose]);
}

// Hộp nổi gắn vào một nút (menu, bảng cảm xúc). Vẽ ra ngoài mọi khung cuộn nên không bao giờ bị cắt;
// tự mở lên trên hoặc xuống dưới tùy chỗ trống và luôn nằm gọn trong màn hình.
export function Popover({ anchorRef, open, onClose, align = 'left', className = '', children, ...rest }) {
  const popRef = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    const a = anchorRef.current?.getBoundingClientRect();
    const p = popRef.current?.getBoundingClientRect();
    if (!a || !p) return;
    const gap = 6;
    const edge = 8;
    let top = a.top - p.height - gap; // ưu tiên mở lên trên
    if (top < edge) top = a.bottom + gap; // không đủ chỗ thì mở xuống dưới
    if (top + p.height > window.innerHeight - edge) top = Math.max(edge, window.innerHeight - p.height - edge);
    let left = align === 'right' ? a.right - p.width : a.left;
    left = Math.min(Math.max(edge, left), window.innerWidth - p.width - edge);
    setPos({ top, left });
  }, [open, align, anchorRef]);

  useEffect(() => {
    if (!open) return undefined;
    const down = (e) => {
      if (popRef.current?.contains(e.target) || anchorRef.current?.contains(e.target)) return;
      onClose();
    };
    const key = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    window.addEventListener('scroll', onClose, true); // cuộn khung chat thì đóng, tránh hộp nổi lệch khỏi nút
    window.addEventListener('resize', onClose);
    return () => {
      document.removeEventListener('mousedown', down);
      document.removeEventListener('keydown', key);
      window.removeEventListener('scroll', onClose, true);
      window.removeEventListener('resize', onClose);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;
  return createPortal(
    <div ref={popRef} style={{ position: 'fixed', top: pos?.top ?? 0, left: pos?.left ?? 0, visibility: pos ? 'visible' : 'hidden' }} className={`z-[80] ${className}`} {...rest}>
      {children}
    </div>,
    document.body
  );
}

// Bảng chọn emoji chèn vào ô soạn tin (giữ nguyên bảng sau mỗi lần chọn để chèn nhiều emoji)
export function EmojiPicker({ onPick }) {
  const [tab, setTab] = useState(EMOJI_GROUPS[0].key);
  const group = EMOJI_GROUPS.find((g) => g.key === tab);
  return (
    <div className="absolute bottom-full left-0 z-20 mb-2 w-[18.5rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200" role="dialog" aria-label="Chọn emoji">
      <div className="flex border-b border-slate-100 bg-slate-50/70" role="tablist">
        {EMOJI_GROUPS.map((g) => (
          <button key={g.key} type="button" role="tab" aria-selected={tab === g.key} title={g.label} aria-label={g.label} onClick={() => setTab(g.key)}
            className={`flex-1 py-2 text-lg transition-colors ${tab === g.key ? 'bg-white shadow-[inset_0_-2px_0_0] shadow-primary-500' : 'opacity-70 hover:opacity-100'}`}>{g.icon}</button>
        ))}
      </div>
      <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{group.label}</p>
      <div className="grid max-h-44 grid-cols-8 gap-0.5 overflow-y-auto p-2 pt-1">
        {group.list.map((e) => (
          <button key={e} type="button" onClick={() => onPick(e)} className="flex h-9 items-center justify-center rounded-lg text-xl transition-transform hover:scale-125 hover:bg-slate-100">{e}</button>
        ))}
      </div>
    </div>
  );
}

const iconBtn = 'flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-700';
const menuItem = 'flex w-full items-center gap-2 px-3 py-2 text-left text-slate-700 hover:bg-slate-50';
const menuBox = 'rounded-xl bg-white py-1 text-sm shadow-lg ring-1 ring-slate-200';

// Một tin nhắn: khung tin, trích dẫn tin được trả lời, cảm xúc đã thả và thanh công cụ (thả cảm xúc / trả lời / thêm) hiện khi rê chuột
export function MessageRow({ m, groupStart, highlighted, peerName, onReply, onReact, onRecall, onJump, onPin, onHide }) {
  const [picker, setPicker] = useState(false);
  const [menu, setMenu] = useState(false);
  const pickerBtn = useRef(null);
  const menuBtn = useRef(null);
  const closePicker = () => setPicker(false);
  const closeMenu = () => setMenu(false);
  const align = m.mine ? 'right' : 'left';

  const entries = REACTIONS.filter((r) => m.reactions.counts[r.key] > 0);
  const total = entries.reduce((s, r) => s + m.reactions.counts[r.key], 0);

  const copy = () => {
    closeMenu();
    navigator.clipboard?.writeText(m.content).then(() => toast.success('Đã sao chép tin nhắn'), () => toast.error('Không sao chép được'));
  };

  return (
    <div id={`msg-${m.id}`} className={`group flex items-end gap-1.5 ${m.mine ? 'flex-row-reverse' : ''} ${groupStart ? 'mt-3' : 'mt-1'} ${total ? 'mb-3.5' : ''}`}>
      <div className="relative min-w-0 max-w-[78%]">
        {m.recalled ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-3.5 py-2 text-sm italic text-slate-400">Tin nhắn đã được thu hồi</div>
        ) : (
          <div className={`rounded-2xl px-3.5 py-2 text-[15px] leading-relaxed break-words whitespace-pre-wrap transition-shadow ${m.mine ? 'bg-primary-600 text-white rounded-br-md' : 'bg-white text-slate-800 ring-1 ring-slate-200 rounded-bl-md'} ${highlighted ? 'shadow-[0_0_0_3px] shadow-amber-300' : ''}`}>
            {m.reply && (
              <button type="button" onClick={() => onJump(m.reply.id)} title="Xem tin nhắn gốc"
                className={`mb-1.5 block w-full rounded-lg border-l-[3px] px-2 py-1 text-left text-xs whitespace-normal ${m.mine ? 'border-white/60 bg-white/15 text-white/90' : 'border-primary-400 bg-slate-50 text-slate-600'}`}>
                <span className="block font-semibold">{m.reply.mine ? 'Bạn' : peerName}</span>
                <span className={`block truncate ${m.reply.recalled ? 'italic opacity-80' : ''}`}>{m.reply.recalled ? 'Tin nhắn đã được thu hồi' : m.reply.content}</span>
              </button>
            )}
            {m.content}
            <span className={`mt-0.5 flex items-center gap-1 text-[10px] leading-none ${m.mine ? 'justify-end text-white/70' : 'text-slate-400'}`}>
              {m.pinned && <Icon name="pin" className="h-3 w-3" />}
              {new Date(m.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        {total > 0 && (
          <button type="button" onClick={() => (m.reactions.mine ? onReact(m, null) : setPicker(true))}
            title={m.reactions.mine ? 'Bấm để gỡ cảm xúc của bạn' : 'Thả cảm xúc'}
            className={`absolute -bottom-3.5 ${m.mine ? 'right-2' : 'left-2'} inline-flex items-center gap-0.5 rounded-full bg-white px-1.5 py-0.5 text-[13px] leading-none shadow ring-1 ${m.reactions.mine ? 'ring-primary-300' : 'ring-slate-200'}`}>
            {entries.map((r) => <span key={r.key}>{r.emoji}</span>)}
            {total > 1 && <span className="ml-0.5 text-[11px] font-semibold text-slate-600">{total}</span>}
          </button>
        )}
      </div>

      <div className={`flex flex-shrink-0 items-center self-center transition-opacity ${picker || menu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'}`}>
        {!m.recalled && (
          <>
            <button ref={pickerBtn} type="button" className={iconBtn} aria-label="Thả cảm xúc" title="Thả cảm xúc" aria-expanded={picker} onClick={() => { setMenu(false); setPicker((v) => !v); }}>
              <Icon name="smile" className="h-[1.125rem] w-[1.125rem]" />
            </button>
            <Popover anchorRef={pickerBtn} open={picker} onClose={closePicker} align={align} role="menu" aria-label="Chọn cảm xúc" className="flex gap-0.5 rounded-full bg-white p-1 shadow-lg ring-1 ring-slate-200">
              {REACTIONS.map((r) => (
                <button key={r.key} type="button" role="menuitem" title={r.label} aria-label={r.label}
                  onClick={() => { closePicker(); onReact(m, m.reactions.mine === r.key ? null : r.key); }}
                  className={`h-9 w-9 rounded-full text-xl transition-transform hover:scale-125 hover:bg-slate-100 ${m.reactions.mine === r.key ? 'bg-primary-50' : ''}`}>{r.emoji}</button>
              ))}
            </Popover>
            <button type="button" className={iconBtn} aria-label="Trả lời" title="Trả lời" onClick={() => onReply(m)}><Icon name="undo" className="h-[1.125rem] w-[1.125rem]" /></button>
          </>
        )}
        <button ref={menuBtn} type="button" className={iconBtn} aria-label="Thêm tùy chọn" title="Thêm" aria-expanded={menu} onClick={() => { setPicker(false); setMenu((v) => !v); }}>
          <Icon name="dots" className="h-[1.125rem] w-[1.125rem]" />
        </button>
        <Popover anchorRef={menuBtn} open={menu} onClose={closeMenu} align={align} role="menu" className={`w-52 ${menuBox}`}>
          {!m.recalled && <button type="button" role="menuitem" onClick={copy} className={menuItem}><Icon name="copy" className="h-4 w-4 text-slate-400" />Sao chép</button>}
          {!m.recalled && (
            <button type="button" role="menuitem" onClick={() => { closeMenu(); onPin(m); }} className={menuItem}>
              <Icon name="pin" className="h-4 w-4 text-slate-400" />{m.pinned ? 'Bỏ ghim tin nhắn' : 'Ghim tin nhắn'}
            </button>
          )}
          {m.can_recall && (
            <button type="button" role="menuitem" onClick={() => { closeMenu(); onRecall(m); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50"><Icon name="undo" className="h-4 w-4" />Thu hồi (với cả hai bên)</button>
          )}
          <button type="button" role="menuitem" onClick={() => { closeMenu(); onHide(m); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50"><Icon name="trash" className="h-4 w-4" />Xóa ở phía tôi</button>
        </Popover>
      </div>
    </div>
  );
}

// Thanh "Tin nhắn đã ghim" dưới tiêu đề cuộc trò chuyện: bấm để nhảy tới tin, nhiều tin ghim thì mở rộng để xem hết
export function PinnedBar({ pinned, onJump, onUnpin }) {
  const [open, setOpen] = useState(false);
  if (!pinned?.length) return null;
  const first = pinned[0];
  return (
    <div className="border-b border-amber-100 bg-amber-50/70" role="region" aria-label="Tin nhắn đã ghim">
      <div className="flex items-center gap-2.5 px-4 py-2">
        <Icon name="pin" className="h-4 w-4 flex-shrink-0 text-amber-600" />
        <button type="button" onClick={() => onJump(first.id)} className="min-w-0 flex-1 text-left" title="Xem tin nhắn đã ghim">
          <span className="block text-[11px] font-semibold text-amber-700">Tin nhắn đã ghim{pinned.length > 1 ? ` (${pinned.length})` : ''}</span>
          <span className="block truncate text-sm text-slate-700">{first.mine ? 'Bạn: ' : ''}{first.content}</span>
        </button>
        {pinned.length > 1 && (
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
            className="flex flex-shrink-0 items-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100">
            {open ? 'Thu gọn' : `Xem ${pinned.length} tin`}<Icon name="chevronDown" className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        )}
        <button type="button" onClick={() => onUnpin(first)} aria-label="Bỏ ghim tin này" title="Bỏ ghim"
          className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-amber-600/70 hover:bg-amber-100 hover:text-amber-800"><Icon name="x" className="h-4 w-4" /></button>
      </div>
      {open && (
        <ul className="border-t border-amber-100 px-4 py-1">
          {pinned.slice(1).map((p) => (
            <li key={p.id} className="flex items-center gap-2 py-1.5">
              <button type="button" onClick={() => onJump(p.id)} className="min-w-0 flex-1 truncate text-left text-sm text-slate-700">{p.mine ? 'Bạn: ' : ''}{p.content}</button>
              <button type="button" onClick={() => onUnpin(p)} aria-label="Bỏ ghim tin này" title="Bỏ ghim" className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-amber-600/70 hover:bg-amber-100 hover:text-amber-800"><Icon name="x" className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Menu ba chấm của một cuộc trò chuyện: ghim lên đầu danh sách, xóa ở phía mình
export function ConversationMenu({ pinned, onPin, onDelete, className = '', buttonClass = '' }) {
  const [open, setOpen] = useState(false);
  const btn = useRef(null);
  const close = () => setOpen(false);
  return (
    <div className={`relative ${className}`}>
      <button ref={btn} type="button" aria-label="Tùy chọn hội thoại" title="Tùy chọn" aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className={`flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-200/80 hover:text-slate-700 ${buttonClass}`}>
        <Icon name="dots" className="h-[1.125rem] w-[1.125rem]" />
      </button>
      <Popover anchorRef={btn} open={open} onClose={close} align="right" role="menu" className={`w-52 ${menuBox}`}>
        <button type="button" role="menuitem" onClick={() => { close(); onPin(); }} className={menuItem}>
          <Icon name="pin" className="h-4 w-4 text-slate-400" />{pinned ? 'Bỏ ghim hội thoại' : 'Ghim hội thoại'}
        </button>
        <button type="button" role="menuitem" onClick={() => { close(); onDelete(); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50">
          <Icon name="trash" className="h-4 w-4" />Xóa hội thoại
        </button>
      </Popover>
    </div>
  );
}
