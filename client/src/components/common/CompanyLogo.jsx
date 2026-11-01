import SafeImage from '@/components/common/SafeImage';
import { colorFor } from '@/utils/colors';

// Tên thương hiệu gọn để hiển thị ở chỗ hẹp: bỏ phần pháp lý "Công ty TNHH / Cổ phần..."
// "Công ty TNHH Giải pháp Phần mềm Sao Việt" → "Giải pháp Phần mềm Sao Việt"
export function brandName(name = '') {
  const core = String(name)
    .replace(/^\s*(công ty|cty|tập đoàn)\s*/i, '')
    .replace(/^\s*(tnhh|cổ phần|cp)(\s+(mtv|một thành viên))?\s*/i, '')
    .trim();
  return core || String(name).trim();
}

// Chữ viết tắt của thương hiệu: lấy chữ đầu của 2 từ cuối trong tên thương hiệu.
// "Công ty TNHH Giải pháp Phần mềm Sao Việt" → "SV"; "FPT Software" → "FS"
export function brandInitials(name = '') {
  const words = brandName(name).split(/\s+/).filter(Boolean);
  if (!words.length) return '?';
  const pick = words.length === 1 ? [words[0]] : words.slice(-2);
  return pick.map((w, i) => (pick.length === 1 ? w.slice(0, 2) : w.charAt(0))).join('').toLocaleUpperCase('vi');
}

// Doanh nghiệp "DevHub": chủ của các dự án thời vụ (logo là biểu tượng DevHub)
export const DEVHUB_COMPANY = { name: 'DevHub', logo_url: '/logo-mark.png' };

// Logo công ty hiển thị như một "thẻ logo" thống nhất: nền trắng, viền mảnh, logo nằm gọn trong khung (không bị cắt/méo).
// Chưa có logo hoặc file lỗi → chữ viết tắt trên nền gradient xanh.
export default function CompanyLogo({ company, className = 'w-12 h-12 text-lg' }) {
  return (
    <SafeImage
      src={company?.logo_url}
      alt={company?.name || ''}
      className={`${className} rounded-xl object-contain bg-white p-1.5 ring-1 ring-slate-200 shadow-sm flex-shrink-0`}
      fallback={
        <span
          title={company?.name || ''}
          className={`${className} rounded-xl bg-gradient-to-br ${colorFor(company?.name).grad} text-white font-extrabold tracking-tight flex items-center justify-center flex-shrink-0 shadow-sm`}
        >
          {brandInitials(company?.name)}
        </span>
      }
    />
  );
}
