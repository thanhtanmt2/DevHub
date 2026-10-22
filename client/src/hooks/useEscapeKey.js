import { useEffect, useRef } from 'react';

// Nhấn Esc để đóng hộp thoại / ngăn kéo đang mở.
// Khi nhiều lớp mở chồng nhau (vd. ngăn chi tiết task + hộp thoại nộp sản phẩm + hộp thoại xác nhận),
// chỉ lớp trên cùng (mở sau cùng) phản hồi, các lớp bên dưới giữ nguyên.
//
//   useEscapeKey(onClose);                       // component hộp thoại luôn hiển thị khi được render
//   useEscapeKey(() => setOpen(false), open);    // hộp thoại bật/tắt bằng state
const stack = [];

export default function useEscapeKey(onEscape, enabled = true) {
  const handlerRef = useRef(onEscape);
  handlerRef.current = onEscape;

  useEffect(() => {
    if (!enabled) return undefined;
    const entry = {};
    stack.push(entry);
    const onKey = (e) => {
      if (e.key === 'Escape' && stack[stack.length - 1] === entry) handlerRef.current?.();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      const i = stack.indexOf(entry);
      if (i !== -1) stack.splice(i, 1);
    };
  }, [enabled]);
}
