import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { workspaceApi } from '@/api/workspaceApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Icon from '@/components/common/Icon';
import PageBanner from '@/components/common/PageBanner';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { PROJECT_STATUS_META, formatDate, formatMoney } from '@/utils/jobMeta';

export default function InternalProjectsPage() {
  const confirm = useConfirm();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [showAddProject, setShowAddProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', expected_end_date: '' });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table' | 'kanban'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const { data: projectsRes, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => workspaceApi.getProjects(),
    staleTime: 0, // tiến độ dự án thay đổi khi Task được cập nhật trong Workspace
  });

  // Create Project
  const createProjectMutation = useMutation({
    mutationFn: (data) => workspaceApi.createProject(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      setShowAddProject(false);
      setProjectForm({ name: '', description: '', expected_end_date: '' });
      toast.success('Đã tạo dự án & Workspace!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi tạo dự án'),
  });

  // Khởi tạo Workspace cho dự án chưa có (đã có thì server trả về Workspace hiện tại)
  const createWorkspaceMutation = useMutation({
    mutationFn: (projectId) => workspaceApi.createWorkspace(projectId),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success(res.data?.message || 'Đã khởi tạo Workspace');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi khởi tạo Workspace'),
  });

  // Delete Project
  const deleteProjectMutation = useMutation({
    mutationFn: (id) => workspaceApi.deleteProject(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success('Đã xóa dự án thành công!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi xóa dự án'),
  });

  // Đóng dự án: nghiệm thu + tự tạo các khoản thù lao rồi chuyển sang trang chấm điểm năng lực
  const closeProjectMutation = useMutation({
    mutationFn: ({ id, force }) => workspaceApi.closeProject(id, { force }),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      qc.invalidateQueries({ queryKey: ['admin-payments'] });
      qc.invalidateQueries({ queryKey: ['admin-payable-members'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      const n = res.data?.auto_created_payments || 0;
      toast.success(n > 0 ? `Đã đóng dự án và tạo ${n} khoản thanh toán thù lao` : 'Đã đóng dự án');
      navigate(`/admin/projects/${vars.id}/evaluations?then=pay`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không đóng được dự án'),
  });

  const handleCloseProject = async (project) => {
    const ps = project.payment_summary || {};
    const open = ps.open_tasks || 0;
    const ok = await confirm({
      title: 'Đóng dự án và chuyển sang thanh toán',
      message: `Dự án "${project.name}" sẽ được nghiệm thu hoàn thành. Hệ thống tự tạo khoản thù lao (theo mức thù lao vị trí) cho ${ps.members || 0} thành viên. Sau đó bạn chấm điểm năng lực cho từng thành viên rồi chuyển sang trang thanh toán của dự án này.${open > 0 ? ` Lưu ý: còn ${open} công việc chưa hoàn thành.` : ''}`,
      confirmText: 'Đóng dự án & chấm điểm',
      tone: open > 0 ? 'danger' : 'primary',
    });
    if (ok) closeProjectMutation.mutate({ id: project.id, force: open > 0 });
  };

  // Update Project Status (including Project Completion & Auto-create Payments)
  const updateProjectStatusMutation = useMutation({
    mutationFn: ({ id, status }) => workspaceApi.updateProject(id, { status }),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      qc.invalidateQueries({ queryKey: ['admin-payments'] });
      qc.invalidateQueries({ queryKey: ['admin-payable-members'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      if (vars.status === 'COMPLETED') navigate(`/admin/projects/${vars.id}/evaluations`);
      const createdCount = res.data?.auto_created_payments || 0;
      if (createdCount > 0) {
        toast.success(`Đã nghiệm thu dự án và tự động tạo ${createdCount} khoản thanh toán thù lao!`);
      } else {
        toast.success('Đã cập nhật trạng thái dự án!');
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái dự án'),
  });

  const projects = projectsRes?.data?.data || [];

  const handleChangeProjectStatus = async (project, nextStatus) => {
    if (nextStatus === project.status) return;
    if (nextStatus === 'COMPLETED') {
      const ok = await confirm({
        title: 'Nghiệm thu hoàn thành dự án',
        message: `Xác nhận nghiệm thu hoàn thành dự án "${project.name}"? Hệ thống sẽ tự động tạo khoản thanh toán thù lao (trạng thái Chưa thanh toán) cho các thành viên trong Workspace theo mức thù lao vị trí.`,
        confirmText: 'Nghiệm thu & Tạo thanh toán',
        tone: 'primary',
      });
      if (!ok) return;
    }
    updateProjectStatusMutation.mutate({ id: project.id, status: nextStatus });
  };

  const handleDeleteProject = async (project) => {
    if (
      await confirm({
        title: 'Xóa dự án',
        message: `Bạn có chắc chắn muốn xóa dự án "${project.name}" không?`,
        confirmText: 'Xóa dự án',
        tone: 'danger',
      })
    ) {
      deleteProjectMutation.mutate(project.id);
    }
  };

  const statusCounts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const filteredProjects = projects
    .filter((p) => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q);
        const matchJob = p.ProjectJobs?.some((j) => j.title?.toLowerCase().includes(q));
        if (!matchName && !matchDesc && !matchJob) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline_asc') {
        const da = a.expected_end_date ? new Date(a.expected_end_date).getTime() : Infinity;
        const db = b.expected_end_date ? new Date(b.expected_end_date).getTime() : Infinity;
        return da - db;
      }
      if (sortBy === 'jobs_desc') return (b.ProjectJobs?.length || 0) - (a.ProjectJobs?.length || 0);
      if (sortBy === 'members_desc') return (b.payment_summary?.members || 0) - (a.payment_summary?.members || 0);
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageBanner
        compact
        icon="folder"
        title="Quản lý dự án thời vụ & vị trí tuyển dụng"
        subtitle="Quản lý các dự án nội bộ và vị trí tuyển dụng thời vụ"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/admin/projects/interviewers"
            className="btn-light flex items-center gap-1.5"
          >
            <Icon name="users" className="w-4 h-4" />
            Quản lý người phỏng vấn
          </Link>
          <button onClick={() => setShowAddProject(!showAddProject)} className="btn-light">
            + Tạo dự án mới
          </button>
        </div>
      </PageBanner>

      {/* Form tạo dự án */}
      {showAddProject && (
        <div className="card border border-primary-100 bg-primary-50/20 animate-fade-in">
          <h2 className="font-semibold text-lg mb-4 text-primary-900">Khởi tạo Dự án Mới</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên dự án</label>
              <input
                className="input-field"
                placeholder="VD: Nền tảng E-commerce B2B"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hạn hoàn thành dự kiến</label>
              <input
                type="date"
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
                value={projectForm.expected_end_date}
                onChange={(e) => setProjectForm({ ...projectForm, expected_end_date: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả mục tiêu dự án</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder="Mô tả phạm vi, yêu cầu chất lượng..."
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => createProjectMutation.mutate(projectForm)}
              disabled={!projectForm.name || createProjectMutation.isPending}
              className="btn-primary"
            >
              {createProjectMutation.isPending ? 'Đang tạo...' : 'Xác nhận tạo dự án'}
            </button>
            <button onClick={() => setShowAddProject(false)} className="btn-secondary">
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Thanh công cụ: Lọc trạng thái, Tìm kiếm, Sắp xếp & Chuyển chế độ xem */}
      <div className="card space-y-3 !p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
          {/* Tabs lọc theo trạng thái */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              ['ALL', 'Tất cả', projects.length],
              ...Object.entries(PROJECT_STATUS_META).map(([k, v]) => [k, v.label, statusCounts[k] || 0]),
            ].map(([key, label, count]) => {
              const active = statusFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label} <span className={active ? 'text-white/90' : 'text-gray-400'}>({count})</span>
                </button>
              );
            })}
          </div>

          {/* Chuyển đổi cách xem dự án: Dạng thẻ / Dạng bảng / Kanban */}
          <div className="inline-flex items-center rounded-xl bg-gray-100 p-1 gap-0.5">
            {[
              { id: 'grid', label: 'Dạng thẻ', icon: 'grid' },
              { id: 'table', label: 'Dạng bảng', icon: 'table' },
              { id: 'kanban', label: 'Kanban', icon: 'board' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setViewMode(m.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === m.id
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon name={m.icon} className="w-3.5 h-3.5" />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tìm kiếm & Sắp xếp */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Icon name="search" className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              className="input-field !pl-9 text-sm"
              placeholder="Tìm theo tên dự án, mô tả hoặc tên vị trí công việc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field w-auto text-sm !py-2"
            >
              <option value="newest">Mới tạo nhất</option>
              <option value="deadline_asc">Hạn dự kiến gần nhất</option>
              <option value="jobs_desc">Nhiều vị trí tuyển nhất</option>
              <option value="members_desc">Nhiều thành viên nhất</option>
            </select>
            {(statusFilter !== 'ALL' || searchQuery.trim()) && (
              <button
                type="button"
                onClick={() => { setStatusFilter('ALL'); setSearchQuery(''); }}
                className="text-xs text-red-500 hover:text-red-700 underline font-medium whitespace-nowrap ml-1"
              >
                Xóa lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chế độ 2: Dạng bảng (Table View) */}
      {viewMode === 'table' && (
        <div className="card !p-0 overflow-hidden">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Không tìm thấy dự án nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gradient-to-r from-slate-50 to-primary-50/60 border-b text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="p-3.5">Dự án</th>
                    <th className="p-3.5">Trạng thái</th>
                    <th className="p-3.5">Hạn dự kiến</th>
                    <th className="p-3.5">Vị trí & Ứng viên</th>
                    <th className="p-3.5">Nhân sự & Thanh toán</th>
                    <th className="p-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProjects.map((project) => {
                    const pStatus = PROJECT_STATUS_META[project.status] || { label: project.status, color: 'bg-primary-100 text-primary-700' };
                    const ps = project.payment_summary || {};
                    const as = project.application_summary || {};
                    return (
                      <tr key={project.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5 max-w-xs">
                          <Link
                            to={`/admin/projects/${project.id}/jobs`}
                            className="font-bold text-gray-900 hover:text-primary-700 hover:underline truncate block"
                            title={project.name}
                          >
                            {project.name}
                          </Link>
                          {project.description && (
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5" title={project.description}>{project.description}</p>
                          )}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <select
                            value={project.status}
                            disabled={updateProjectStatusMutation.isPending}
                            onChange={(e) => handleChangeProjectStatus(project, e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400 ${pStatus.color}`}
                          >
                            {Object.entries(PROJECT_STATUS_META)
                              .filter(([k]) => k !== 'COMPLETED' || project.status === 'COMPLETED')
                              .map(([k, v]) => (
                                <option key={k} value={k} className="bg-white text-gray-800 font-normal">{v.label}</option>
                              ))}
                          </select>
                        </td>
                        <td className="p-3.5 text-xs text-gray-600 whitespace-nowrap">
                          {project.expected_end_date ? formatDate(project.expected_end_date) : '—'}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <Link
                            to={`/admin/projects/${project.id}/jobs`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold transition-colors"
                          >
                            <Icon name="briefcase" className="w-3.5 h-3.5" />
                            <span>{project.ProjectJobs?.length || 0} vị trí</span>
                            {as.total > 0 && <span className="text-slate-500 font-normal">· {as.total} UV</span>}
                            {as.pending > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-primary-600 text-white text-[10px] font-bold leading-none">
                                {as.pending} mới
                              </span>
                            )}
                          </Link>
                        </td>
                        <td className="p-3.5 whitespace-nowrap text-xs">
                          <div className="text-gray-700 font-medium">
                            {ps.members || 0} thành viên
                            {ps.open_tasks > 0 && <span className="text-amber-600"> · {ps.open_tasks} task mở</span>}
                          </div>
                          {ps.total_amount > 0 && (
                            <div className="text-[11px] text-emerald-700 mt-0.5">
                              Đã trả {ps.paid || 0}/{ps.members || 0} ({formatMoney(ps.paid_amount)})
                            </div>
                          )}
                          {project.status === 'COMPLETED' && project.evaluation_summary?.members > 0 && (
                            <div className={`text-[11px] mt-0.5 ${project.evaluation_summary.evaluated < project.evaluation_summary.members ? 'text-amber-600 font-semibold' : 'text-emerald-700'}`}>
                              Đã chấm điểm {project.evaluation_summary.evaluated}/{project.evaluation_summary.members}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 whitespace-nowrap text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <Link
                              to={`/admin/projects/${project.id}/jobs/new`}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium"
                              title="Thêm vị trí tuyển dụng"
                            >
                              + Vị trí
                            </Link>
                            {project.status === 'COMPLETED' && project.evaluation_summary?.members > 0 && (
                              <button
                                type="button"
                                onClick={() => navigate(`/admin/projects/${project.id}/evaluations`)}
                                className={`px-2.5 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 ${project.evaluation_summary.evaluated < project.evaluation_summary.members ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-amber-50 hover:bg-amber-100 text-amber-700'}`}
                                title="Chấm điểm năng lực cho thành viên của dự án"
                              >
                                <Icon name="star" className="w-3.5 h-3.5" />Chấm điểm
                              </button>
                            )}
                            {project.Workspace ? (
                              <Link
                                to={`/admin/workspaces/${project.Workspace.id}`}
                                className="px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-xs font-semibold"
                              >
                                Workspace →
                              </Link>
                            ) : (
                              <button
                                type="button"
                                onClick={() => createWorkspaceMutation.mutate(project.id)}
                                disabled={createWorkspaceMutation.isPending}
                                className="px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-xs font-semibold disabled:opacity-50"
                              >
                                + Tạo WS
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(project)}
                              disabled={deleteProjectMutation.isPending}
                              className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                              title="Xóa dự án"
                            >
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Chế độ 3: Dạng bảng Kanban theo trạng thái (Kanban View) */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-3">
          {Object.entries(PROJECT_STATUS_META).map(([statusKey, statusMeta]) => {
            const colProjects = filteredProjects.filter((p) => p.status === statusKey);
            return (
              <div
                key={statusKey}
                className="w-80 flex-shrink-0 bg-gray-50/90 border border-gray-200 rounded-2xl p-3 flex flex-col max-h-[75vh]"
              >
                <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-gray-200">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusMeta.color}`}>
                      {statusMeta.label}
                    </span>
                    <span className="text-xs font-bold text-gray-500">({colProjects.length})</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {colProjects.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-8 italic">Không có dự án</p>
                  ) : (
                    colProjects.map((project) => {
                      const ps = project.payment_summary || {};
                      const as = project.application_summary || {};
                      return (
                        <div
                          key={project.id}
                          className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm hover:shadow-md transition-shadow space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              to={`/admin/projects/${project.id}/jobs`}
                              className="font-bold text-sm text-gray-900 hover:text-primary-700 hover:underline leading-snug"
                            >
                              {project.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(project)}
                              className="text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                              title="Xóa dự án"
                            >
                              <Icon name="trash" className="w-4 h-4" />
                            </button>
                          </div>

                          {project.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">{project.description}</p>
                          )}

                          <div className="text-xs text-gray-600 space-y-1 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                            <p className="flex items-center justify-between">
                              <span className="text-gray-500">Vị trí tuyển:</span>
                              <strong>
                                {project.ProjectJobs?.length || 0} vị trí
                                {as.total > 0 && ` · ${as.total} UV`}
                              </strong>
                            </p>
                            <p className="flex items-center justify-between">
                              <span className="text-gray-500">Thành viên WS:</span>
                              <strong>{ps.members || 0} người</strong>
                            </p>
                            {project.expected_end_date && (
                              <p className="flex items-center justify-between">
                                <span className="text-gray-500">Hạn dự kiến:</span>
                                <span>{formatDate(project.expected_end_date)}</span>
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1">
                            <Link
                              to={`/admin/projects/${project.id}/jobs`}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium inline-flex items-center gap-1"
                            >
                              <span>Vị trí & UV ({project.ProjectJobs?.length || 0})</span>
                              {as.pending > 0 && (
                                <span className="px-1.5 py-0.5 rounded-full bg-primary-600 text-white text-[10px] font-bold leading-none">
                                  {as.pending}
                                </span>
                              )}
                            </Link>
                            <Link
                              to={`/admin/projects/${project.id}/jobs/new`}
                              className="px-2 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded text-xs font-medium"
                            >
                              + Vị trí
                            </Link>
                            {project.status === 'COMPLETED' && project.evaluation_summary?.members > 0 && (
                              <button
                                type="button"
                                onClick={() => navigate(`/admin/projects/${project.id}/evaluations`)}
                                className={`px-2 py-1 rounded text-xs font-semibold inline-flex items-center gap-1 ${project.evaluation_summary.evaluated < project.evaluation_summary.members ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-amber-50 hover:bg-amber-100 text-amber-700'}`}
                              >
                                <Icon name="star" className="w-3.5 h-3.5" />Chấm điểm ({project.evaluation_summary.evaluated}/{project.evaluation_summary.members})
                              </button>
                            )}
                            {project.Workspace ? (
                              <Link
                                to={`/admin/workspaces/${project.Workspace.id}`}
                                className="px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-xs font-semibold ml-auto"
                              >
                                Workspace →
                              </Link>
                            ) : (
                              <button
                                type="button"
                                onClick={() => createWorkspaceMutation.mutate(project.id)}
                                className="px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-xs font-semibold ml-auto"
                              >
                                + Tạo WS
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Chế độ 1: Dạng thẻ (Grid View) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.length === 0 && (
            <div className="card md:col-span-2 text-center py-10 text-gray-400">
              {projects.length === 0
                ? 'Chưa có dự án nào được tạo. Nhấn nút tạo dự án ở trên để bắt đầu.'
                : 'Không tìm thấy dự án nào phù hợp với bộ lọc hiện tại.'}
            </div>
          )}

          {filteredProjects.map((project) => {
            const pStatus = PROJECT_STATUS_META[project.status] || { label: project.status, color: 'bg-primary-100 text-primary-700' };
            const as = project.application_summary || {};
            return (
              <div key={project.id} className="card hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <Link
                      to={`/admin/projects/${project.id}/jobs`}
                      className="font-bold text-lg text-gray-900 hover:text-primary-700 hover:underline"
                    >
                      {project.name}
                    </Link>
                    <div className="flex gap-2 items-center flex-shrink-0">
                      <select
                        value={project.status}
                        disabled={updateProjectStatusMutation.isPending}
                        onChange={(e) => handleChangeProjectStatus(project, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400 ${pStatus.color}`}
                      >
                        {Object.entries(PROJECT_STATUS_META)
                          .filter(([k]) => k !== 'COMPLETED' || project.status === 'COMPLETED')
                          .map(([k, v]) => (
                            <option key={k} value={k} className="bg-white text-gray-800 font-normal">
                              {v.label}
                            </option>
                          ))}
                      </select>
                      <button
                        onClick={() => handleDeleteProject(project)}
                        disabled={deleteProjectMutation.isPending}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        title="Xóa dự án"
                        aria-label="Xóa dự án"
                      >
                        <Icon name="trash" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                  <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1.5 text-gray-600 mb-4 border border-gray-100">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="briefcase" className="w-4 h-4 text-primary-600" />
                        <strong>Vị trí tuyển dụng:</strong> {project.ProjectJobs?.length || 0} vị trí
                        {as.total > 0 && <span>· <strong>{as.total}</strong> hồ sơ ứng tuyển</span>}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {as.pending > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-primary-600 text-white font-bold text-[11px]">
                            {as.pending} chờ duyệt
                          </span>
                        )}
                        {as.reschedule > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[11px]">
                            ⚠ {as.reschedule} xin dời lịch
                          </span>
                        )}
                      </div>
                    </div>
                    {project.ProjectJobs?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {project.ProjectJobs.slice(0, 4).map((j) => (
                          <Link
                            key={j.id}
                            to={`/admin/projects/${project.id}/jobs?job=${j.id}`}
                            className="px-2 py-0.5 rounded-md bg-white border border-gray-200 hover:border-primary-300 text-gray-700 hover:text-primary-700 font-medium transition-colors"
                          >
                            {j.title}
                          </Link>
                        ))}
                        {project.ProjectJobs.length > 4 && (
                          <Link
                            to={`/admin/projects/${project.id}/jobs`}
                            className="px-1.5 py-0.5 text-gray-400 hover:text-primary-700"
                          >
                            +{project.ProjectJobs.length - 4} vị trí khác
                          </Link>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tình hình thanh toán thù lao của dự án */}
                  {(project.status === 'COMPLETED' || (project.payment_summary?.members > 0 && project.payment_summary.total_amount > 0)) && (() => {
                    const ps = project.payment_summary;
                    const pct = ps.members ? Math.round((ps.paid / ps.members) * 100) : 0;
                    return (
                      <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="font-semibold text-emerald-800 inline-flex items-center gap-1">
                            <Icon name="card" className="w-3.5 h-3.5" />Thanh toán thù lao
                          </span>
                          <span className="font-bold text-emerald-700">{ps.paid}/{ps.members} thành viên đã nhận</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-emerald-100 overflow-hidden">
                          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-1.5 text-[11px] text-slate-600">
                          Đã trả {formatMoney(ps.paid_amount)} / {formatMoney(ps.total_amount)}
                          {(ps.pending > 0 || ps.failed > 0) && <> · {(ps.pending || 0) + (ps.failed || 0)} chưa thanh toán</>}
                          {ps.none > 0 && <> · {ps.none} chưa có khoản</>}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Tình hình chấm điểm năng lực */}
                  {project.status === 'COMPLETED' && project.evaluation_summary?.members > 0 && (() => {
                    const es = project.evaluation_summary;
                    const left = es.members - es.evaluated;
                    return (
                      <div className={`mb-4 rounded-lg border p-3 ${left > 0 ? 'border-amber-200 bg-amber-50/60' : 'border-emerald-100 bg-emerald-50/50'}`}>
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className={`font-semibold inline-flex items-center gap-1 ${left > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
                            <Icon name="star" className="w-3.5 h-3.5" />Chấm điểm năng lực
                          </span>
                          <span className={`font-bold ${left > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                            {es.evaluated}/{es.members} thành viên đã chấm
                          </span>
                        </div>
                        {left > 0 && <p className="mt-1 text-[11px] text-slate-600">Còn {left} thành viên chưa được chấm điểm.</p>}
                      </div>
                    );
                  })()}
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/admin/projects/${project.id}/jobs`}
                      className={`px-3 py-1.5 rounded text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                        as.pending > 0
                          ? 'bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <Icon name="briefcase" className="w-3.5 h-3.5" />
                      <span>Vị trí & Ứng viên ({project.ProjectJobs?.length || 0})</span>
                      {as.pending > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-primary-600 text-white text-[10px] font-bold leading-none">
                          {as.pending} mới
                        </span>
                      )}
                    </Link>
                    <Link
                      to={`/admin/projects/${project.id}/jobs/new`}
                      className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded text-xs font-medium inline-flex items-center"
                    >
                      + Thêm Vị Trí
                    </Link>
                    {project.Workspace && ['PLANNING', 'RECRUITING', 'IN_PROGRESS'].includes(project.status) && (
                      <button
                        onClick={() => handleCloseProject(project)}
                        disabled={closeProjectMutation.isPending || !(project.payment_summary?.members > 0)}
                        title={project.payment_summary?.members > 0 ? 'Nghiệm thu dự án và chuyển sang thanh toán thù lao' : 'Dự án chưa có thành viên để thanh toán'}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} /> Đóng dự án
                      </button>
                    )}
                    {project.status === 'COMPLETED' && project.evaluation_summary?.members > 0 && (
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/projects/${project.id}/evaluations`)}
                        className={`px-3 py-1.5 rounded text-xs font-medium inline-flex items-center gap-1 ${project.evaluation_summary.evaluated < project.evaluation_summary.members ? 'bg-amber-500 hover:bg-amber-600 text-white font-semibold' : 'bg-amber-50 hover:bg-amber-100 text-amber-700'}`}
                      >
                        <Icon name="star" className="w-3.5 h-3.5" /> {project.evaluation_summary.evaluated < project.evaluation_summary.members ? 'Chấm điểm thành viên' : 'Xem điểm & thống kê'}
                      </button>
                    )}
                    {project.status === 'COMPLETED' && (
                      <Link
                        to={`/admin/payments?view=projects${project.Workspace ? `&project=${project.Workspace.id}` : ''}`}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded text-xs font-medium inline-flex items-center gap-1"
                      >
                        <Icon name="card" className="w-3.5 h-3.5" /> Thanh toán thù lao
                      </Link>
                    )}
                  </div>

                  {project.Workspace ? (
                    <Link
                      to={`/admin/workspaces/${project.Workspace.id}`}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Vào Workspace →
                    </Link>
                  ) : (
                    <button
                      onClick={() => createWorkspaceMutation.mutate(project.id)}
                      disabled={createWorkspaceMutation.isPending}
                      className="btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
                    >
                      {createWorkspaceMutation.isPending ? 'Đang tạo...' : '+ Khởi tạo Workspace'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
