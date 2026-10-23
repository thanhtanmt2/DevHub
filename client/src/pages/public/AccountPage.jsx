import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AvatarUploader from '@/components/common/AvatarUploader';
import Icon from '@/components/common/Icon';

const ROLE_LABELS = { ADMIN: 'Quản trị viên', EMPLOYER: 'Nhà tuyển dụng', CANDIDATE: 'Ứng viên' };
const STATUS_LABELS = { ACTIVE: 'Đang hoạt động', INACTIVE: 'Chưa kích hoạt', LOCKED: 'Đã khóa' };

// Hồ sơ cá nhân cho Nhà tuyển dụng / Admin (Ứng viên có trang hồ sơ năng lực riêng)
export default function AccountPage() {
  const { user, getUserRoles, isEmployer, isAdmin } = useAuth();
  const roles = getUserRoles().map((r) => ROLE_LABELS[r] || r).join(', ');
  const dashboard = isAdmin() ? '/admin' : isEmployer() ? '/employer' : '/candidate';

  const rows = [
    { icon: 'user', label: 'Họ và tên', value: user?.full_name },
    { icon: 'mail', label: 'Email', value: user?.email },
    { icon: 'badge', label: 'Vai trò', value: roles },
    { icon: 'check', label: 'Trạng thái', value: STATUS_LABELS[user?.status] || user?.status },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="rounded-2xl bg-brand-gradient text-white p-6 shadow-lift">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <AvatarUploader size="xl" light className="ring-4 ring-white/40" />
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight truncate">{user?.full_name}</h1>
            <p className="text-white">{roles}</p>
            <p className="text-white text-sm mt-1">Bấm vào biểu tượng bút chì để đổi ảnh đại diện (JPG, PNG, GIF, WEBP — tối đa 5MB){isEmployer() && '. Với Nhà tuyển dụng, ảnh này cũng là logo công ty.'}</p>
          </div>
        </div>
      </div>

      <div className="card !p-6">
        <h2 className="font-bold text-slate-900 mb-4">Thông tin tài khoản</h2>
        <dl className="space-y-4">
          {rows.map((r) => (
            <div key={r.label} className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center flex-shrink-0">
                <Icon name={r.icon} className="w-[18px] h-[18px]" />
              </span>
              <div className="min-w-0">
                <dt className="text-xs text-slate-500">{r.label}</dt>
                <dd className="text-sm font-semibold text-slate-900 break-words">{r.value}</dd>
              </div>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-slate-100">
          <Link to={dashboard} className="btn-primary">Về Dashboard</Link>
          {isEmployer() && <Link to="/employer/company" className="btn-secondary">Hồ sơ doanh nghiệp</Link>}
        </div>
      </div>
    </div>
  );
}
