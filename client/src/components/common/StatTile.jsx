import { IconBadge } from '@/components/common/Icon';

// Ô số liệu dùng cho các Dashboard: nền trắng, chỉ icon mang màu thương hiệu
// (banner phía trên đã là mảng xanh duy nhất của trang). `tone` được giữ để không phải sửa nơi gọi.
export default function StatTile({ label, value, icon, sub }) {
  return (
    <div className="card !p-5 flex items-center gap-4">
      <IconBadge name={icon} tone="blue" size="lg" shape="square" />
      <div className="min-w-0">
        <p className="text-3xl font-extrabold text-slate-900 leading-none tracking-tight">{value}</p>
        <p className="text-sm text-slate-500 mt-1.5 font-medium">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
