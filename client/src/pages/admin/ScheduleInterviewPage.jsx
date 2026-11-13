import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { workspaceApi } from '@/api/workspaceApi';
import { projectJobApi } from '@/api/projectJobApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Icon, { IconBadge } from '@/components/common/Icon';
import Avatar from '@/components/common/Avatar';
import PageBanner from '@/components/common/PageBanner';
import { SkillTag } from '@/components/common/Badges';
import {
  INTERVIEW_SLOT_GROUPS,
  DURATION_OPTIONS,
  toLocalDateInput,
  toLocalTimeInput,
  addMinutesToTimeStr,
} from '@/utils/applicationStatus';

export default function ScheduleInterviewPage() {
  const { projectId, appId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: projectRes, isLoading: projectLoading } = useQuery({
    queryKey: ['admin-project', projectId],
    queryFn: () => workspaceApi.getProjectById(projectId),
    enabled: !!projectId,
  });

  const { data: jobsRes, isLoading: jobsLoading } = useQuery({
    queryKey: ['admin-project-jobs', projectId],
    queryFn: () => projectJobApi.getAdminProjectJobs(projectId),
    enabled: !!projectId,
  });

  const { data: scheduleRes, isLoading: loadingSchedule } = useQuery({
    queryKey: ['admin-interviews'],
    queryFn: () => projectJobApi.getAdminInterviews(),
  });

  const project = projectRes?.data?.data;
  const projectJobs = useMemo(() => jobsRes?.data?.data || [], [jobsRes]);

  // Tìm hồ sơ ứng tuyển và vị trí tương ứng
  const { app, job } = useMemo(() => {
    for (const j of projectJobs) {
      const found = (j.ProjectApplications || []).find((a) => a.id === appId);
      if (found) return { app: found, job: j };
    }
    return { app: null, job: null };
  }, [projectJobs, appId]);

  const [initialized, setInitialized] = useState(false);
  const [allowSelfSchedule, setAllowSelfSchedule] = useState(false);
  const [form, setForm] = useState({
    interview_date: toLocalDateInput(new Date(Date.now() + 86400000)),
    interview_time: '',
    interview_duration: 30,
    interviewer_id: '',
    meet_url: '',
    interview_note: '',
  });
  const [sending, setSending] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [newInterviewer, setNewInterviewer] = useState({ name: '', title: '', default_meet_url: '' });
  const [creatingInterviewer, setCreatingInterviewer] = useState(false);

  useEffect(() => {
    if (app && !initialized) {
      const firstInterviewer = (scheduleRes?.data?.interviewers || []).find((i) => i.is_active !== false);
      setForm({
        interview_date: app.interview_time
          ? toLocalDateInput(app.interview_time)
          : toLocalDateInput(new Date(Date.now() + 86400000)),
        interview_time: app.interview_time ? toLocalTimeInput(app.interview_time) : '',
        interview_duration: app.interview_duration || 30,
        interviewer_id: app.interviewer_id || '',
        meet_url: app.meet_url || firstInterviewer?.default_meet_url || '',
        interview_note: app.interview_note || '',
      });
      if (app.status === 'INTERVIEW' && !app.interview_time) {
        setAllowSelfSchedule(true);
      }
      setInitialized(true);
    }
  }, [app, initialized, scheduleRes]);

  const allInterviews = scheduleRes?.data?.data || [];
  const interviewers = (scheduleRes?.data?.interviewers || []).filter((i) => i.is_active !== false);

  const selectedInterviewer =
    interviewers.find((i) => i.id === form.interviewer_id) ||
    interviewers.find((i) => app?.interviewer_name && i.name.toLowerCase() === app.interviewer_name.toLowerCase()) ||
    interviewers[0] ||
    null;

  const effectiveInterviewerId = selectedInterviewer?.id || '';
  const effectiveInterviewerName = selectedInterviewer?.name || 'Chưa chọn người phỏng vấn';

  const handleSelectInterviewer = (person) => {
    setForm((prev) => ({
      ...prev,
      interviewer_id: person.id,
      meet_url: prev.meet_url || person.default_meet_url || '',
    }));
  };

  const handleQuickCreateInterviewer = async () => {
    if (!newInterviewer.name.trim()) {
      toast.error('Vui lòng nhập tên người phỏng vấn');
      return;
    }
    setCreatingInterviewer(true);
    try {
      const res = await projectJobApi.createInterviewer(newInterviewer);
      const created = res.data?.data;
      await qc.invalidateQueries({ queryKey: ['admin-interviews'] });
      if (created) {
        setForm((prev) => ({
          ...prev,
          interviewer_id: created.id,
          meet_url: prev.meet_url || created.default_meet_url || '',
        }));
      }
      setNewInterviewer({ name: '', title: '', default_meet_url: '' });
      setShowQuickCreate(false);
      toast.success(`Đã tạo và chọn người phỏng vấn "${created?.name}"`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể tạo người phỏng vấn');
    } finally {
      setCreatingInterviewer(false);
    }
  };

  const sameDayInterviews = allInterviews.filter((item) => {
    if (!app || item.id === app.id || item.status !== 'INTERVIEW' || !item.interview_time) return false;
    return toLocalDateInput(item.interview_time) === form.interview_date;
  });

  const belongsToInterviewer = (interviewItem, person) => {
    if (!person) return false;
    if (interviewItem.interviewer_id && interviewItem.interviewer_id === person.id) return true;
    if (
      !interviewItem.interviewer_id &&
      interviewItem.interviewer_name &&
      interviewItem.interviewer_name.trim().toLowerCase() === person.name.trim().toLowerCase()
    ) {
      return true;
    }
    return false;
  };

  const checkSlotConflict = (timeStr) => {
    if (!app || !form.interview_date || !timeStr) return { status: 'FREE' };
    const startMs = new Date(`${form.interview_date}T${timeStr}:00`).getTime();
    if (isNaN(startMs)) return { status: 'FREE' };
    const endMs = startMs + (Number(form.interview_duration) || 30) * 60000;

    if (startMs < Date.now() - 60000) {
      return { status: 'PAST', reason: 'Đã qua giờ này' };
    }

    let otherRoomMatch = null;
    for (const other of sameDayInterviews) {
      const oStart = new Date(other.interview_time).getTime();
      const oDur = other.interview_duration || 30;
      const oEnd = oStart + oDur * 60000;
      if (startMs < oEnd && endMs > oStart) {
        const oStartStr = toLocalTimeInput(oStart);
        const oEndStr = toLocalTimeInput(oEnd);
        const oCand = other.CandidateProfile?.User?.full_name || 'Ứng viên';
        const oPos = other.ProjectJob?.title || 'Vị trí';
        const oInterviewer = other.Interviewer?.name || (other.interviewer_name || '').trim();

        if (other.candidate_profile_id === app.candidate_profile_id) {
          return {
            status: 'CONFLICT_CANDIDATE',
            reason: `Ứng viên này đã có lịch phỏng vấn vị trí "${oPos}" (${oStartStr}–${oEndStr})`,
            other,
          };
        }
        if (belongsToInterviewer(other, selectedInterviewer)) {
          return {
            status: 'CONFLICT_INTERVIEWER',
            reason: `Người phỏng vấn "${effectiveInterviewerName}" đã có lịch phỏng vấn ${oCand} (${oPos}, ${oStartStr}–${oEndStr})`,
            other,
          };
        }
        otherRoomMatch = {
          status: 'OTHER_INTERVIEWER',
          reason: `Khung giờ này có ca của "${oInterviewer || 'Người PV khác'}" với ${oCand} (${oStartStr}–${oEndStr})`,
          other,
        };
      }
    }
    return otherRoomMatch || { status: 'FREE' };
  };

  const selectedTimeCheck = form.interview_time ? checkSlotConflict(form.interview_time) : null;
  const hasHardConflict =
    selectedTimeCheck?.status === 'CONFLICT_CANDIDATE' ||
    selectedTimeCheck?.status === 'CONFLICT_INTERVIEWER';

  const backUrl = `/admin/projects/${projectId}/jobs${job?.id ? `?job=${job.id}` : ''}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!effectiveInterviewerId) {
      toast.error('Vui lòng tạo và chọn người phỏng vấn trước khi đặt lịch');
      return;
    }
    if (!form.meet_url) {
      toast.error('Vui lòng nhập link phòng họp trực tuyến');
      return;
    }
    if (!allowSelfSchedule) {
      if (!form.interview_date || !form.interview_time) {
        toast.error('Vui lòng chọn ngày và khung giờ phỏng vấn (hoặc bật chế độ Để ứng viên tự chọn giờ)');
        return;
      }
      if (hasHardConflict) {
        toast.error(selectedTimeCheck.reason);
        return;
      }
    }

    const interview_time = allowSelfSchedule
      ? null
      : new Date(`${form.interview_date}T${form.interview_time}:00`).toISOString();

    setSending(true);
    try {
      const res = await projectJobApi.scheduleInterview(app.id, {
        interview_time,
        allow_self_schedule: allowSelfSchedule,
        interview_duration: Number(form.interview_duration) || 30,
        interviewer_id: effectiveInterviewerId,
        meet_url: form.meet_url,
        interview_note: form.interview_note || undefined,
      });
      await qc.invalidateQueries({ queryKey: ['admin-interviews'] });
      await qc.invalidateQueries({ queryKey: ['admin-project-jobs', projectId] });
      await qc.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success(res.data?.message || 'Đã gửi lời mời phỏng vấn cho ứng viên!');
      navigate(backUrl);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi đặt lịch phỏng vấn');
    } finally {
      setSending(false);
    }
  };

  if (projectLoading || jobsLoading) return <LoadingSpinner fullScreen />;

  if (!project || !app || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="card text-center py-14 max-w-md w-full">
          <IconBadge name="alert" tone="amber" size="lg" className="mx-auto mb-3" />
          <p className="font-semibold text-slate-800">Không tìm thấy hồ sơ ứng tuyển hoặc dự án</p>
          <Link to={`/admin/projects/${projectId}/jobs`} className="btn-primary inline-block mt-4">
            ← Quay lại Vị trí & Ứng viên
          </Link>
        </div>
      </div>
    );
  }

  const profile = app.CandidateProfile;
  const user = profile?.User;
  const cvUrl = app.cv_url || profile?.cv_url;

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageBanner
          compact
          icon="calendar"
          title={app.interview_time ? 'Cập nhật / Đổi lịch phỏng vấn' : 'Đặt lịch phỏng vấn ứng viên'}
          subtitle={`Ứng viên: ${user?.full_name || 'Ứng viên'} · Vị trí: ${job.title} · Dự án: ${project.name}`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Link to={backUrl} className="btn-light inline-flex items-center gap-1.5">
              <Icon name="chevronLeft" className="w-4 h-4" />
              Quay lại Vị trí & Ứng viên
            </Link>
            <Link to="/admin/projects/interviewers" className="btn-glass inline-flex items-center gap-1.5">
              <Icon name="users" className="w-4 h-4" />
              Quản lý DS người phỏng vấn
            </Link>
          </div>
        </PageBanner>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_24rem] gap-6 items-start">
        {/* Cột chính: Thiết lập lịch phỏng vấn */}
        <div className="space-y-6 min-w-0">
          {app.interview_response === 'RESCHEDULE_REQUESTED' && app.candidate_reschedule_note && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-sm text-amber-900">
              <p className="font-bold flex items-center gap-1.5 text-amber-800 mb-1">
                <Icon name="clock" className="w-4 h-4" />
                Ứng viên xin đổi lịch phỏng vấn:
              </p>
              <p className="italic">“{app.candidate_reschedule_note}”</p>
            </div>
          )}

          {/* Bước 1: Chọn người phỏng vấn */}
          <section className="card !p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-900 text-base">
                  1. Chọn người phỏng vấn <span className="text-red-500">*</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Hệ thống tự động kiểm tra và khóa các khung giờ bị trùng của người phỏng vấn được chọn
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/projects/interviewers"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
                >
                  Trang quản lý DS
                </Link>
                <button
                  type="button"
                  onClick={() => setShowQuickCreate(!showQuickCreate)}
                  className="text-xs font-semibold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg border border-primary-200 transition-colors"
                >
                  {showQuickCreate ? 'Đóng form tạo' : '+ Thêm nhanh người PV'}
                </button>
              </div>
            </div>

            {showQuickCreate && (
              <div className="bg-primary-50/60 border border-primary-200 rounded-xl p-4 space-y-3 animate-fade-in">
                <p className="text-xs font-bold text-primary-800">Tạo nhanh người phỏng vấn mới:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    className="input-field text-sm bg-white"
                    placeholder="Tên đại diện người phỏng vấn * (VD: Trần Văn B)"
                    value={newInterviewer.name}
                    onChange={(e) => setNewInterviewer({ ...newInterviewer, name: e.target.value })}
                  />
                  <input
                    type="text"
                    className="input-field text-sm bg-white"
                    placeholder="Chức danh / Chuyên môn (VD: Tech Lead)"
                    value={newInterviewer.title}
                    onChange={(e) => setNewInterviewer({ ...newInterviewer, title: e.target.value })}
                  />
                  <input
                    type="url"
                    className="input-field text-sm bg-white sm:col-span-2"
                    placeholder="Link Google Meet mặc định của người này (tùy chọn)"
                    value={newInterviewer.default_meet_url}
                    onChange={(e) => setNewInterviewer({ ...newInterviewer, default_meet_url: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickCreate(false)}
                    className="px-3 py-1.5 rounded-lg text-xs bg-white border border-slate-200 text-slate-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={creatingInterviewer || !newInterviewer.name.trim()}
                    onClick={handleQuickCreateInterviewer}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
                  >
                    {creatingInterviewer ? 'Đang lưu...' : 'Lưu & Chọn người này'}
                  </button>
                </div>
              </div>
            )}

            {interviewers.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-amber-300 bg-amber-50 text-xs text-amber-800 text-center">
                Chưa có người phỏng vấn nào trong danh sách. Hãy bấm <strong>"+ Thêm nhanh người PV"</strong> ở trên để tạo!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {interviewers.map((person) => {
                  const isSelected = effectiveInterviewerId === person.id;
                  const dayCount = sameDayInterviews.filter((item) => belongsToInterviewer(item, person)).length;
                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => handleSelectInterviewer(person)}
                      className={`flex items-center justify-between gap-2 p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-primary-50 border-primary-600 ring-2 ring-primary-200 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                              isSelected ? 'bg-primary-600 text-white' : 'border border-slate-300 text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                          <span className={`text-sm font-bold truncate ${isSelected ? 'text-primary-900' : 'text-slate-800'}`}>
                            {person.name}
                          </span>
                        </div>
                        {person.title && (
                          <p className="text-xs text-slate-500 truncate pl-5 mt-0.5">{person.title}</p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                          dayCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {dayCount > 0 ? `${dayCount} ca` : 'Trống'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Bước 2 & 3: Thời lượng, Ngày & Bảng khung giờ */}
          <section className="card !p-6 space-y-5">
            <div className="pb-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-bold text-slate-900 text-base">
                  2. Thời lượng & Chế độ chọn giờ phỏng vấn <span className="text-red-500">*</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Bạn có thể để ứng viên tự chọn khung giờ trống của {effectiveInterviewerName} hoặc chọn sẵn 1 giờ gợi ý
                </p>
              </div>
            </div>

            {/* Lựa chọn chế độ: Ứng viên tự chọn trên lịch trống HOẶC Admin chọn sẵn giờ gợi ý */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAllowSelfSchedule(false)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  !allowSelfSchedule
                    ? 'bg-primary-50 border-primary-600 ring-2 ring-primary-200'
                    : 'bg-white border-slate-200 hover:border-primary-300'
                }`}
              >
                <p className="text-sm font-bold text-slate-900">
                  📅 Chọn sẵn khung giờ gợi ý
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Đặt trước 1 khung giờ; ứng viên có thể bấm Xác nhận hoặc tự đổi sang giờ trống khác của {effectiveInterviewerName}
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAllowSelfSchedule(true)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  allowSelfSchedule
                    ? 'bg-primary-50 border-primary-600 ring-2 ring-primary-200'
                    : 'bg-white border-slate-200 hover:border-primary-300'
                }`}
              >
                <p className="text-sm font-bold text-slate-900">
                  ✨ Để ứng viên chủ động tự chọn giờ ngay từ đầu
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chỉ gán Người phỏng vấn & thời lượng; ứng viên tự mở lịch trống của {effectiveInterviewerName} và chốt giờ
                </p>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className={allowSelfSchedule ? 'sm:col-span-12' : 'sm:col-span-5'}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Thời lượng ca phỏng vấn
                </label>
                <div className="grid grid-cols-5 gap-1.5 max-w-md">
                  {DURATION_OPTIONS.map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() => setForm({ ...form, interview_duration: min })}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                        Number(form.interview_duration) === min
                          ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {min}p
                    </button>
                  ))}
                </div>
              </div>

              {!allowSelfSchedule && (
                <>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Ngày phỏng vấn *
                    </label>
                    <input
                      type="date"
                      className="input-field text-sm"
                      min={toLocalDateInput(new Date())}
                      value={form.interview_date}
                      onChange={(e) => setForm({ ...form, interview_date: e.target.value })}
                      required={!allowSelfSchedule}
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Giờ bắt đầu – Kết thúc *
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="time"
                        className="input-field text-sm flex-1"
                        value={form.interview_time}
                        onChange={(e) => setForm({ ...form, interview_time: e.target.value })}
                        required={!allowSelfSchedule}
                      />
                      {form.interview_time && (
                        <span className="px-2.5 py-2 rounded-lg bg-primary-50 border border-primary-200 text-xs font-bold text-primary-700 whitespace-nowrap">
                          → {addMinutesToTimeStr(form.interview_time, Number(form.interview_duration) || 30)}
                        </span>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {allowSelfSchedule ? (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-1">
                <p className="font-bold text-sm text-emerald-800">
                  ✓ Ứng viên sẽ tự chọn ngày & khung giờ trên lịch trống của {effectiveInterviewerName}
                </p>
                <p>
                  Hệ thống tự động khóa các khung giờ mà <strong>{effectiveInterviewerName}</strong> đã có lịch phỏng vấn khác, chỉ cho phép ứng viên chọn khung giờ còn trống ({form.interview_duration} phút/ca) và tự động chốt lịch ngay khi ứng viên bấm chọn.
                </p>
              </div>
            ) : (
            /* Bảng chọn nhanh khung giờ */
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Icon name="clock" className="w-4 h-4 text-primary-600" />
                  Khung giờ của <strong>{effectiveInterviewerName}</strong> ngày{' '}
                  {form.interview_date ? new Date(`${form.interview_date}T00:00:00`).toLocaleDateString('vi-VN') : '—'}
                  {loadingSchedule && <span className="text-slate-400 font-normal">(đang kiểm tra...)</span>}
                </span>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <span className="w-3 h-3 rounded-sm bg-white border border-emerald-400 inline-block" />Trống
                  </span>
                  <span className="inline-flex items-center gap-1 text-amber-700">
                    <span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-400 inline-block" />Có ca người khác
                  </span>
                  <span className="inline-flex items-center gap-1 text-red-700">
                    <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300 inline-block" />Trùng người PV / Ứng viên
                  </span>
                </div>
              </div>

              {INTERVIEW_SLOT_GROUPS.map((group) => (
                <div key={group.label} className="space-y-1.5">
                  <p className="text-xs font-semibold text-slate-500">{group.label}</p>
                  <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                    {group.slots.map((slot) => {
                      const check = checkSlotConflict(slot);
                      const isSelected = form.interview_time === slot;
                      const isBlocked =
                        check.status === 'CONFLICT_CANDIDATE' ||
                        check.status === 'CONFLICT_INTERVIEWER' ||
                        check.status === 'PAST';
                      const isOtherRoom = check.status === 'OTHER_INTERVIEWER';
                      const endStr = addMinutesToTimeStr(slot, Number(form.interview_duration) || 30);

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBlocked}
                          title={check.reason || `Khung giờ trống: ${slot} – ${endStr}`}
                          onClick={() => setForm({ ...form, interview_time: slot })}
                          className={`px-2.5 py-2 rounded-xl text-xs font-medium border text-center transition-all ${
                            isSelected
                              ? 'bg-primary-600 text-white border-primary-700 shadow-sm ring-2 ring-primary-300 font-bold'
                              : isBlocked
                              ? check.status === 'PAST'
                                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                                : 'bg-red-50 text-red-700 border-red-200 cursor-not-allowed'
                              : isOtherRoom
                              ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              : 'bg-white text-slate-700 border-emerald-200 hover:border-primary-400 hover:bg-primary-50/50'
                          }`}
                        >
                          <div className="text-sm">{slot}</div>
                          <div className={`text-[11px] truncate ${isSelected ? 'text-white/90' : 'opacity-75'}`}>
                            {check.status === 'CONFLICT_INTERVIEWER'
                              ? 'Bận PV'
                              : check.status === 'CONFLICT_CANDIDATE'
                              ? 'UV bận'
                              : isOtherRoom
                              ? 'Ca khác'
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

            {!allowSelfSchedule && selectedTimeCheck && hasHardConflict && (
              <div className="bg-red-50 border border-red-300 text-red-800 rounded-xl p-3.5 text-xs font-medium flex items-start gap-2">
                <Icon name="alert" className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Không thể đặt khung giờ này (Trùng lịch!):</p>
                  <p>{selectedTimeCheck.reason}</p>
                </div>
              </div>
            )}

            {selectedTimeCheck?.status === 'OTHER_INTERVIEWER' && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-xs">
                ℹ️ <strong>Lưu ý:</strong> {selectedTimeCheck.reason}. Nếu dùng chung tài khoản Google Meet, hãy kiểm tra đường link phòng họp để không vào nhầm phòng.
              </div>
            )}
          </section>

          {/* Bước 4: Phòng họp & Ghi chú */}
          <section className="card !p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-900 text-base">
                  3. Link phòng họp trực tuyến & Ghi chú <span className="text-red-500">*</span>
                </h2>
                <p className="text-xs text-slate-500">Đường dẫn phòng họp Google Meet / Zoom sẽ gửi qua email và thông báo cho ứng viên</p>
              </div>
              <div className="flex items-center gap-3">
                {selectedInterviewer?.default_meet_url && form.meet_url !== selectedInterviewer.default_meet_url && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, meet_url: selectedInterviewer.default_meet_url })}
                    className="text-xs font-semibold text-emerald-700 hover:underline"
                  >
                    Dùng phòng Meet của {selectedInterviewer.name}
                  </button>
                )}
                <a
                  href="https://meet.google.com/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-700 hover:text-primary-800 text-xs font-semibold underline"
                >
                  + Tạo phòng Google Meet mới ↗
                </a>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Link phòng họp (Google Meet / Zoom) *
              </label>
              <input
                type="url"
                className="input-field"
                placeholder="https://meet.google.com/xxx-yyyy-zzz"
                value={form.meet_url}
                onChange={(e) => setForm({ ...form, meet_url: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Ghi chú / Nội dung chuẩn bị cho ứng viên (tùy chọn)
              </label>
              <textarea
                className="input-field resize-y"
                rows={3}
                placeholder="VD: Vui lòng chuẩn bị giới thiệu bản thân và demo project cá nhân trong 10 phút..."
                value={form.interview_note}
                onChange={(e) => setForm({ ...form, interview_note: e.target.value })}
              />
            </div>
          </section>
        </div>

        {/* Cột phải: Thông tin ứng viên & Lịch trong ngày + Xác nhận */}
        <aside className="space-y-6 lg:sticky lg:top-20">
          {/* Thẻ ứng viên */}
          <section className="card !p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Thông tin ứng viên</h3>
            <div className="flex items-start gap-3">
              <Avatar name={user?.full_name} src={profile?.avatar_url} size="lg" className="flex-shrink-0" />
              <div className="min-w-0">
                {profile?.id ? (
                  <Link
                    to={`/admin/candidates/${profile.id}`}
                    className="font-bold text-slate-900 hover:text-primary-700 hover:underline block truncate"
                  >
                    {user?.full_name}
                  </Link>
                ) : (
                  <p className="font-bold text-slate-900 truncate">{user?.full_name}</p>
                )}
                <p className="text-xs text-primary-700 font-medium truncate">
                  {profile?.professional_title || 'Ứng viên IT'}
                </p>
                {user?.email && <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>}
                {profile?.phone && <p className="text-xs text-slate-500 truncate">{profile.phone}</p>}
              </div>
            </div>

            {profile?.Skills?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                {profile.Skills.slice(0, 6).map((s) => (
                  <SkillTag key={s.id} name={s.name} />
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
              {profile?.id && (
                <Link
                  to={`/admin/candidates/${profile.id}`}
                  className="btn-secondary text-xs !py-1.5 !px-3 flex-1 text-center"
                >
                  Hồ sơ năng lực
                </Link>
              )}
              {cvUrl && (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-xs !py-1.5 !px-3 flex-1 text-center"
                >
                  Xem CV ↗
                </a>
              )}
            </div>
          </section>

          {/* Các ca phỏng vấn khác trong ngày */}
          <section className="card !p-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">
              Ca phỏng vấn trong ngày ({sameDayInterviews.length})
            </h3>
            {sameDayInterviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                Chưa có ca phỏng vấn nào khác trong ngày đang chọn.
              </p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {sameDayInterviews.map((item) => {
                  const st = toLocalTimeInput(item.interview_time);
                  const dur = item.interview_duration || 30;
                  const et = addMinutesToTimeStr(st, dur);
                  const sameInt = belongsToInterviewer(item, selectedInterviewer);
                  return (
                    <div
                      key={item.id}
                      className={`text-xs p-2.5 rounded-xl border ${
                        sameInt
                          ? 'bg-red-50/80 border-red-200 text-red-900'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 font-bold">
                        <span>{st} – {et}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            sameInt ? 'bg-red-100 text-red-800' : 'bg-white text-slate-700 border border-slate-200'
                          }`}
                        >
                          PV: {item.Interviewer?.name || item.interviewer_name || 'Ban QLDA'}
                        </span>
                      </div>
                      <p className="mt-1 truncate font-medium">
                        {item.CandidateProfile?.User?.full_name || 'Ứng viên'} ·{' '}
                        <span className="text-slate-500 font-normal">{item.ProjectJob?.title}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Tóm tắt & Xác nhận */}
          <section className="card !p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Xác nhận lịch phỏng vấn</h3>
            {allowSelfSchedule && selectedInterviewer ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1">
                <p>
                  <strong>Chế độ:</strong> Ứng viên tự chọn giờ trên lịch trống
                </p>
                <p>
                  <strong>Thời lượng:</strong> {form.interview_duration} phút / ca
                </p>
                <p>
                  <strong>Người phỏng vấn:</strong> {effectiveInterviewerName}
                  {selectedInterviewer.title ? ` (${selectedInterviewer.title})` : ''}
                </p>
              </div>
            ) : form.interview_date && form.interview_time && !hasHardConflict && selectedInterviewer ? (
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-3.5 text-xs text-primary-900 space-y-1">
                <p>
                  <strong>Ngày:</strong>{' '}
                  {new Date(`${form.interview_date}T00:00:00`).toLocaleDateString('vi-VN')}
                </p>
                <p>
                  <strong>Khung giờ:</strong> {form.interview_time} –{' '}
                  {addMinutesToTimeStr(form.interview_time, Number(form.interview_duration) || 30)} ({form.interview_duration} phút)
                </p>
                <p>
                  <strong>Người phỏng vấn:</strong> {effectiveInterviewerName}
                  {selectedInterviewer.title ? ` (${selectedInterviewer.title})` : ''}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Vui lòng chọn người phỏng vấn, ngày giờ và nhập link phòng họp để hoàn tất.
              </p>
            )}

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                disabled={sending || (!allowSelfSchedule && hasHardConflict) || !effectiveInterviewerId}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Icon name="mail" className="w-4 h-4" />
                {sending
                  ? 'Đang lưu & gửi lời mời...'
                  : allowSelfSchedule
                  ? 'Gửi lời mời để Ứng viên tự chọn giờ'
                  : app.interview_time
                  ? 'Cập nhật & Gửi lại lịch'
                  : 'Xác nhận & Gửi lịch phỏng vấn'}
              </button>
              <Link to={backUrl} className="btn-secondary w-full text-center">
                Hủy & Quay lại
              </Link>
            </div>
          </section>
        </aside>
      </form>
      </div>
    </div>
  );
}
