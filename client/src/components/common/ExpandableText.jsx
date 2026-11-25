import { useLayoutEffect, useRef, useState } from 'react';

// Class phải viết đủ chữ để Tailwind nhận ra
const CLAMP = { 1: 'line-clamp-1', 2: 'line-clamp-2', 3: 'line-clamp-3', 4: 'line-clamp-4' };

// Đoạn chữ thu gọn còn `lines` dòng. Chỉ hiện "Xem thêm / Thu gọn" khi chữ thực sự bị cắt (đo thật, không đoán theo số ký tự).
export default function ExpandableText({ text, lines = 2, className = '' }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => { if (!open) setClamped(el.scrollHeight > el.clientHeight + 1); };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [text, lines, open]);

  if (!text) return null;
  return (
    <div>
      <p ref={ref} className={`whitespace-pre-line break-words ${open ? '' : CLAMP[lines] || CLAMP[2]} ${className}`}>{text}</p>
      {(clamped || open) && (
        <button type="button" onClick={() => setOpen((v) => !v)} className="mt-1 text-xs font-semibold text-primary-700 hover:underline">
          {open ? 'Thu gọn' : 'Xem thêm'}
        </button>
      )}
    </div>
  );
}
