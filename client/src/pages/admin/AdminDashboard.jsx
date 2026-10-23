import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '@/api/adminApi';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Icon, { IconBadge } from '@/components/common/Icon';
import { timeAgo } from '@/utils/timeAgo';
import PageBanner from '@/components/common/PageBanner';
import StatTile from '@/components/common/StatTile';
import { stripEmoji } from '@/utils/stripEmoji';

// Các việc đang chờ Admin: key trong data.todo → nhãn, icon, màu nhấn khi có việc, trang xử lý
const TODO_CARDS = [
  { key: 'pending_companies', label: 'Doanh nghiệp chờ xác thực', icon: 'building', tone: 'blue', to: '/admin/companies' },
  { key: 'pending_jobs', label: 'Tin tuyển dụng chờ duyệt', icon: 'clipboard', tone: 'blue', to: '/admin/jobs' },
  { key: 'pending_project_applications', label: 'Ứng viên dự án chờ duyệt', icon: 'users', tone: 'blue', to: '/admin/projects' },
  { key: 'tasks_in_review', label: 'Task chờ nghiệm thu', icon: 'clipboardCheck', tone: 'blue', to: '/admin/projects' },
  { key: 'pending_payments', label: 'Thanh toán chờ xử lý', icon: 'card', tone: 'blue', to: '/admin/payments' },
  { key: 'overdue_tasks', label: 'Task quá hạn', icon: 'alert', tone: 'red', to: '/admin/projects' },
];

// Màu số đếm / viền khi thẻ có việc cần xử lý (class viết đầy đủ để Tailwind nhận diện)
const ACTIVE_STYLE = {
  amber: { num: 'text-amber-600', border: 'border-amber-200' },
  blue: { num: 'text-blue-600', border: 'border-blue-200' },
  purple: { num: 'text-primary-600', border: 'border-primary-200' },
  indigo: { num: 'text-primary-600', border: 'border-primary-200' },
  emerald: { num: 'text-emerald-600', border: 'border-emerald-200' },
  red: { num: 'text-red-600', border: 'border-red-200' },
};

// Icon cho từng loại hoạt động trong "Hoạt động gần đây"
function activityIcon(action = '') {
  if (action.startsWith('TASK') || action.startsWith('SUBTASK')) return 'clipboard';
  if (action === 'MEMBER_EVALUATED') return 'star';
  if (action.startsWith('WORKSPACE_MEMBER')) return 'users';
  if (action.startsWith('PROJECT')) return 'folder';
  if (action === 'INTERVIEW_SCHEDULED') return 'calendar';
  if (action.startsWith('APPLICATION')) return 'briefcase';
  if (action.startsWith('PAYMENT')) return 'card';
  if (action.startsWith('USER')) return 'user';
  return 'document';
}

// "Chờ 2 giờ" / "Vừa nộp" cho task đang chờ nghiệm thu
function waitingLabel(updatedAt) {
  const ago = timeAgo(updatedAt);
  return ago === 'Vừa xong' ? 'Vừa nộp' : `Chờ ${ago.replace(' trước', '')}`;
}

function TodoCard({ card, count }) {
  const active = count > 0;
  const style = ACTIVE_STYLE[card.tone];
  return (
    <Link
      to={card.to}
      className={`card !p-4 flex items-center gap-4 group hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200 ${active ? style.border : ''}`}
    >
      <IconBadge name={card.icon} tone={active ? card.tone : 'slate'} size="md" shape="square" />
      <div className="min-w-0 flex-1">
        <p className={`text-2xl font-bold leading-none ${active ? style.num : 'text-slate-300'}`}>{count}</p>
        <p className={`text-sm mt-1.5 truncate ${active ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{card.label}</p>
      </div>
      <Icon name="chevronRight" className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
    </Link>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard(),
    refetchInterval: 60000, // tự làm mới mỗi phút để thấy việc mới
  });
  // Cùng khóa với trang Thống kê nên dùng chung cache
  const { data: statsRes } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminApi.getStats() });

  if (isLoading) return <LoadingSpinner />;
  if (isError) {
    return (
      <div className="card text-center py-12">
        <IconBadge name="alert" size="lg" tone="red" className="mx-auto mb-3" />
        <p className="font-semibold text-slate-900">Không tải được dữ liệu Dashboard</p>
        <button onClick={() => refetch()} className="btn-primary mt-4">Thử lại</button>
      </div>
    );
  }

  const dashboard = data?.data?.data || {};
  const todo = dashboard.todo || {};
  const reviewTasks = dashboard.review_tasks || [];
  const recent = dashboard.recent_activity || [];
  const stats = statsRes?.data?.data;

  const totalTodo = TODO_CARDS.reduce((sum, c) => sum + (todo[c.key] || 0), 0);
  const moreReviewTasks = Math.max(0, (todo.tasks_in_review || 0) - reviewTasks.length);

  const kpis = [
    { label: 'Tổng người dùng', value: stats?.total_users ?? '—', icon: 'users', tone: 'blue' },
    { label: 'Tin tuyển dụng', value: stats?.total_jobs ?? '—', icon: 'briefcase', tone: 'violet' },
    { label: 'Dự án nội bộ', value: stats?.total_projects ?? '—', icon: 'folder', tone: 'emerald' },
    { label: 'Đã thanh toán', value: `${new Intl.NumberFormat('vi-VN').format(stats?.total_payout || 0)}đ`, icon: 'cash', tone: 'amber' },
  ];

  return (
    <div className="space-y-8">
      <PageBanner
        icon="home"
        title={`Xin chào, ${user?.full_name || 'Admin'}`}
        subtitle={totalTodo > 0
          ? `Có ${totalTodo} việc đang chờ bạn xử lý.`
          : 'Hiện không có việc nào đang chờ — hệ thống đang vận hành ổn định.'}
      >
        <Link to="/admin/stats" className="btn-glass">Thống kê & báo cáo</Link>
      </PageBanner>

      {/* Việc cần xử lý */}
      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Việc cần xử lý</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {TODO_CARDS.map((card) => <TodoCard key={card.key} card={card} count={todo[card.key] || 0} />)}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task chờ nghiệm thu */}
        <section className="card !p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-slate-900">Task chờ nghiệm thu</h2>
            <Link to="/admin/projects" className="text-sm text-primary-600 hover:underline">Dự án nội bộ →</Link>
          </div>
          {reviewTasks.length === 0 ? (
            <div className="text-center py-10 px-5">
              <IconBadge name="verified" size="lg" tone="green" className="mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-700">Không có task nào chờ nghiệm thu</p>
              <p className="text-xs text-slate-400 mt-1">Task thành viên nộp sản phẩm sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {reviewTasks.map((t) => (
                <li key={t.id}>
                  <Link
                    to={`/admin/workspaces/${t.workspace_id}?task=${t.id}`}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <IconBadge name="clipboardCheck" tone="blue" size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{t.title}</p>
                      <p className="text-xs text-slate-500 truncate">{t.Workspace?.name || 'Workspace'}</p>
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{waitingLabel(t.updated_at)}</span>
                  </Link>
                </li>
              ))}
              {moreReviewTasks > 0 && (
                <li className="px-5 py-3 text-xs text-slate-500 text-center">và {moreReviewTasks} task khác đang chờ nghiệm thu</li>
              )}
            </ul>
          )}
        </section>

        {/* Hoạt động gần đây */}
        <section className="card !p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-slate-900">Hoạt động gần đây</h2>
            <Link to="/admin/logs" className="text-sm text-primary-600 hover:underline">Nhật ký hệ thống →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-10 px-5 text-sm text-slate-400">Chưa có hoạt động nào</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recent.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                  <IconBadge name={activityIcon(a.action)} tone="gray" size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700 line-clamp-2 break-words">{stripEmoji(a.description)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.user_name || 'Hệ thống'} · {timeAgo(a.created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Số liệu hệ thống */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Số liệu hệ thống</h2>
          <Link to="/admin/stats" className="text-sm text-primary-600 hover:underline">Thống kê chi tiết →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k) => <StatTile key={k.label} {...k} />)}
        </div>
      </section>
    </div>
  );
}
