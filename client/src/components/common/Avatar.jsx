import { useState } from 'react';
import SafeImage from '@/components/common/SafeImage';
import ImageLightbox from '@/components/common/ImageLightbox';
import { colorFor } from '@/utils/colors';

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-28 h-28 text-4xl',
};

// Ảnh đại diện: có ảnh thì hiện ảnh, không thì chữ cái đầu trên nền gradient riêng của từng người.
// zoomable: bấm vào ảnh để xem phóng to.
export default function Avatar({ name, src, size = 'md', className = '', zoomable = false }) {
  const [open, setOpen] = useState(false);
  // Chữ cái mặc định là chữ đầu của tên gọi (từ cuối): "Nguyễn Văn Anh" → A
  const initial = (name || '?').trim().split(/\s+/).pop().charAt(0).toUpperCase() || '?';
  const box = `${SIZES[size] || SIZES.md} rounded-full flex-shrink-0`;
  const fallback = (
    <span className={`${box} bg-gradient-to-br ${colorFor(name).grad} text-white font-bold flex items-center justify-center shadow-sm ${className}`}>
      {initial}
    </span>
  );
  const image = <SafeImage src={src} alt={name || ''} className={`${box} object-cover ${className}`} fallback={fallback} />;
  if (!zoomable || !src) return image;
  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        title="Bấm để xem ảnh"
        aria-label="Xem ảnh đại diện"
        className="rounded-full cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        {image}
      </button>
      {open && <ImageLightbox src={src} alt={name} onClose={() => setOpen(false)} />}
    </>
  );
}
