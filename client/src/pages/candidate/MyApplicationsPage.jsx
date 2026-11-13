import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { candidateApi } from '@/api/candidateApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import Icon, { IconBadge } from '@/components/common/Icon';
import { useConfirm } from '@/components/common/ConfirmDialog';
import PageBanner from '@/components/common/PageBanner';
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  INTERVIEW_SLOT_GROUPS,
  toLocalDateInput,
  toLocalTimeInput,
  addMinutesToTimeStr,
} from '@/utils/applicationStatus';

const STATUS_LABELS = APPLICATION_STATUS_LABELS;
const STATUS_COLORS = APPLICATION_STATUS_COLORS;

// Viền trái của thẻ theo trạng thái hồ sơ
const STATUS_BORDER = {
  PENDING: 'border-l-amber-400',
  VIEWED: 'border-l-primary-400',
  INTERVIEW: 'border-l-sky-500',
  HIRED: 'border-l-emerald-500',
  ACCEPTED: 'border-l-emerald-500',
  REJECTED: 'border-l-red-400',
  REVIEWING: 'border-l-primary-400',
};

const formatSalary = (amount) => {
  if (!amount) return 'Thỏa thuận';
  return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
};

export default function MyApplicationsPage() {
  const confirm = useConfirm();
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [rescheduleAppId, setRescheduleAppId] = useState(null);
  const [rescheduleMode, setRescheduleMode] = useState('PICK_SLOT'); // 'PICK_SLOT' | 'CUSTOM_NOTE'
  const [pickDate, setPickDate] = useState(() => toLocalDateInput(new Date(Date.now() + 86400000)));
  const [pickTime, setPickTime] = useState('');
  const [rescheduleNote, setRescheduleNote] = useState('');
  const qc = useQueryClient();

  const { data: projectAppsRes, isLoading: loadingProjects } = useQuery({
    queryKey: ['my-project-applications'],
    queryFn: () => candidateApi.getMyProjectApplications(),
  });

  const { data: companyAppsRes, isLoading: loadingCompany } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => candidateApi.getMyApplications(),
  });

  // Workspace đang tham gia → link "Vào Workspace" cho hồ sơ đã trúng tuyển
  const { data: workspacesRes } = useQuery({
    queryKey: ['my-workspaces'],
    queryFn: () => candidateApi.getMyWorkspaces(),
    staleTime: 0,
  });

  const { data: detailRes, isLoading: loadingDetail } = useQuery({
    queryKey: ['application-detail', selectedAppId],
    queryFn: () => candidateApi.getApplicationDetail(selectedAppId),
    enabled: !!selectedAppId,
  });

  // Rút đơn ứng tuyển (chỉ áp dụng cho Company Job - status PENDING)
  const withdrawMutation = useMutation({
    mutationFn: (id) => candidateApi.withdrawApplication(id),
    onSuccess: () => {
      toast.success('Đã rút đơn ứng tuyển thành công');
      qc.invalidateQueries({ queryKey: ['my-applications'] });
      setSelectedAppId(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể rút đơn'),
  });

  const respondInterviewMutation = useMutation({
    mutationFn: ({ id, data }) => candidateApi.respondProjectInterview(id, data),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Đã gửi phản hồi lịch phỏng vấn');
      qc.invalidateQueries({ queryKey: ['my-project-applications'] });
      qc.invalidateQueries({ queryKey: ['candidate-interview-slots'] });
      setRescheduleAppId(null);
      setPickTime('');
      setRescheduleNote('');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể gửi phản hồi'),
  });

  // Lấy các khung giờ đã bận của người phỏng vấn khi ứng viên mở bảng tự chọn giờ
  const { data: slotsRes, isLoading: loadingSlots } = useQuery({
    queryKey: ['candidate-interview-slots', rescheduleAppId],
    queryFn: () => candidateApi.getProjectInterviewSlots(rescheduleAppId),
    enabled: !!rescheduleAppId,
  });

  const handleWithdraw = async (e, appId) => {
    e.stopPropagation();
    if (await confirm({ title: 'Rút đơn ứng tuyển', message: 'Bạn có chắc muốn rút đơn ứng tuyển này không?', confirmText: 'Rút đơn', tone: 'danger' })) {
      withdrawMutation.mutate(appId);
    }
  };

  const projectApps = projectAppsRes?.data?.data || [];
  const companyApps = companyAppsRes?.data?.data || [];
  const appDetail = detailRes?.data?.data;
  // project_id → workspace_id (chỉ Workspace còn tham gia)
  const workspaceByProject = Object.fromEntries(
    (workspacesRes?.data?.data || [])
      .filter(m => m.status === 'ACTIVE' && m.Workspace?.Project?.id)
      .map(m => [m.Workspace.Project.id, m.Workspace.id])
  );

  const isLoading = loadingProjects || loadingCompany;
  if (isLoading) return <LoadingSpinner />;

  // Tính stats cho tab hiện tại
  const currentApps = activeTab === 'projects' ? projectApps : companyApps;
  const statuses = ['PENDING', 'REVIEWING', 'VIEWED', 'INTERVIEW', 'HIRED', 'ACCEPTED', 'REJECTED'];
  const stats = statuses.reduce((acc, s) => {
    acc[s] = currentApps.filter((a) => a.status === s).length;
    return acc;
  }, {});

  // Filter theo status ('' = tất cả)
  const filteredApps = statusFilter
    ? currentApps.filter((a) => a.status === statusFilter)
    : currentApps;

  return (
    <div className="space-y-6">
      <PageBanner compact icon="clipboard" title="Hồ sơ ứng tuyển" subtitle="Theo dõi trạng thái các đơn bạn đã nộp cho dự án thời vụ và việc làm doanh nghiệp" />

      {/* Tab + Stats Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab('projects'); setStatusFilter(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'projects' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dự án thời vụ ({projectApps.length})
            </button>
            <button
              onClick={() => { setActiveTab('companies'); setStatusFilter(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'companies' ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Việc làm doanh nghiệp ({companyApps.length})
            </button>
          </div>

          {/* Filter theo status */}
          <select
            className="input-field text-sm w-full sm:w-52"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">-- Tất cả trạng thái --</option>
            {statuses.filter((s) => stats[s] > 0).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s] || s} ({stats[s]})
              </option>
            ))}
          </select>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats).filter(([, count]) => count > 0).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${
                statusFilter === status
                  ? `${STATUS_COLORS[status]} border-current shadow-sm ring-2 ring-offset-1 ring-current/30`
                  : `${STATUS_COLORS[status]} border-transparent opacity-80 hover:opacity-100`
              }`}
            >
              {STATUS_LABELS[status] || status}: {count}
            </button>
          ))}
          {currentApps.length === 0 && (
            <span className="text-xs text-gray-400">Chưa có đơn ứng tuyển nào</span>
          )}
        </div>
      </div>

      {/* Tab 1: Project Applications */}
      {activeTab === 'projects' && (
        <div>
          {projectApps.length === 0 ? (
            <div className="card text-center py-12">
              <IconBadge name="folder" size="lg" className="mx-auto mb-2" />
              <p className="text-gray-500 font-medium">Bạn chưa ứng tuyển vị trí dự án nào</p>
              <p className="text-xs text-gray-400 mt-1">Khám phá các dự án nội bộ đang tìm kiếm nhân sự thời vụ</p>
              <Link to="/projects" className="btn-primary mt-4 inline-block">Khám phá dự án ngay</Link>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="card text-center py-8 text-gray-400">
              <p>Không có đơn nào ở trạng thái này</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApps.map((app) => (
                <div key={app.id} className={`card border-l-4 ${STATUS_BORDER[app.status] || 'border-l-gray-300'} hover:shadow-lift hover:-translate-y-0.5 transition-all`}>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-gray-900">{app.ProjectJob?.title}</h3>
                        <span className="badge bg-primary-100 text-primary-700 text-xs">Dự án thời vụ</span>
                      </div>
                      <p className="text-sm font-medium text-primary-700 mb-2"><Icon name="folder" className="w-4 h-4 mr-1" />Dự án: {app.ProjectJob?.Project?.name}</p>
                      {app.cover_letter && (
                        <p className="text-xs text-gray-500 italic line-clamp-2 mb-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          "{app.cover_letter}"
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="font-semibold text-green-700 text-sm"><Icon name="cash" className="w-4 h-4 mr-1" />Thù lao: {formatSalary(app.ProjectJob?.budget)}</span>
                        <span><Icon name="calendar" className="w-4 h-4 mr-1" />Ngày nộp: {new Date(app.applied_at).toLocaleDateString('vi-VN')}</span>
                        {app.cv_url && (
                          <a href={app.cv_url} target="_blank" rel="noopener noreferrer"
                            className="font-medium text-primary-700 hover:underline flex items-center gap-1">
                            <Icon name="document" className="w-3.5 h-3.5" />Xem CV đã nộp
                          </a>
                        )}
                      </div>

                      {/* Thông tin phỏng vấn (một khối duy nhất): có lịch thì hiện chi tiết, chưa có thì báo chờ liên hệ */}
                      {app.status === 'INTERVIEW' && (
                        <div className="mt-4 bg-primary-50 p-3.5 rounded-xl border border-primary-100">
                          <p className="text-sm font-bold text-primary-800 mb-1.5 flex items-center gap-1.5">
                            <Icon name="calendar" className="w-4 h-4" /> Thông tin lịch phỏng vấn
                          </p>
                          <div className="space-y-1">
                            {app.interview_time && (
                              <p className="text-sm text-primary-700">
                                <span className="font-semibold">Thời gian:</span>{' '}
                                {new Date(app.interview_time).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                {' · '}
                                <strong>
                                  {new Date(app.interview_time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                  {' – '}
                                  {new Date(new Date(app.interview_time).getTime() + (app.interview_duration || 30) * 60000).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                </strong>
                                {' '}({app.interview_duration || 30} phút)
                                {app.interviewer_name && (
                                  <span className="block mt-1">
                                    <span className="font-semibold">Người phỏng vấn:</span> <strong>{app.interviewer_name}</strong>
                                  </span>
                                )}
                              </p>
                            )}
                            {!app.interview_time && !app.meet_url && !app.interview_note && (
                              <p className="text-sm text-primary-700">Nhà tuyển dụng sẽ liên hệ sớm với bạn.</p>
                            )}
                            {app.meet_url && (
                              <p className="text-sm text-primary-700 flex items-center gap-1 flex-wrap">
                                <span className="font-semibold">Phòng họp:</span>
                                <a href={app.meet_url} target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-primary-900 break-all font-medium">
                                  {app.meet_url} ↗
                                </a>
                              </p>
                            )}
                            {app.interview_note && (
                              <p className="text-sm text-primary-700 mt-2 bg-white/60 p-2 rounded-lg border border-primary-100/50">
                                <span className="font-semibold">Ghi chú:</span> <span className="italic">{app.interview_note}</span>
                              </p>
                            )}

                            {/* Phản hồi & Chủ động chọn lịch phỏng vấn trên lịch trống của Người phỏng vấn */}
                            {(() => {
                              const slotData = rescheduleAppId === app.id ? slotsRes?.data?.data : null;
                              const busySlots = slotData?.busy_slots || [];
                              const durationMin = slotData?.interview_duration || app.interview_duration || 30;
                              const interviewerName =
                                slotData?.interviewer_name || app.interviewer_name || 'Ban quản lý dự án';

                              const checkCandidateSlot = (timeStr) => {
                                if (!pickDate || !timeStr) return { status: 'FREE' };
                                const startMs = new Date(`${pickDate}T${timeStr}:00`).getTime();
                                if (isNaN(startMs)) return { status: 'FREE' };
                                const endMs = startMs + durationMin * 60000;

                                if (startMs < Date.now() - 60000) {
                                  return { status: 'PAST', reason: 'Đã qua giờ này' };
                                }

                                for (const b of busySlots) {
                                  const bStart = new Date(b.start_time).getTime();
                                  const bEnd = bStart + (b.duration || 30) * 60000;
                                  if (startMs < bEnd && endMs > bStart) {
                                    const bStartStr = toLocalTimeInput(bStart);
                                    const bEndStr = toLocalTimeInput(bEnd);
                                    if (b.busy_type === 'CANDIDATE') {
                                      return {
                                        status: 'BUSY_CANDIDATE',
                                        reason: `Trùng lịch phỏng vấn khác của bạn (${bStartStr}–${bEndStr})`,
                                      };
                                    }
                                    return {
                                      status: 'BUSY_INTERVIEWER',
                                      reason: `Người phỏng vấn đã có lịch bận (${bStartStr}–${bEndStr})`,
                                    };
                                  }
                                }
                                return { status: 'FREE' };
                              };

                              const openSlotPicker = (defaultMode = 'PICK_SLOT') => {
                                if (rescheduleAppId === app.id && rescheduleMode === defaultMode) {
                                  setRescheduleAppId(null);
                                  return;
                                }
                                setRescheduleAppId(app.id);
                                setRescheduleMode(defaultMode);
                                setPickDate(
                                  app.interview_time && new Date(app.interview_time) > new Date()
                                    ? toLocalDateInput(app.interview_time)
                                    : toLocalDateInput(new Date(Date.now() + 86400000))
                                );
                                setPickTime(app.interview_time ? toLocalTimeInput(app.interview_time) : '');
                                setRescheduleNote(app.candidate_reschedule_note || '');
                              };

                              const next7Days = Array.from({ length: 7 }, (_, idx) => {
                                const d = new Date(Date.now() + idx * 86400000);
                                return {
                                  dateStr: toLocalDateInput(d),
                                  label:
                                    idx === 0
                                      ? 'Hôm nay'
                                      : idx === 1
                                      ? 'Ngày mai'
                                      : d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
                                };
                              });

                              return (
                                <div className="pt-2.5 mt-2.5 border-t border-primary-200/70 space-y-2.5">
                                  {!app.interview_time && (
                                    <div className="bg-white/90 border border-primary-200 rounded-xl p-3 text-xs text-primary-900 flex flex-wrap items-center justify-between gap-2">
                                      <div>
                                        <p className="font-bold text-primary-800">
                                          ✨ Bạn được quyền chủ động chọn ngày & khung giờ phỏng vấn!
                                        </p>
                                        <p className="text-slate-600 mt-0.5">
                                          Người phỏng vấn: <strong>{interviewerName}</strong> · Thời lượng:{' '}
                                          <strong>{durationMin} phút</strong>
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => openSlotPicker('PICK_SLOT')}
                                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-sm transition-colors"
                                      >
                                        📅 Chọn ngày & khung giờ ngay
                                      </button>
                                    </div>
                                  )}

                                  {app.interview_time && (
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-primary-800">Trạng thái xác nhận:</span>
                                        {app.interview_response === 'CONFIRMED' ? (
                                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                                            ✓ Bạn đã xác nhận tham gia
                                          </span>
                                        ) : app.interview_response === 'RESCHEDULE_REQUESTED' ? (
                                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-600 text-white">
                                            ⏳ Đã gửi yêu cầu đổi giờ phỏng vấn
                                          </span>
                                        ) : (
                                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white text-primary-700 border border-primary-200">
                                            Chờ bạn xác nhận hoặc chọn lại giờ
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex flex-wrap items-center gap-2">
                                        {app.interview_response !== 'CONFIRMED' && (
                                          <button
                                            type="button"
                                            disabled={respondInterviewMutation.isPending}
                                            onClick={() =>
                                              respondInterviewMutation.mutate({
                                                id: app.id,
                                                data: { response: 'CONFIRMED' },
                                              })
                                            }
                                            className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors disabled:opacity-50"
                                          >
                                            ✓ Xác nhận giờ này
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => openSlotPicker('PICK_SLOT')}
                                          className="px-3 py-1 rounded-lg text-xs font-bold bg-white hover:bg-primary-50 text-primary-700 border border-primary-300 transition-colors"
                                        >
                                          📅 {rescheduleAppId === app.id ? 'Đóng bảng chọn giờ' : 'Tự chọn khung giờ trống khác'}
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {app.interview_response === 'RESCHEDULE_REQUESTED' && app.candidate_reschedule_note && rescheduleAppId !== app.id && (
                                    <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 italic">
                                      Đề xuất bạn đã gửi: “{app.candidate_reschedule_note}”
                                    </p>
                                  )}

                                  {/* Bảng chọn Ngày & Khung giờ trống thực tế của Người phỏng vấn */}
                                  {rescheduleAppId === app.id && (
                                    <div className="bg-white p-4 rounded-xl border border-primary-300 shadow-sm space-y-3.5 animate-fade-in">
                                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                                        <div>
                                          <p className="text-xs font-bold text-slate-900">
                                            📅 Chọn khung giờ phỏng vấn với {interviewerName} ({durationMin} phút/ca)
                                          </p>
                                          <p className="text-[11px] text-slate-500">
                                            Các khung giờ màu trắng là lịch trống. Khi bạn bấm chốt, hệ thống sẽ tự động xác nhận ngay lập tức!
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[11px]">
                                          <button
                                            type="button"
                                            onClick={() => setRescheduleMode('PICK_SLOT')}
                                            className={`px-2.5 py-1 rounded-lg font-semibold border ${
                                              rescheduleMode === 'PICK_SLOT'
                                                ? 'bg-primary-600 text-white border-primary-600'
                                                : 'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}
                                          >
                                            Chọn trên lịch trống
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setRescheduleMode('CUSTOM_NOTE')}
                                            className={`px-2.5 py-1 rounded-lg font-semibold border ${
                                              rescheduleMode === 'CUSTOM_NOTE'
                                                ? 'bg-amber-600 text-white border-amber-600'
                                                : 'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}
                                          >
                                            Nhắn đề xuất giờ riêng
                                          </button>
                                        </div>
                                      </div>

                                      {rescheduleMode === 'PICK_SLOT' ? (
                                        <div className="space-y-3">
                                          {/* Chọn nhanh 7 ngày tới + ô chọn ngày bất kỳ */}
                                          <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap gap-1.5">
                                              {next7Days.map((d) => (
                                                <button
                                                  key={d.dateStr}
                                                  type="button"
                                                  onClick={() => {
                                                    setPickDate(d.dateStr);
                                                    setPickTime('');
                                                  }}
                                                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                                                    pickDate === d.dateStr
                                                      ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                                                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-primary-300'
                                                  }`}
                                                >
                                                  {d.label}
                                                </button>
                                              ))}
                                            </div>
                                            <input
                                              type="date"
                                              min={toLocalDateInput(new Date())}
                                              value={pickDate}
                                              onChange={(e) => {
                                                setPickDate(e.target.value);
                                                setPickTime('');
                                              }}
                                              className="input-field !w-auto text-xs !py-1.5 !px-2.5"
                                            />
                                          </div>

                                          {loadingSlots ? (
                                            <p className="text-xs text-slate-400 py-3 text-center">
                                              Đang tải lịch trống của người phỏng vấn...
                                            </p>
                                          ) : (
                                            <div className="space-y-2.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                              {INTERVIEW_SLOT_GROUPS.map((group) => (
                                                <div key={group.label} className="space-y-1">
                                                  <p className="text-[11px] font-bold text-slate-500">{group.label}</p>
                                                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-1.5">
                                                    {group.slots.map((slot) => {
                                                      const check = checkCandidateSlot(slot);
                                                      const isBlocked = check.status !== 'FREE';
                                                      const isSelected = pickTime === slot;
                                                      const endStr = addMinutesToTimeStr(slot, durationMin);
                                                      return (
                                                        <button
                                                          key={slot}
                                                          type="button"
                                                          disabled={isBlocked}
                                                          title={check.reason || `Khung giờ trống: ${slot} – ${endStr}`}
                                                          onClick={() => setPickTime(slot)}
                                                          className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                                                            isSelected
                                                              ? 'bg-primary-600 text-white border-primary-700 font-bold ring-2 ring-primary-300 shadow-sm'
                                                              : isBlocked
                                                              ? check.status === 'PAST'
                                                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                                                : 'bg-red-50 text-red-600 border-red-200 cursor-not-allowed'
                                                              : 'bg-white text-slate-700 border-emerald-200 hover:border-primary-400 hover:bg-primary-50/40'
                                                          }`}
                                                        >
                                                          <div>{slot}</div>
                                                          <div className={`text-[10px] truncate ${isSelected ? 'text-white/90' : 'opacity-75'}`}>
                                                            {check.status === 'BUSY_INTERVIEWER'
                                                              ? 'Đã kín'
                                                              : check.status === 'BUSY_CANDIDATE'
                                                              ? 'Trùng lịch'
                                                              : check.status === 'PAST'
                                                              ? 'Đã qua'
                                                              : `→ ${endStr}`}
                                                          </div>
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}

                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                                            <input
                                              type="text"
                                              className="input-field text-xs flex-1 !py-1.5"
                                              placeholder="Ghi chú ngắn cho người phỏng vấn (tùy chọn)..."
                                              value={rescheduleNote}
                                              onChange={(e) => setRescheduleNote(e.target.value)}
                                            />
                                            <div className="flex items-center justify-end gap-2">
                                              <button
                                                type="button"
                                                onClick={() => setRescheduleAppId(null)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700"
                                              >
                                                Đóng
                                              </button>
                                              <button
                                                type="button"
                                                disabled={respondInterviewMutation.isPending || !pickDate || !pickTime}
                                                onClick={() =>
                                                  respondInterviewMutation.mutate({
                                                    id: app.id,
                                                    data: {
                                                      response: 'SELF_SCHEDULED',
                                                      interview_time: new Date(`${pickDate}T${pickTime}:00`).toISOString(),
                                                      note: rescheduleNote || undefined,
                                                    },
                                                  })
                                                }
                                                className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-sm disabled:opacity-50"
                                              >
                                                {respondInterviewMutation.isPending
                                                  ? 'Đang chốt lịch...'
                                                  : pickTime
                                                  ? `✓ Chốt lịch ${pickTime} (${new Date(`${pickDate}T00:00:00`).toLocaleDateString('vi-VN')})`
                                                  : 'Chọn 1 khung giờ trống để chốt'}
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          <label className="block text-xs font-bold text-gray-700">
                                            Lý do bận & khung giờ khác bạn muốn đề xuất: *
                                          </label>
                                          <textarea
                                            rows={2}
                                            className="input-field text-xs resize-none"
                                            placeholder="VD: Em bận các khung giờ trên, xin phép đề xuất 11h30 trưa thứ 6 hoặc sáng thứ 7 ạ..."
                                            value={rescheduleNote}
                                            onChange={(e) => setRescheduleNote(e.target.value)}
                                          />
                                          <div className="flex justify-end gap-2">
                                            <button
                                              type="button"
                                              onClick={() => setRescheduleAppId(null)}
                                              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
                                            >
                                              Hủy
                                            </button>
                                            <button
                                              type="button"
                                              disabled={respondInterviewMutation.isPending || !rescheduleNote.trim()}
                                              onClick={() =>
                                                respondInterviewMutation.mutate({
                                                  id: app.id,
                                                  data: { response: 'RESCHEDULE_REQUESTED', note: rescheduleNote },
                                                })
                                              }
                                              className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
                                            >
                                              {respondInterviewMutation.isPending ? 'Đang gửi...' : 'Gửi đề xuất đổi giờ'}
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                            {false && (
                              <p>
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2 min-w-fit">
                      <span className={`badge text-xs px-3 py-1 font-semibold ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[app.status] || app.status}
                      </span>
                      {app.status === 'ACCEPTED' && workspacesRes && (
                        workspaceByProject[app.ProjectJob?.Project?.id] ? (
                          <Link to={`/candidate/workspaces/${workspaceByProject[app.ProjectJob.Project.id]}`}
                            className="btn-primary text-xs px-3 py-1.5 mt-1">
                            Vào Workspace →
                          </Link>
                        ) : (
                          <p className="text-xs text-gray-400 mt-1">Bạn không còn trong Workspace của dự án này</p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Company Job Applications */}
      {activeTab === 'companies' && (
        <div>
          {companyApps.length === 0 ? (
            <div className="card text-center py-12">
              <IconBadge name="briefcase" size="lg" className="mx-auto mb-2" />
              <p className="text-gray-500 font-medium">Chưa có hồ sơ ứng tuyển công ty nào</p>
              <p className="text-xs text-gray-400 mt-1">Tìm việc làm toàn thời gian hoặc bán thời gian tại các doanh nghiệp</p>
              <Link to="/jobs" className="btn-primary mt-4 inline-block">Tìm việc công ty ngay</Link>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="card text-center py-8 text-gray-400">
              <p>Không có đơn nào ở trạng thái này</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className={`card border-l-4 ${STATUS_BORDER[app.status] || 'border-l-gray-300'} hover:shadow-lift hover:-translate-y-0.5 transition-all cursor-pointer`}
                  onClick={() => setSelectedAppId(selectedAppId === app.id ? null : app.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        to={`/jobs/${app.job_post_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-lg text-gray-900 hover:text-primary-700"
                      >
                        {app.JobPost?.title}
                      </Link>
                      {app.JobPost?.Company && (
                        <p className="text-sm text-gray-500 mt-0.5">{app.JobPost.Company.name}</p>
                      )}
                      {app.cover_letter && (
                        <p className="text-xs text-gray-500 italic line-clamp-2 mt-2 mb-1 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          "{app.cover_letter}"
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-gray-400"><Icon name="calendar" className="w-3.5 h-3.5 mr-1" />Ngày nộp: {new Date(app.applied_at).toLocaleDateString('vi-VN')}</p>
                        {app.cv_url && (
                          <a href={app.cv_url} target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-medium text-primary-700 hover:underline flex items-center gap-1">
                            <Icon name="document" className="w-3.5 h-3.5" />Xem CV đã nộp
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`badge text-xs px-3 py-1 font-semibold ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[app.status] || app.status}
                      </span>
                      <p className="text-xs text-gray-400"><Icon name="history" className="w-3.5 h-3.5 mr-1" />Xem lịch sử</p>
                      {/* Nút rút đơn — chỉ hiện khi PENDING */}
                      {app.status === 'PENDING' && (
                        <button
                          onClick={(e) => handleWithdraw(e, app.id)}
                          disabled={withdrawMutation.isPending}
                          className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium mt-1 disabled:opacity-50"
                        >
                          {withdrawMutation.isPending ? 'Đang rút...' : 'Rút đơn'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline detail: ApplicationStatusHistory timeline */}
                  {selectedAppId === app.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {loadingDetail ? (
                        <p className="text-xs text-gray-400 text-center py-2">Đang tải lịch sử...</p>
                      ) : appDetail?.ApplicationStatusHistories?.length > 0 ? (
                        <div>
                          <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">Lịch sử trạng thái hồ sơ</p>
                          <div className="space-y-2">
                            {appDetail.ApplicationStatusHistories.map((h, idx) => (
                              <div key={h.id || idx} className="flex items-start gap-3 text-xs">
                                <div className="flex flex-col items-center">
                                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500 mt-0.5 flex-shrink-0" />
                                  {idx < appDetail.ApplicationStatusHistories.length - 1 && (
                                    <div className="w-px h-5 bg-gray-200 mt-1" />
                                  )}
                                </div>
                                <div className="flex-1 pb-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`badge text-xs px-2 py-0.5 font-semibold ${STATUS_COLORS[h.status] || 'bg-gray-100 text-gray-700'}`}>
                                      {STATUS_LABELS[h.status] || h.status}
                                    </span>
                                    <span className="text-gray-400">{new Date(h.changed_at).toLocaleString('vi-VN')}</span>
                                  </div>
                                  {h.note && <p className="text-gray-500 mt-0.5 italic">{h.note}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-2">Chưa có lịch sử cập nhật</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
