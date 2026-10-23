import SafeImage from '@/components/common/SafeImage';
import { colorFor } from '@/utils/colors';

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

// Ảnh đại diện: có ảnh thì hiện ảnh, không thì chữ cái đầu trên nền gradient riêng của từng người
export default function Avatar({ name, src, size = 'md', className = '' }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
  const box = `${SIZES[size] || SIZES.md} rounded-full flex-shrink-0`;
  const fallback = (
    <span className={`${box} bg-gradient-to-br ${colorFor(name).grad} text-white font-bold flex items-center justify-center shadow-sm ${className}`}>
      {initial}
    </span>
  );
  return <SafeImage src={src} alt={name || ''} className={`${box} object-cover ${className}`} fallback={fallback} />;
}
