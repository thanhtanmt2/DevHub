import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { candidateApi } from '@/api/candidateApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const TASK_STATUS = {
  TODO:        { label: 'Cần làm',    color: 'bg-gray-100 text-gray-600' },
  IN_PROGRESS: { label: 'Đang làm',   color: 'bg-blue-100 text-blue-700' },
  REVIEW:      { label: 'Chờ duyệt',  color: 'bg-amber-100 text-amber-700' },
  DONE:        { label: 'Hoàn thành', color: 'bg-green-100 text-green-700' },
};
const PRIORITY = {
  URGENT: { label: 'Khẩn cấp',    color: 'text-red-600' },
  HIGH:   { label: 'Cao',         color: 'text-orange-600' },
  MEDIUM: { label: 'Bình thường', color: 'text-yellow-600' },
  LOW:    { label: 'Thấp',        color: 'text-gray-500' },
};
const PROJECT_STATUS = {
  PLANNING:    { label: 'Lên kế hoạch',   color: 'bg-gray-100 text-gray-600' },
  RECRUITING:  { label: 'Đang tuyển',     color: 'bg-purple-100 text-purple-700' },
  IN_PROGRESS: { label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-700' },
  COMPLETED:   { label: 'Hoàn thành',     color: 'bg-green-100 text-green-700' },
  CANCELLED:   { label: 'Đã hủy',         color: 'bg-red-100 text-red-600' },
};
const MEMBER_ROLE_LABELS = { MANAGER: 'Quản lý', LEAD: 'Lead', MEMBER: 'Thành viên', VIEWER: 'Xem' };

const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

// Số ngày còn lại tới hết ngày deadline (âm = đã quá hạn)
const daysLeft = (deadline) => {
  const end = new Date(deadline);
  end.setHours(23, 59, 59, 999);
  return Math.ceil((end - new Date()) / (1000 * 60 * 60 * 24)) - 1;
};

function DeadlineText({ task }) {
  if (!task.deadline) return <span className="text-gray-400">Không có deadline</span>;
  if (task.status === 'DONE' || task.status === 'REVIEW') return <span className="text-gray-500">📅 {formatDate(task.deadline)}</span>;
  if (task.is_overdue) return <span className="text-red-600 font-semibold">⚠️ Quá hạn ({formatDate(task.deadline)})</span>;
  const left = daysLeft(task.deadline);
  if (left === 0) return <span className="text-amber-600 font-semibold">⏰ Hết hạn hôm nay</span>;
  if (left <= 3) return <span className="text-amber-600 font-medium">⏰ Còn {left} ngày ({formatDate(task.deadline)})</span>;
  return <span className="text-gray-500">📅 {formatDate(task.deadline)}</span>;
}

export default function MyWorkspacesPage() {
  const navigate = useNavigate();
  const [taskTab, setTaskTab] = useState('open'); // 'open' | 'done'

  // staleTime 0: luôn lấy số liệu mới nhất khi mở trang
  const { data: wsRes, isLoading: loadingWs } = useQuery({
    queryKey: ['my-workspaces'],
    queryFn: () => candidateApi.getMyWorkspaces(),
    staleTime: 0,
  });
  const { data: tasksRes, isLoading: loadingTasks } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => candidateApi.getMyTasks(),
    staleTime: 0,
  });

  if (loadingWs || loadingTasks) return <LoadingSpinner />;

  const memberships = wsRes?.data?.data || [];
  const activeMemberships = memberships.filter(m => m.status === 'ACTIVE');
  const pastMemberships = memberships.filter(m => m.status !== 'ACTIVE');
  const tasks = tasksRes?.data?.data || [];
  const openTasks = tasks.filter(t => t.status !== 'DONE');
  const doneTasks = tasks.filter(t => t.status === 'DONE');
  const shownTasks = taskTab === 'open' ? openTasks : doneTasks;

  const summary = [
    { label: 'Cần làm',       value: tasks.filter(t => t.status === 'TODO').length,        color: 'text-gray-700' },
    { label: 'Đang làm',      value: tasks.filter(t => t.status === 'IN_PROGRESS').length, color: 'text-blue-600' },
    { label: 'Chờ duyệt',     value: tasks.filter(t => t.status === 'REVIEW').length,      color: 'text-amber-600' },
    { label: 'Cần chỉnh sửa', value: tasks.filter(t => t.status === 'IN_PROGRESS' && t.review_status === 'REVISION_REQUIRED').length, color: 'text-orange-600' },
    { label: 'Quá hạn',       value: tasks.filter(t => t.is_overdue).length,               color: 'text-red-600' },
    { label: 'Hoàn thành',    value: doneTasks.length,                                      color: 'text-green-600' },
  ];

  const openTask = (t) => navigate(`/candidate/workspaces/${t.workspace_id}?task=${t.id}`);

  if (!memberships.length) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dự án của tôi</h1>
          <p className="text-gray-500 text-sm">Theo dõi các dự án bạn tham gia và công việc được giao</p>
        </div>
        <div className="card text-center py-14">
          <p className="text-4xl mb-2">🗂️</p>
          <p className="text-gray-600 font-medium">Bạn chưa tham gia dự án nào</p>
          <p className="text-xs text-gray-400 mt-1">Khi trúng tuyển vào một dự án nội bộ, bạn sẽ được thêm vào Workspace của dự án đó</p>
          <Link to="/projects" className="btn-primary mt-4 inline-block">Khám phá dự án</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dự án của tôi</h1>
        <p className="text-gray-500 text-sm">Theo dõi các dự án bạn tham gia và công việc được giao</p>
      </div>

      {/* Tổng quan công việc của tôi */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {summary.map(s => (
          <div key={s.label} className="card py-3">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Công việc của tôi (ở mọi dự án) */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold">📋 Công việc của tôi</h2>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setTaskTab('open')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${taskTab === 'open' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'}`}>
              Đang thực hiện ({openTasks.length})
            </button>
            <button onClick={() => setTaskTab('done')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${taskTab === 'done' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'}`}>
              Đã hoàn thành ({doneTasks.length})
            </button>
          </div>
        </div>

        {shownTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            {taskTab === 'open' ? 'Bạn không có task nào đang thực hiện 🎉' : 'Chưa có task nào được nghiệm thu'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {shownTasks.map(t => {
              const st = TASK_STATUS[t.status] || TASK_STATUS.TODO;
              const pr = PRIORITY[t.priority] || PRIORITY.MEDIUM;
              const needsRevision = t.status === 'IN_PROGRESS' && t.review_status === 'REVISION_REQUIRED';
              const totalSubs = t.SubTasks?.length || 0;
              const doneSubs = t.SubTasks?.filter(s => s.is_done).length || 0;
              return (
                <button key={t.id} onClick={() => openTask(t)}
                  className="w-full text-left flex items-center gap-4 py-3 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${st.color}`}>{st.label}</span>
                      {needsRevision && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-orange-100 text-orange-700">↩️ Cần chỉnh sửa</span>
                      )}
                      <p className="text-sm font-semibold text-gray-900 truncate">{t.title}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap text-xs">
                      <span className="text-primary-700 font-medium">📁 {t.Workspace?.Project?.name || t.Workspace?.name}</span>
                      <span className={pr.color}>● {pr.label}</span>
                      <DeadlineText task={t} />
                      {totalSubs > 0 && <span className="text-gray-400">☑ {doneSubs}/{totalSubs} subtask</span>}
                    </div>
                  </div>
                  <div className="w-28 flex-shrink-0 hidden sm:block">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>Tiến độ</span><span>{t.completion_rate || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${t.status === 'DONE' ? 'bg-green-500' : 'bg-primary-500'}`}
                        style={{ width: `${t.completion_rate || 0}%` }} />
                    </div>
                  </div>
                  <span className="text-gray-300 text-lg flex-shrink-0">›</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Workspace đang tham gia */}
      <div>
        <h2 className="font-semibold mb-3">🗂️ Workspace đang tham gia ({activeMemberships.length})</h2>
        {activeMemberships.length === 0 ? (
          <div className="card text-center py-8 text-gray-400 text-sm">Bạn không còn tham gia Workspace nào</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {activeMemberships.map(m => <WorkspaceCard key={m.id} membership={m} />)}
          </div>
        )}
      </div>

      {/* Dự án đã kết thúc */}
      {pastMemberships.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3 text-gray-500">Đã kết thúc ({pastMemberships.length})</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {pastMemberships.map(m => <WorkspaceCard key={m.id} membership={m} ended />)}
          </div>
        </div>
      )}
    </div>
  );
}

function WorkspaceCard({ membership: m, ended = false }) {
  const project = m.Workspace?.Project;
  const ps = PROJECT_STATUS[project?.status];
  const mine = m.my_tasks || {};
  return (
    <div className={`card flex flex-col gap-3 ${ended ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{project?.name || m.Workspace?.name}</h3>
          <p className="text-xs text-gray-400 truncate">{m.Workspace?.name}</p>
        </div>
        {ps && <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${ps.color}`}>{ps.label}</span>}
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-2 py-0.5 rounded bg-primary-50 text-primary-700 font-medium">
          {m.is_project_manager ? '⭐ Quản lý dự án' : `Vai trò: ${MEMBER_ROLE_LABELS[m.role] || m.role}`}
        </span>
        {m.ProjectJob?.title && <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600">Vị trí: {m.ProjectJob.title}</span>}
        {m.joined_at && <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500">Tham gia {formatDate(m.joined_at)}</span>}
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Tiến độ dự án ({m.total_tasks} task)</span><span className="font-semibold">{m.progress}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div className="bg-gradient-to-r from-primary-500 to-green-500 h-2 rounded-full transition-all" style={{ width: `${m.progress}%` }} />
        </div>
      </div>

      <div className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
        <span className="font-semibold text-gray-700">Task của bạn: </span>
        {mine.total
          ? `${mine.TODO} cần làm · ${mine.IN_PROGRESS} đang làm · ${mine.REVIEW} chờ duyệt · ${mine.DONE} hoàn thành`
          : 'chưa được giao task nào'}
        {(mine.overdue > 0 || mine.needs_revision > 0) && (
          <div className="flex gap-3 mt-1 font-semibold">
            {mine.overdue > 0 && <span className="text-red-600">⚠️ {mine.overdue} quá hạn</span>}
            {mine.needs_revision > 0 && <span className="text-orange-600">↩️ {mine.needs_revision} cần chỉnh sửa</span>}
          </div>
        )}
      </div>

      {ended ? (
        <p className="text-xs text-gray-400 text-center">Bạn đã hoàn thành phần việc trong dự án này</p>
      ) : (
        <Link to={`/candidate/workspaces/${m.Workspace?.id}`} className="btn-primary text-sm text-center py-2">
          Vào Workspace →
        </Link>
      )}
    </div>
  );
}
