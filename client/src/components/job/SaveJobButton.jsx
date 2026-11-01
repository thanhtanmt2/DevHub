import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/common/Icon';
import useSavedJobs from '@/hooks/useSavedJobs';

// Nút lưu tin (trái tim). type: 'job' | 'project'.
// variant="icon": nút tròn nhỏ trên thẻ việc làm; variant="full": nút có chữ ở trang chi tiết.
// Nhà tuyển dụng / admin không thấy nút; tin đã đóng mà chưa lưu thì ẩn (chỉ còn bỏ lưu được).
export default function SaveJobButton({ type, id, variant = 'icon', closed = false, className = '' }) {
  const { user, isCandidate } = useAuth();
  const { isSaved, toggle } = useSavedJobs();
  if (user && !isCandidate()) return null;
  const saved = isSaved(type, id);
  if (closed && !saved) return null;

  const onClick = (e) => { e.preventDefault(); e.stopPropagation(); toggle(type, id); };
  const label = saved ? 'Bỏ lưu tin' : 'Lưu tin';

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
          saved ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-white text-slate-700 border-slate-300 hover:border-red-300 hover:text-red-600'
        } ${className}`}
      >
        <Icon name="heart" filled={saved} className="w-[18px] h-[18px]" />{saved ? 'Đã lưu' : 'Lưu tin'}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition-all flex-shrink-0 ${
        saved ? 'bg-red-50 text-red-500 border-red-200' : 'bg-white text-slate-400 border-slate-200 hover:text-red-500 hover:border-red-200 hover:bg-red-50'
      } ${className}`}
    >
      <Icon name="heart" filled={saved} className="w-[18px] h-[18px]" />
    </button>
  );
}
