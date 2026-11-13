import { useEffect, useLayoutEffect, useRef } from 'react';

// Ô nhập số tiền (đồng): chỉ nhận chữ số, mọi số nguyên đều hợp lệ (không bị ràng buộc "bước" như ô type="number").
// Ký tự khác (chữ, dấu, khoảng trắng...) bị chặn ngay khi gõ; dán "18.000.001đ" cũng được làm sạch thành 18000001.
// Hiển thị có dấu chấm ngăn cách hàng nghìn cho dễ đọc; `value` và `onChange` luôn là chuỗi chữ số thuần (vd "18000001").
const format = (digits) => (digits ? new Intl.NumberFormat('vi-VN').format(Number(digits)) : '');

export default function MoneyInput({ value, onChange, maxDigits = 10, className = '', ...rest }) {
  const ref = useRef(null);
  const caret = useRef(null); // số chữ số nằm bên trái con trỏ, để giữ nguyên vị trí gõ sau khi thêm dấu chấm
  const display = format(value);

  const placeCaret = (el, digitsLeft) => {
    let pos = 0;
    let left = digitsLeft;
    while (pos < el.value.length && left > 0) { if (/\d/.test(el.value[pos])) left -= 1; pos += 1; }
    try { el.setSelectionRange(pos, pos); } catch { /* một số trình duyệt không cho đặt vị trí con trỏ */ }
  };

  useLayoutEffect(() => {
    const el = ref.current;
    if (caret.current == null || !el || document.activeElement !== el) return;
    placeCaret(el, caret.current);
    caret.current = null;
  });

  // Chặn ký tự không phải số ngay từ lúc gõ (không để nó xuất hiện rồi mới xóa).
  // Chuỗi dán vào có lẫn chữ số (vd "12.345.678đ") thì vẫn cho qua, handleChange sẽ lọc lấy chữ số.
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const block = (e) => { if (e.data && !/\d/.test(e.data)) e.preventDefault(); };
    el.addEventListener('beforeinput', block);
    return () => el.removeEventListener('beforeinput', block);
  }, []);

  const handleChange = (e) => {
    const el = e.target;
    const raw = el.value;
    const digits = raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, maxDigits);
    const left = Math.min(raw.slice(0, el.selectionStart ?? raw.length).replace(/\D/g, '').replace(/^0+/, '').length, digits.length);
    if (digits === (value ?? '')) {
      // Không có gì đổi (vd dán toàn chữ): React sẽ trả ô về giá trị cũ, đặt lại con trỏ sau đó
      queueMicrotask(() => { if (ref.current) placeCaret(ref.current, left); });
      return;
    }
    caret.current = left;
    onChange(digits);
  };

  return (
    <input
      ref={ref}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={display}
      onChange={handleChange}
      className={className}
      {...rest}
    />
  );
}
