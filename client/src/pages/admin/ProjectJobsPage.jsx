import { useState, useMemo } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { workspaceApi } from '@/api/workspaceApi';
import { projectJobApi } from '@/api/projectJobApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Icon, { IconBadge } from '@/components/common/Icon';
import Avatar from '@/components/common/Avatar';
import PageBanner from '@/components/common/PageBanner';
import { SkillTag } from '@/components/common/Badges';
import { useConfirm } from '@/components/common/ConfirmDialog';
import ProjectJobFormModal from '@/components/admin/ProjectJobFormModal';
import { ManageInterviewersModal, ScheduleInterviewModal } from '@/components/admin/ProjectInterviewModals';
import { PROJECT_APPLICATION_STATUS } from '@/utils/applicationStatus';
import {
  EXPERIENCE_LABELS,
  PROJECT_STATUS_META,
  deadlineInfo,
  formatDate,
  formatMoney,
} from '@/utils/jobMeta';
import { timeAgo } from '@/utils/timeAgo';

const STATUS_FILTERS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ duyệt' },
  { key: 'REVIEWING', label: 'Đang xét duyệt' },
  { key: 'INTERVIEW', label: 'Mời phỏng vấn' },
  { key: 'RESCHEDULE', label: 'Xin dời lịch' },
  { key: 'ACCEPTED', label: 'Trúng tuyển' },
  { key: 'REJECTED', label: 'Từ chối' },
];

export default function ProjectJobsPage() {
  const { projectId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const confirm = useConfirm();

  const selectedJobId = searchParams.get('job') || 'ALL';
  const statusFilter = searchParams.get('status') || 'ALL';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority'); // 'priority' | 'newest' | 'competency' | 'avg_eval'
  const [showJobInfo, setShowJobInfo] = useState(false);
  const [expandedLetters, setExpandedLetters] = useState({});

  // Modals state
  const [jobModal, setJobModal] = useState(null); // null | { job: null | ProjectJob }
  const [interviewApp, setInterviewApp] = useState(null);
  const [showManageInterviewers, setShowManageInterviewers] = useState(false);

  const { data: projectRes, isLoading: projectLoading, isError: projectError } = useQuery({
    queryKey: ['admin-project', projectId],
    queryFn: () => workspaceApi.getProjectById(projectId),
    retry: false,
  });

  const { data: jobsRes, isLoading: jobsLoading } = useQuery({
    queryKey: ['admin-project-jobs', projectId],
    queryFn: () => projectJobApi.getAdminProjectJobs(projectId),
    enabled: !!projectId,
    refetchInterval: 20000,
  });

  const project = projectRes?.data?.data;
  const projectJobs = useMemo(() => jobsRes?.data?.data || [], [jobsRes]);

  const setSelectedJobId = (jobId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!jobId || jobId === 'ALL') next.delete('job');
      else next.set('job', jobId);
      return next;
    }, { replace: true });
  };

  const setStatusFilter = (status) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!status || status === 'ALL') next.delete('status');
      else next.set('status', status);
      return next;
    }, { replace: true });
  };

  // Đóng / Mở lại vị trí
  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => projectJobApi.updateAdminProjectJob(id, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-project-jobs', projectId] });
      qc.invalidateQueries({ queryKey: ['admin-project', projectId] });
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      qc.invalidateQueries({ queryKey: ['project-jobs'] });
      toast.success(res.data?.message || 'Đã cập nhật vị trí');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi cập nhật vị trí'),
  });

  const toggleJobStatus = async (job) => {
    const closing = job.status === 'OPEN';
    const ok = await confirm({
      title: closing ? 'Đóng vị trí tuyển dụng' : 'Mở lại vị trí tuyển dụng',
      message: closing
        ? `Đóng vị trí "${job.title}"? Ứng viên sẽ không thể nộp thêm hồ sơ vào vị trí này.`
        : `Mở lại vị trí "${job.title}"? Vị trí sẽ hiển thị lại cho ứng viên (nhớ gia hạn nếu đã quá hạn nộp).`,
      confirmText: closing ? 'Đóng vị trí' : 'Mở lại',
      tone: closing ? 'danger' : 'primary',
    });
    if (ok) updateJobMutation.mutate({ id: job.id, data: { status: closing ? 'CLOSED' : 'OPEN' } });
  };

  // Duyệt / Đổi trạng thái hồ sơ ứng viên
  const reviewAppMutation = useMutation({
    mutationFn: ({ appId, status }) => projectJobApi.updateProjectApplicationStatus(appId, { status }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-project-jobs', projectId] });
      qc.invalidateQueries({ queryKey: ['admin-project', projectId] });
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      toast.success(res.data?.message || 'Đã cập nhật trạng thái hồ sơ');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi duyệt hồ sơ'),
  });

  const handleChangeAppStatus = async (app, nextStatus) => {
    if (nextStatus === app.status) return;
    const candidateName = app.CandidateProfile?.User?.full_name || 'ứng viên';
    if (nextStatus === 'ACCEPTED') {
      const ok = await confirm({
        title: 'Duyệt ứng viên vào Workspace',
        message: `Xác nhận duyệt ${candidateName} vào vị trí "${app._jobTitle || 'Vị trí dự án'}"? Hệ thống sẽ tự động thêm ứng viên vào Workspace của dự án, gửi email thông báo và khóa trạng thái hồ sơ này.`,
        confirmText: 'Duyệt vào Workspace',
        tone: 'primary',
      });
      if (!ok) return;
    } else if (nextStatus === 'REJECTED') {
      const ok = await confirm({
        title: 'Từ chối hồ sơ ứng tuyển',
        message: `Xác nhận từ chối hồ sơ của ${candidateName}? Hệ thống sẽ gửi email thông báo kết quả cho ứng viên.`,
        confirmText: 'Từ chối hồ sơ',
        tone: 'danger',
      });
      if (!ok) return;
    }
    reviewAppMutation.mutate({ appId: app.id, status: nextStatus });
  };

  // Vị trí đang chọn (nếu jobId trên URL không tồn tại thì tự động coi như 'ALL')
  const selectedJob = useMemo(
    () => (selectedJobId === 'ALL' ? null : projectJobs.find((j) => j.id === selectedJobId) || null),
    [projectJobs, selectedJobId]
  );

  // Gom toàn bộ hồ sơ (hoặc theo vị trí đang chọn) kèm thông tin vị trí
  const allProjectApps = useMemo(() => {
    const list = [];
    for (const job of projectJobs) {
      for (const app of job.ProjectApplications || []) {
        const members = app.CandidateProfile?.WorkspaceMembers || [];
        const scored = members.filter((m) => m.CandidateEvaluation);
        const avgEval =
          scored.length > 0
            ? scored.reduce((s, m) => s + parseFloat(m.CandidateEvaluation.score), 0) / scored.length
            : null;
        list.push({
          ...app,
          _jobId: job.id,
          _jobTitle: job.title,
          _jobBudget: job.budget,
          _avgEval: avgEval,
        });
      }
    }
    return list;
  }, [projectJobs]);

  const scopedApps = useMemo(() => {
    if (!selectedJob) return allProjectApps;
    return allProjectApps.filter((a) => a._jobId === selectedJob.id);
  }, [allProjectApps, selectedJob]);

  // Đếm số lượng theo từng trạng thái trong phạm vi vị trí đang chọn
  const statusCounts = useMemo(() => {
    const counts = {
      ALL: scopedApps.length,
      PENDING: 0,
      REVIEWING: 0,
      INTERVIEW: 0,
      RESCHEDULE: 0,
      ACCEPTED: 0,
      REJECTED: 0,
    };
    for (const a of scopedApps) {
      if (counts[a.status] !== undefined) counts[a.status] += 1;
      if (a.status === 'INTERVIEW' && a.interview_response === 'RESCHEDULE_REQUESTED') {
        counts.RESCHEDULE += 1;
      }
    }
    return counts;
  }, [scopedApps]);

  // Lọc & sắp xếp danh sách hồ sơ hiển thị
  const filteredApps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return scopedApps
      .filter((app) => {
        if (statusFilter === 'RESCHEDULE') {
          if (!(app.status === 'INTERVIEW' && app.interview_response === 'RESCHEDULE_REQUESTED')) return false;
        } else if (statusFilter !== 'ALL' && app.status !== statusFilter) {
          return false;
        }
        if (q) {
          const profile = app.CandidateProfile;
          const user = profile?.User;
          const matchName = user?.full_name?.toLowerCase().includes(q);
          const matchEmail = user?.email?.toLowerCase().includes(q);
          const matchPhone = profile?.phone?.toLowerCase().includes(q);
          const matchTitle = profile?.professional_title?.toLowerCase().includes(q);
          const matchJob = app._jobTitle?.toLowerCase().includes(q);
          const matchSkill = profile?.Skills?.some((s) => s.name?.toLowerCase().includes(q));
          if (!matchName && !matchEmail && !matchPhone && !matchTitle && !matchJob && !matchSkill) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'competency') {
          return (parseFloat(b.CandidateProfile?.competency_score) || 0) - (parseFloat(a.CandidateProfile?.competency_score) || 0);
        }
        if (sortBy === 'avg_eval') {
          return (b._avgEval ?? -1) - (a._avgEval ?? -1);
        }
        if (sortBy === 'newest') {
          return new Date(b.applied_at || 0) - new Date(a.applied_at || 0);
        }
        // 'priority': Xin dời lịch -> Chờ duyệt -> Mới nộp nhất
        const aResched = a.status === 'INTERVIEW' && a.interview_response === 'RESCHEDULE_REQUESTED' ? 1 : 0;
        const bResched = b.status === 'INTERVIEW' && b.interview_response === 'RESCHEDULE_REQUESTED' ? 1 : 0;
        if (bResched !== aResched) return bResched - aResched;
        const aPend = a.status === 'PENDING' ? 1 : 0;
        const bPend = b.status === 'PENDING' ? 1 : 0;
        if (bPend !== aPend) return bPend - aPend;
        return new Date(b.applied_at || 0) - new Date(a.applied_at || 0);
      });
  }, [scopedApps, statusFilter, searchQuery, sortBy]);

  if (projectLoading || jobsLoading) return <LoadingSpinner />;

  if (projectError || !project) {
    return (
      <div className="card text-center py-14">
        <IconBadge name="alert" tone="amber" size="lg" className="mx-auto mb-3" />
        <p className="font-semibold text-slate-800">Không tìm thấy dự án</p>
        <p className="text-sm text-slate-500 mt-1">Dự án có thể đã bị xóa hoặc đường dẫn không hợp lệ.</p>
        <Link to="/admin/projects" className="btn-primary inline-block mt-4">
          ← Về danh sách dự án
        </Link>
      </div>
    );
  }

  const pStatus = PROJECT_STATUS_META[project.status] || { label: project.status, color: 'bg-primary-100 text-primary-700' };
  const totalPositions = projectJobs.length;
  const totalAppsAll = allProjectApps.length;
  const totalPendingAll = allProjectApps.filter((a) => a.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Banner đầu trang */}
      <PageBanner
        compact
        icon="briefcase"
        title={`Vị trí & Ứng viên: ${project.name}`}
        subtitle={`${pStatus.label} · ${totalPositions} vị trí tuyển dụng · ${totalAppsAll} hồ sơ ứng tuyển${
          totalPendingAll > 0 ? ` (${totalPendingAll} hồ sơ chờ duyệt)` : ''
        }${project.expected_end_date ? ` · Hạn dự kiến: ${formatDate(project.expected_end_date)}` : ''}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin/projects')}
            className="btn-light inline-flex items-center gap-1.5"
          >
            <Icon name="chevronLeft" className="w-4 h-4" />
            Về danh sách dự án
          </button>
          <button
            type="button"
            onClick={() => setShowManageInterviewers(true)}
            className="btn-glass inline-flex items-center gap-1.5"
          >
            <Icon name="users" className="w-4 h-4" />
            Người phỏng vấn
          </button>
          {project.Workspace && (
            <Link
              to={`/admin/workspaces/${project.Workspace.id}`}
              className="btn-glass inline-flex items-center gap-1.5"
            >
              <Icon name="board" className="w-4 h-4" />
              Workspace →
            </Link>
          )}
          <button
            type="button"
            onClick={() => setJobModal({ job: null })}
            className="btn-light inline-flex items-center gap-1.5"
          >
            + Thêm vị trí tuyển dụng
          </button>
        </div>
      </PageBanner>

      {/* Trường hợp dự án chưa có vị trí nào */}
      {projectJobs.length === 0 ? (
        <div className="card text-center py-16">
          <IconBadge name="briefcase" size="lg" className="mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Dự án chưa có vị trí tuyển dụng nào
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
            Hãy thêm các vị trí công việc cần tuyển cho dự án <strong>{project.name}</strong> để ứng viên IT bắt đầu nộp hồ sơ.
          </p>
          <button
            type="button"
            onClick={() => setJobModal({ job: null })}
            className="btn-primary inline-flex items-center gap-1.5"
          >
            + Tạo vị trí tuyển dụng đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[21rem_minmax(0,1fr)] gap-6 items-start">
          {/* ─── CỘT TRÁI: Danh sách vị trí tuyển dụng của dự án ─── */}
          <aside className="space-y-3 lg:sticky lg:top-20">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Vị trí trong dự án ({projectJobs.length})
              </h2>
              <button
                type="button"
                onClick={() => setJobModal({ job: null })}
                className="text-xs font-semibold text-primary-700 hover:text-primary-800 hover:underline"
              >
                + Thêm vị trí
              </button>
            </div>

            {/* Thẻ "Tất cả vị trí" */}
            <button
              type="button"
              onClick={() => setSelectedJobId('ALL')}
              className={`w-full text-left rounded-2xl border p-3.5 transition-all ${
                !selectedJob
                  ? 'bg-primary-50/80 border-primary-600 ring-2 ring-primary-200 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-primary-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      !selectedJob ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon name="folder" className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold truncate ${!selectedJob ? 'text-primary-900' : 'text-slate-900'}`}>
                      Tất cả vị trí ({projectJobs.length})
                    </p>
                    <p className="text-xs text-slate-500">
                      Xem toàn bộ ứng viên của dự án
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    {totalAppsAll} hồ sơ
                  </span>
                  {totalPendingAll > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary-600 text-white">
                      {totalPendingAll} mới
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Danh sách từng vị trí */}
            <div className="space-y-2.5 max-h-[calc(100vh-14rem)] overflow-y-auto pr-0.5">
              {projectJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                const apps = job.ProjectApplications || [];
                const pendingCount = apps.filter((a) => a.status === 'PENDING').length;
                const acceptedCount = apps.filter((a) => a.status === 'ACCEPTED').length;
                const rescheduleCount = apps.filter(
                  (a) => a.status === 'INTERVIEW' && a.interview_response === 'RESCHEDULE_REQUESTED'
                ).length;
                const dl = deadlineInfo(job.deadline);
                const isClosed = job.status !== 'OPEN';

                return (
                  <div
                    key={job.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedJobId(job.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedJobId(job.id);
                      }
                    }}
                    className={`rounded-2xl border p-3.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary-50/70 border-primary-600 ring-2 ring-primary-200 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-primary-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-bold text-sm leading-snug ${isSelected ? 'text-primary-900' : 'text-slate-900'}`}>
                        {job.title}
                      </h3>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          isClosed
                            ? 'bg-red-100 text-red-700'
                            : dl.expired
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isClosed ? 'Đã đóng' : dl.expired ? 'Hết hạn' : 'Đang mở'}
                      </span>
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                      <span className="font-bold text-emerald-700">{formatMoney(job.budget)}</span>
                      <span>· Cần {job.quantity || 1} người</span>
                      {job.deadline && <span>· Hạn {formatDate(job.deadline)}</span>}
                    </div>

                    {job.Skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.Skills.slice(0, 4).map((s) => (
                          <span
                            key={s.id}
                            className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium"
                          >
                            {s.name}
                          </span>
                        ))}
                        {job.Skills.length > 4 && (
                          <span className="text-[10px] text-slate-400 self-center">+{job.Skills.length - 4}</span>
                        )}
                      </div>
                    )}

                    {/* Số liệu ứng viên của vị trí */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="font-semibold text-slate-700">
                          {apps.length} hồ sơ
                        </span>
                        {acceptedCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                            {acceptedCount}/{job.quantity || 1} trúng tuyển
                          </span>
                        )}
                        {pendingCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-primary-600 text-white font-bold text-[10px]">
                            {pendingCount} mới
                          </span>
                        )}
                        {rescheduleCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px]">
                            ⚠ {rescheduleCount} dời lịch
                          </span>
                        )}
                      </div>

                      <div
                        className="flex items-center gap-2 text-xs font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => setJobModal({ job })}
                          className="text-primary-700 hover:underline"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleJobStatus(job)}
                          className={job.status === 'OPEN' ? 'text-amber-700 hover:underline' : 'text-emerald-700 hover:underline'}
                        >
                          {job.status === 'OPEN' ? 'Đóng' : 'Mở lại'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* ─── CỘT PHẢI: Chi tiết vị trí & Danh sách hồ sơ ứng viên ─── */}
          <div className="space-y-4 min-w-0">
            {/* Thẻ thông tin vị trí đang chọn */}
            {selectedJob && (
              <div className="card !p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-extrabold text-slate-900">{selectedJob.title}</h2>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          selectedJob.status !== 'OPEN'
                            ? 'bg-red-100 text-red-700'
                            : deadlineInfo(selectedJob.deadline).expired
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {selectedJob.status !== 'OPEN'
                          ? 'Đã đóng'
                          : deadlineInfo(selectedJob.deadline).expired
                          ? 'Đã hết hạn nộp'
                          : 'Đang mở tuyển'}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
                        <Icon name="cash" className="w-4 h-4" />
                        Thù lao: {formatMoney(selectedJob.budget)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="users" className="w-4 h-4 text-slate-400" />
                        Chỉ tiêu: <strong>{statusCounts.ACCEPTED}/{selectedJob.quantity || 1}</strong> người trúng tuyển
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="clock" className="w-4 h-4 text-slate-400" />
                        Kinh nghiệm: {EXPERIENCE_LABELS[selectedJob.experience] || 'Không yêu cầu'}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="calendar" className="w-4 h-4 text-slate-400" />
                        Hạn nộp: {selectedJob.deadline ? formatDate(selectedJob.deadline) : 'Không giới hạn'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/projects/${selectedJob.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary text-xs !py-1.5 !px-3 inline-flex items-center gap-1.5"
                    >
                      <Icon name="external" className="w-3.5 h-3.5" />
                      Xem như ứng viên
                    </Link>
                    <button
                      type="button"
                      onClick={() => setJobModal({ job: selectedJob })}
                      className="btn-secondary text-xs !py-1.5 !px-3 inline-flex items-center gap-1.5"
                    >
                      <Icon name="pencil" className="w-3.5 h-3.5" />
                      Sửa / Gia hạn
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleJobStatus(selectedJob)}
                      disabled={updateJobMutation.isPending}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors inline-flex items-center gap-1.5 ${
                        selectedJob.status === 'OPEN'
                          ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      <Icon name={selectedJob.status === 'OPEN' ? 'lock' : 'refresh'} className="w-3.5 h-3.5" />
                      {selectedJob.status === 'OPEN' ? 'Đóng vị trí' : 'Mở lại vị trí'}
                    </button>
                  </div>
                </div>

                {/* Nút bật/tắt xem chi tiết mô tả & yêu cầu của vị trí */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.Skills?.map((s) => (
                      <SkillTag key={s.id} name={s.name} />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowJobInfo((v) => !v)}
                    className="text-xs font-semibold text-primary-700 hover:text-primary-800 inline-flex items-center gap-1"
                  >
                    <Icon name="chevronDown" className={`w-4 h-4 transition-transform ${showJobInfo ? 'rotate-180' : ''}`} />
                    {showJobInfo ? 'Thu gọn mô tả & yêu cầu vị trí' : 'Xem mô tả & yêu cầu vị trí'}
                  </button>
                </div>

                {showJobInfo && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-100 text-sm animate-fade-in">
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Mô tả công việc
                      </h4>
                      <p className="text-slate-700 whitespace-pre-line text-xs leading-relaxed">
                        {selectedJob.description || 'Chưa cập nhật mô tả công việc.'}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Yêu cầu ứng viên
                      </h4>
                      <p className="text-slate-700 whitespace-pre-line text-xs leading-relaxed">
                        {selectedJob.requirements || 'Chưa cập nhật yêu cầu ứng viên.'}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                        Quyền lợi được hưởng
                      </h4>
                      <p className="text-slate-700 whitespace-pre-line text-xs leading-relaxed">
                        {selectedJob.benefits || 'Chưa cập nhật quyền lợi.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Thanh công cụ lọc trạng thái & tìm kiếm ứng viên */}
            <div className="card !p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {STATUS_FILTERS.map((f) => {
                  const count = statusCounts[f.key] || 0;
                  if (f.key === 'RESCHEDULE' && count === 0 && statusFilter !== 'RESCHEDULE') return null;
                  const active = statusFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setStatusFilter(f.key)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                        active
                          ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                          : f.key === 'RESCHEDULE' && count > 0
                          ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                      }`}
                    >
                      {f.key === 'RESCHEDULE' && '⚠ '}
                      {f.label}{' '}
                      <span className={active ? 'text-white/90' : 'text-slate-400'}>({count})</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-slate-100">
                <div className="relative flex-1">
                  <Icon
                    name="search"
                    className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                  <input
                    type="text"
                    className="input-field !pl-9 text-sm"
                    placeholder="Tìm ứng viên theo tên, email, SĐT, chức danh hoặc kỹ năng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Sắp xếp:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-field w-auto text-sm !py-2"
                  >
                    <option value="priority">Ưu tiên cần xử lý trước</option>
                    <option value="newest">Mới nộp gần nhất</option>
                    <option value="competency">Điểm năng lực cao nhất</option>
                    <option value="avg_eval">Điểm đánh giá dự án cao nhất</option>
                  </select>
                  {(statusFilter !== 'ALL' || searchQuery.trim()) && (
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('ALL');
                        setSearchQuery('');
                      }}
                      className="text-xs text-red-600 hover:underline font-medium whitespace-nowrap"
                    >
                      Xóa lọc
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Danh sách hồ sơ ứng viên */}
            {scopedApps.length === 0 ? (
              <div className="card text-center py-14">
                <IconBadge name="inbox" size="lg" className="mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Chưa có ứng viên nào nộp hồ sơ{selectedJob ? ` cho vị trí "${selectedJob.title}"` : ' vào dự án này'}
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Khi ứng viên nộp đơn ứng tuyển, hồ sơ kèm CV và lịch phỏng vấn sẽ hiển thị đầy đủ tại đây.
                </p>
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="card text-center py-12 text-sm text-slate-400">
                Không tìm thấy hồ sơ ứng viên nào khớp với bộ lọc hiện tại.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApps.map((app) => {
                  const profile = app.CandidateProfile;
                  const user = profile?.User;
                  const fullName = user?.full_name || 'Ứng viên';
                  const skills = profile?.Skills || [];
                  const members = profile?.WorkspaceMembers || [];
                  const avgScore = app._avgEval !== null ? app._avgEval.toFixed(1) : null;
                  const competency = profile?.competency_score != null ? parseFloat(profile.competency_score) : null;
                  const st = PROJECT_APPLICATION_STATUS[app.status] || PROJECT_APPLICATION_STATUS.PENDING;
                  const cvUrl = app.cv_url || profile?.cv_url;
                  const isReschedule = app.status === 'INTERVIEW' && app.interview_response === 'RESCHEDULE_REQUESTED';
                  const isExpanded = !!expandedLetters[app.id];
                  const longLetter =
                    (app.cover_letter || '').length > 180 || (app.cover_letter || '').split('\n').length > 3;

                  return (
                    <div
                      key={app.id}
                      className={`card !p-5 transition-shadow hover:shadow-md ${
                        isReschedule
                          ? 'border-l-4 border-l-amber-500'
                          : app.status === 'PENDING'
                          ? 'border-l-4 border-l-primary-500'
                          : ''
                      }`}
                    >
                      <div className="flex flex-col xl:flex-row gap-4 xl:gap-6">
                        {/* Cột thông tin chính của ứng viên */}
                        <div className="flex gap-4 flex-1 min-w-0">
                          <Avatar name={fullName} src={profile?.avatar_url} size="lg" className="flex-shrink-0" />
                          <div className="min-w-0 flex-1 space-y-2">
                            {/* Dòng 1: Tên + Chức danh + Trạng thái + Vị trí (nếu đang xem tất cả) */}
                            <div className="flex flex-wrap items-center gap-2">
                              {profile?.id ? (
                                <Link
                                  to={`/admin/candidates/${profile.id}`}
                                  className="font-bold text-base text-slate-900 hover:text-primary-700 hover:underline"
                                  title="Mở trang hồ sơ năng lực đầy đủ của ứng viên"
                                >
                                  {fullName}
                                </Link>
                              ) : (
                                <span className="font-bold text-base text-slate-900">{fullName}</span>
                              )}

                              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${st.cls}`}>
                                {st.label}
                              </span>

                              {!selectedJob && app._jobTitle && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedJobId(app._jobId)}
                                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 hover:bg-primary-50 text-slate-700 hover:text-primary-700 border border-slate-200 transition-colors"
                                  title="Lọc theo vị trí này"
                                >
                                  <Icon name="briefcase" className="w-3 h-3" />
                                  {app._jobTitle}
                                </button>
                              )}
                            </div>

                            {profile?.professional_title && (
                              <p className="text-sm text-primary-700 font-medium">{profile.professional_title}</p>
                            )}

                            {/* Dòng 2: Chỉ số năng lực & kinh nghiệm dự án */}
                            <div className="flex flex-wrap items-center gap-2">
                              {competency !== null && !Number.isNaN(competency) && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-100">
                                  <Icon name="star" className="w-3.5 h-3.5" />
                                  Điểm năng lực: <strong>{competency.toFixed(1)}/10</strong>
                                </span>
                              )}
                              {avgScore && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">
                                  <Icon name="badge" className="w-3.5 h-3.5" />
                                  Đánh giá TB: <strong>{avgScore}/10</strong>
                                </span>
                              )}
                              {members.length > 0 && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                  <Icon name="folder" className="w-3.5 h-3.5" />
                                  {members.length} dự án DevHub
                                </span>
                              )}
                              {app.applied_at && (
                                <span
                                  className="inline-flex items-center gap-1 text-xs text-slate-500"
                                  title={new Date(app.applied_at).toLocaleString('vi-VN')}
                                >
                                  <Icon name="clock" className="w-3.5 h-3.5 text-slate-400" />
                                  Nộp {timeAgo(app.applied_at)}
                                </span>
                              )}
                            </div>

                            {/* Dòng 3: Liên hệ & Liên kết ngoài */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                              {user?.email && (
                                <a
                                  href={`mailto:${user.email}`}
                                  className="inline-flex items-center gap-1 hover:text-primary-700 hover:underline"
                                >
                                  <Icon name="mail" className="w-3.5 h-3.5 text-slate-400" />
                                  {user.email}
                                </a>
                              )}
                              {profile?.phone && (
                                <a
                                  href={`tel:${profile.phone}`}
                                  className="inline-flex items-center gap-1 hover:text-primary-700"
                                >
                                  <Icon name="phone" className="w-3.5 h-3.5 text-slate-400" />
                                  {profile.phone}
                                </a>
                              )}
                              {profile?.address && (
                                <span className="inline-flex items-center gap-1">
                                  <Icon name="mapPin" className="w-3.5 h-3.5 text-slate-400" />
                                  {profile.address}
                                </span>
                              )}
                              {profile?.github_url && (
                                <a
                                  href={profile.github_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-slate-600 hover:text-primary-700 hover:underline"
                                >
                                  <Icon name="code" className="w-3.5 h-3.5 text-slate-400" />
                                  GitHub ↗
                                </a>
                              )}
                              {profile?.portfolio_url && (
                                <a
                                  href={profile.portfolio_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-slate-600 hover:text-primary-700 hover:underline"
                                >
                                  <Icon name="globe" className="w-3.5 h-3.5 text-slate-400" />
                                  Portfolio ↗
                                </a>
                              )}
                            </div>

                            {/* Dòng 4: Kỹ năng */}
                            {skills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {skills.slice(0, 8).map((s) => (
                                  <SkillTag key={s.id} name={s.name} />
                                ))}
                                {skills.length > 8 && (
                                  <span className="px-1.5 py-0.5 text-slate-400 text-xs self-center">
                                    +{skills.length - 8}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Thư ứng tuyển */}
                            {app.cover_letter && (
                              <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5">
                                <p className="font-semibold text-slate-500 mb-0.5">Thư ứng tuyển:</p>
                                <p className={`whitespace-pre-line italic leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                                  “{app.cover_letter}”
                                </p>
                                {longLetter && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedLetters((prev) => ({ ...prev, [app.id]: !isExpanded }))
                                    }
                                    className="text-xs text-primary-700 font-semibold hover:underline mt-1"
                                  >
                                    {isExpanded ? 'Thu gọn' : 'Xem đầy đủ'}
                                  </button>
                                )}
                              </div>
                            )}

                            {/* Khung thông tin lịch phỏng vấn */}
                            {app.interview_time && (() => {
                              const stTime = new Date(app.interview_time);
                              const dur = app.interview_duration || 30;
                              const etTime = new Date(stTime.getTime() + dur * 60000);
                              const resp = app.interview_response || 'PENDING';
                              return (
                                <div
                                  className={`text-xs rounded-xl px-3.5 py-2.5 border ${
                                    resp === 'RESCHEDULE_REQUESTED'
                                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                                      : resp === 'CONFIRMED'
                                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                      : 'bg-sky-50/80 border-sky-200 text-sky-900'
                                  }`}
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <span className="inline-flex flex-wrap items-center gap-1.5 font-medium">
                                      <Icon name="calendar" className="w-3.5 h-3.5" />
                                      Phỏng vấn:{' '}
                                      <strong>
                                        {stTime.toLocaleDateString('vi-VN', {
                                          day: '2-digit',
                                          month: '2-digit',
                                          year: 'numeric',
                                        })}{' '}
                                        ·{' '}
                                        {stTime.toLocaleTimeString('vi-VN', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}{' '}
                                        –{' '}
                                        {etTime.toLocaleTimeString('vi-VN', {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })}
                                      </strong>
                                      <span>({dur} phút)</span>
                                      {app.interviewer_name && (
                                        <span className="px-2 py-0.5 rounded bg-white/80 border border-black/10 text-[11px]">
                                          Người PV: <strong>{app.interviewer_name}</strong>
                                        </span>
                                      )}
                                      {app.meet_url && (
                                        <a
                                          href={app.meet_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="underline font-bold hover:opacity-80"
                                        >
                                          · Vào phòng Meet ↗
                                        </a>
                                      )}
                                    </span>

                                    {resp === 'CONFIRMED' && (
                                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-600 text-white">
                                        ✓ Ứng viên đã xác nhận
                                      </span>
                                    )}
                                    {resp === 'RESCHEDULE_REQUESTED' && (
                                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-600 text-white">
                                        ⚠ Ứng viên xin dời lịch
                                      </span>
                                    )}
                                    {resp === 'PENDING' && (
                                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/90 text-slate-600 border border-slate-200">
                                        ⏳ Chờ UV xác nhận
                                      </span>
                                    )}
                                  </div>

                                  {resp === 'RESCHEDULE_REQUESTED' && app.candidate_reschedule_note && (
                                    <div className="mt-2 pt-2 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-2">
                                      <span className="italic">
                                        Đề xuất của ứng viên: “{app.candidate_reschedule_note}”
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setInterviewApp(app)}
                                        className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] flex-shrink-0"
                                      >
                                        Đặt lại giờ ngay
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>

                        {/* Cột nút hành động bên phải */}
                        <div className="flex flex-row flex-wrap xl:flex-col items-center xl:items-end justify-between gap-2.5 xl:w-52 xl:flex-shrink-0 pt-3 xl:pt-0 border-t xl:border-t-0 border-slate-100">
                          <div className="flex flex-wrap xl:flex-col items-center xl:items-stretch gap-2 w-full">
                            {profile?.id && (
                              <Link
                                to={`/admin/candidates/${profile.id}`}
                                className="btn-primary text-xs !py-2 !px-3 inline-flex items-center justify-center gap-1.5"
                              >
                                <Icon name="user" className="w-3.5 h-3.5" />
                                Hồ sơ năng lực đầy đủ
                              </Link>
                            )}

                            {cvUrl ? (
                              <a
                                href={cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-secondary text-xs !py-2 !px-3 inline-flex items-center justify-center gap-1.5"
                              >
                                <Icon name="document" className="w-3.5 h-3.5" />
                                Xem CV đính kèm ↗
                              </a>
                            ) : (
                              <span className="text-center text-xs text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                                Chưa đính kèm CV
                              </span>
                            )}

                            {app.status !== 'ACCEPTED' && app.status !== 'REJECTED' && (
                              <button
                                type="button"
                                onClick={() => setInterviewApp(app)}
                                className="px-3 py-2 rounded-lg text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-colors inline-flex items-center justify-center gap-1.5"
                              >
                                <Icon name="calendar" className="w-3.5 h-3.5" />
                                {app.interview_time ? 'Đổi lịch phỏng vấn' : 'Đặt lịch phỏng vấn'}
                              </button>
                            )}
                          </div>

                          <div className="w-full">
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1 xl:text-right">
                              Trạng thái duyệt hồ sơ
                            </label>
                            <select
                              value={app.status}
                              onChange={(e) => handleChangeAppStatus(app, e.target.value)}
                              disabled={reviewAppMutation.isPending || app.status === 'ACCEPTED'}
                              title={
                                app.status === 'ACCEPTED'
                                  ? 'Hồ sơ đã trúng tuyển — muốn cho ứng viên rời dự án, hãy xóa khỏi Workspace'
                                  : undefined
                              }
                              className="input-field text-xs !py-2 font-semibold cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-50"
                            >
                              <option value="PENDING" disabled>
                                Chờ duyệt
                              </option>
                              <option value="REVIEWING">Đang xét duyệt</option>
                              <option value="INTERVIEW">Mời phỏng vấn</option>
                              <option value="ACCEPTED">Duyệt vào Workspace</option>
                              <option value="REJECTED">Từ chối</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Thêm / Sửa vị trí tuyển dụng */}
      {jobModal && (
        <ProjectJobFormModal
          project={project}
          job={jobModal.job}
          onClose={() => setJobModal(null)}
        />
      )}

      {/* Modal Đặt lịch phỏng vấn */}
      {interviewApp && (
        <ScheduleInterviewModal
          app={interviewApp}
          onClose={() => setInterviewApp(null)}
          onManageInterviewers={() => setShowManageInterviewers(true)}
          onSuccess={() => {
            setInterviewApp(null);
            qc.invalidateQueries({ queryKey: ['admin-project-jobs', projectId] });
            qc.invalidateQueries({ queryKey: ['admin-projects'] });
          }}
        />
      )}

      {/* Modal Quản lý danh sách Người phỏng vấn */}
      {showManageInterviewers && (
        <ManageInterviewersModal onClose={() => setShowManageInterviewers(false)} />
      )}
    </div>
  );
}
