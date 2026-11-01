import { IconBadge } from '@/components/common/Icon';

// Ô số liệu dùng cho các Dashboard: nền trắng, chỉ icon mang màu thương hiệu
// (banner phía trên đã là mảng xanh duy nhất của trang). `tone` được giữ để không phải sửa nơi gọi.
export default function StatTile({ label, value, icon, sub }) {
  // Số dài (vd. số tiền) thu nhỏ chữ để không tràn khỏi ô
  const len = String(value).length;
  const size = len >= 11 ? 'text-xl' : len >= 8 ? 'text-2xl' : 'text-3xl';
  return (
    <div className="card !p-5 flex items-center gap-4">
      <IconBadge name={icon} tone="blue" size="lg" shape="square" />
      <div className="min-w-0">
        <p className={`${size} font-extrabold text-slate-900 leading-none tracking-tight truncate`} title={String(value)}>{value}</p>
        <p className="text-sm text-slate-500 mt-1.5 font-medium">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
