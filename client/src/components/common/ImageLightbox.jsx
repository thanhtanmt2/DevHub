import { createPortal } from 'react-dom';
import Icon from '@/components/common/Icon';
import useEscapeKey from '@/hooks/useEscapeKey';

// Xem ảnh phóng to: bấm ra ngoài, bấm nút đóng hoặc nhấn Esc để thoát
export default function ImageLightbox({ src, alt = '', onClose, children }) {
  useEscapeKey(onClose);
  // Sự kiện React nổi lên cả qua portal: chặn để bấm đóng không kích hoạt thẻ/nút bên dưới
  const close = (e) => { e.stopPropagation(); onClose(); };
  return createPortal(
    <div
      className="fixed inset-0 z-[70] bg-black/80 flex flex-col items-center justify-center p-4 animate-fade-in"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh"
    >
      <button
        type="button"
        onClick={close}
        aria-label="Đóng"
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
      >
        <Icon name="x" className="w-6 h-6" />
      </button>
      <img
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[92vw] max-h-[80vh] rounded-2xl shadow-2xl object-contain bg-white"
      />
      {children && <div className="mt-4" onClick={(e) => e.stopPropagation()}>{children}</div>}
    </div>,
    document.body
  );
}
