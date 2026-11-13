import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { projectJobApi } from '@/api/projectJobApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Icon from '@/components/common/Icon';
import { useConfirm } from '@/components/common/ConfirmDialog';
import useEscapeKey from '@/hooks/useEscapeKey';

// ─── Manage Interviewers Modal (Tạo & Quản lý danh sách Người phỏng vấn) ─────
export function ManageInterviewersModal({ onClose }) {
  useEscapeKey(onClose);
  const confirm = useConfirm();
  const qc = useQueryClient();
  const [newForm, setNewForm] = useState({ name: '', title: '', default_meet_url: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', title: '', default_meet_url: '' });

  const { data: scheduleRes, isLoading } = useQuery({
    queryKey: ['admin-interviews'],
    queryFn: () => projectJobApi.getAdminInterviews(),
  });

  const interviewers = scheduleRes?.data?.interviewers || [];
  const allInterviews = scheduleRes?.data?.data || [];

  const createMutation = useMutation({
    mutationFn: (data) => projectJobApi.createInterviewer(data),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Đã thêm người phỏng vấn');
      qc.invalidateQueries({ queryKey: ['admin-interviews'] });
      setNewForm({ name: '', title: '', default_meet_url: '' });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể thêm người phỏng vấn'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => projectJobApi.updateInterviewer(id, data),
    onSuccess: () => {
      toast.success('Đã cập nhật thông tin người phỏng vấn');
      qc.invalidateQueries({ queryKey: ['admin-interviews'] });
      setEditingId(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể cập nhật'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => projectJobApi.deleteInterviewer(id),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Đã xóa người phỏng vấn');
      qc.invalidateQueries({ queryKey: ['admin-interviews'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể xóa người phỏng vấn'),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newForm.name.trim()) return toast.error('Vui lòng nhập tên người phỏng vấn');
    createMutation.mutate(newForm);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[88vh] flex flex-col shadow-2xl animate-fade-in overflow-hidden">
        <div className="bg-brand-gradient p-5 text-white flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Icon name="users" className="w-5 h-5" />
              Quản lý Danh sách Người phỏng vấn
            </h3>
            <p className="text-white/85 text-xs mt-0.5">
              Tạo trước danh sách người phỏng vấn để lựa chọn và chống trùng lịch khi xếp ca
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <Icon name="x" className="w-6 h-6" />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {/* Form tạo mới người phỏng vấn */}
          <form onSubmit={handleCreate} className="bg-primary-50/50 border border-primary-100 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary-800">
              + Thêm người phỏng vấn mới
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tên đại diện người phỏng vấn *</label>
                <input
                  type="text"
                  className="input-field text-sm"
                  placeholder="VD: Nguyễn Văn A"
                  value={newForm.name}
                  onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Chức danh / Chuyên môn</label>
                <input
                  type="text"
                  className="input-field text-sm"
                  placeholder="VD: Tech Lead Backend, HR..."
                  value={newForm.title}
                  onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Link phòng họp Google Meet cố định (tùy chọn)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    className="input-field text-sm flex-1"
                    placeholder="https://meet.google.com/xxx-yyyy-zzz (sẽ tự động điền khi chọn người này)"
                    value={newForm.default_meet_url}
                    onChange={(e) => setNewForm({ ...newForm, default_meet_url: e.target.value })}
                  />
                  <button
                    type="submit"
                    disabled={createMutation.isPending || !newForm.name.trim()}
                    className="btn-primary text-xs px-4 whitespace-nowrap"
                  >
                    {createMutation.isPending ? 'Đang tạo...' : '+ Tạo mới'}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Danh sách người phỏng vấn đã tạo */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Danh sách người phỏng vấn ({interviewers.length})
            </h4>
            {isLoading ? (
              <LoadingSpinner />
            ) : interviewers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Chưa có người phỏng vấn nào. Hãy tạo ở form trên.</p>
            ) : (
              <div className="space-y-2">
                {interviewers.map((person) => {
                  const upcomingCount = allInterviews.filter(
                    (i) =>
                      i.status === 'INTERVIEW' &&
                      (i.interviewer_id === person.id ||
                        (!i.interviewer_id && (i.interviewer_name || '').toLowerCase() === person.name.toLowerCase())) &&
                      new Date(i.interview_time).getTime() >= Date.now() - 3600000
                  ).length;

                  if (editingId === person.id) {
                    return (
                      <div key={person.id} className="p-3 rounded-xl border border-primary-300 bg-primary-50/30 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            className="input-field text-xs"
                            placeholder="Tên người phỏng vấn *"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          />
                          <input
                            className="input-field text-xs"
                            placeholder="Chức danh / Chuyên môn"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          />
                          <input
                            className="input-field text-xs sm:col-span-2"
                            placeholder="Link Google Meet cố định (nếu có)"
                            value={editForm.default_meet_url}
                            onChange={(e) => setEditForm({ ...editForm, default_meet_url: e.target.value })}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 rounded text-xs bg-gray-100 text-gray-700"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => updateMutation.mutate({ id: person.id, data: editForm })}
                            disabled={updateMutation.isPending}
                            className="px-3 py-1 rounded text-xs bg-primary-600 text-white font-semibold"
                          >
                            Lưu thay đổi
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={person.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-200 hover:border-gray-300 bg-white"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-gray-900">{person.name}</span>
                          {person.title && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                              {person.title}
                            </span>
                          )}
                          <span
                            className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                              upcomingCount > 0
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {upcomingCount > 0 ? `${upcomingCount} ca sắp tới` : 'Đang rảnh'}
                          </span>
                        </div>
                        {person.default_meet_url && (
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            Meet mặc định: <span className="text-primary-700">{person.default_meet_url}</span>
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(person.id);
                            setEditForm({
                              name: person.name || '',
                              title: person.title || '',
                              default_meet_url: person.default_meet_url || '',
                            });
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 text-gray-700"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            if (
                              await confirm({
                                title: 'Xóa người phỏng vấn',
                                message: `Bạn có chắc muốn xóa người phỏng vấn "${person.name}" khỏi danh sách?`,
                                confirmText: 'Xóa',
                                tone: 'danger',
                              })
                            ) {
                              deleteMutation.mutate(person.id);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 hover:bg-red-100 text-red-600"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end bg-gray-50">
          <button type="button" onClick={onClose} className="btn-secondary">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Schedule Interview Modal (Visual Time-Slot Picker + Conflict Guard) ─────
const INTERVIEW_SLOT_GROUPS = [
  { label: 'Buổi sáng', slots: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00'] },
  { label: 'Buổi chiều', slots: ['13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'] },
  { label: 'Buổi tối', slots: ['19:00', '19:30', '20:00', '20:30'] },
];
const DURATION_OPTIONS = [15, 30, 45, 60, 90];

function toLocalDateInput(d) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '';
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function toLocalTimeInput(d) {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '';
  const hh = String(dt.getHours()).padStart(2, '0');
  const min = String(dt.getMinutes()).padStart(2, '0');
  return `${hh}:${min}`;
}

function addMinutesToTimeStr(timeStr, minutes) {
  if (!timeStr || !timeStr.includes(':')) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const endH = String(Math.floor(total / 60) % 24).padStart(2, '0');
  const endM = String(total % 60).padStart(2, '0');
  return `${endH}:${endM}`;
}

export function ScheduleInterviewModal({ app, onClose, onSuccess, onManageInterviewers }) {
  useEscapeKey(onClose);
  const qc = useQueryClient();
  const defaultDate = app.interview_time
    ? toLocalDateInput(app.interview_time)
    : toLocalDateInput(new Date(Date.now() + 86400000));

  const [form, setForm] = useState({
    interview_date: defaultDate,
    interview_time: app.interview_time ? toLocalTimeInput(app.interview_time) : '',
    interview_duration: app.interview_duration || 30,
    interviewer_id: app.interviewer_id || '',
    meet_url: app.meet_url || '',
    interview_note: app.interview_note || '',
  });
  const [sending, setSending] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [newInterviewer, setNewInterviewer] = useState({ name: '', title: '', default_meet_url: '' });
  const [creatingInterviewer, setCreatingInterviewer] = useState(false);

  const { data: scheduleRes, isLoading: loadingSchedule } = useQuery({
    queryKey: ['admin-interviews'],
    queryFn: () => projectJobApi.getAdminInterviews(),
  });

  const allInterviews = scheduleRes?.data?.data || [];
  const interviewers = (scheduleRes?.data?.interviewers || []).filter((i) => i.is_active !== false);

  const selectedInterviewer =
    interviewers.find((i) => i.id === form.interviewer_id) ||
    interviewers.find((i) => app.interviewer_name && i.name.toLowerCase() === app.interviewer_name.toLowerCase()) ||
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

  const profile = app.CandidateProfile;
  const user = profile?.User;

  const sameDayInterviews = allInterviews.filter((item) => {
    if (item.id === app.id || item.status !== 'INTERVIEW' || !item.interview_time) return false;
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
    if (!form.interview_date || !timeStr) return { status: 'FREE' };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!effectiveInterviewerId) {
      toast.error('Vui lòng tạo và chọn người phỏng vấn trước khi đặt lịch');
      return;
    }
    if (!form.interview_date || !form.interview_time || !form.meet_url) {
      toast.error('Vui lòng chọn ngày, khung giờ và nhập link phòng họp');
      return;
    }
    if (hasHardConflict) {
      toast.error(selectedTimeCheck.reason);
      return;
    }
    const interview_time = new Date(`${form.interview_date}T${form.interview_time}:00`).toISOString();
    setSending(true);
    try {
      await projectJobApi.scheduleInterview(app.id, {
        interview_time,
        interview_duration: Number(form.interview_duration) || 30,
        interviewer_id: effectiveInterviewerId,
        meet_url: form.meet_url,
        interview_note: form.interview_note || undefined,
      });
      qc.invalidateQueries({ queryKey: ['admin-interviews'] });
      toast.success('Đã đặt lịch phỏng vấn và gửi thông báo cho ứng viên!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi đặt lịch phỏng vấn');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="bg-brand-gradient p-5 text-white flex-shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold flex items-center gap-1.5">
                <Icon name="calendar" className="w-5 h-5" />
                {app.interview_time ? 'Cập nhật / Đổi lịch phỏng vấn' : 'Đặt lịch phỏng vấn thông minh'}
              </h3>
              <p className="text-white/85 text-xs mt-0.5">
                Chọn người phỏng vấn từ danh sách đã tạo — hệ thống tự động khóa các khung giờ bị trùng
              </p>
            </div>
            <button onClick={onClose} aria-label="Đóng" className="text-white/80 hover:text-white">
              <Icon name="x" className="w-6 h-6" />
            </button>
          </div>
          <div className="mt-3 bg-white/10 rounded-xl p-2.5 text-sm flex items-center justify-between gap-2">
            <div>
              <p className="font-semibold">{user?.full_name}</p>
              <p className="text-white/80 text-xs">{user?.email}</p>
            </div>
            {app.interview_time && (
              <span className="text-xs bg-white/20 px-2.5 py-1 rounded-lg font-medium">
                Lịch hiện tại: {new Date(app.interview_time).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {app.interview_response === 'RESCHEDULE_REQUESTED' && app.candidate_reschedule_note && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-sm text-amber-900">
              <p className="font-bold flex items-center gap-1.5 text-amber-800 mb-1">
                <Icon name="clock" className="w-4 h-4" />
                Ứng viên xin đổi lịch phỏng vấn:
              </p>
              <p className="italic">“{app.candidate_reschedule_note}”</p>
            </div>
          )}

          {/* Bước 1: Lựa chọn Người phỏng vấn */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                1. Chọn người phỏng vấn * <span className="text-gray-400 font-normal normal-case">(Bấm chọn 1 người phụ trách ca này)</span>
              </label>
              <div className="flex items-center gap-1.5">
                {onManageInterviewers && (
                  <button
                    type="button"
                    onClick={onManageInterviewers}
                    className="text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg border border-gray-200 transition-colors"
                  >
                    Quản lý DS
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowQuickCreate(!showQuickCreate)}
                  className="text-xs font-semibold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg border border-primary-200 transition-colors"
                >
                  {showQuickCreate ? 'Đóng form tạo' : '+ Tạo người phỏng vấn mới'}
                </button>
              </div>
            </div>

            {showQuickCreate && (
              <div className="bg-primary-50/60 border border-primary-200 rounded-xl p-3 space-y-2.5 animate-fade-in">
                <p className="text-xs font-bold text-primary-800">Tạo người phỏng vấn mới vào hệ thống:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    className="input-field text-xs bg-white"
                    placeholder="Tên đại diện người phỏng vấn * (VD: Trần Văn B)"
                    value={newInterviewer.name}
                    onChange={(e) => setNewInterviewer({ ...newInterviewer, name: e.target.value })}
                  />
                  <input
                    type="text"
                    className="input-field text-xs bg-white"
                    placeholder="Chức danh / Chuyên môn (VD: Tech Lead)"
                    value={newInterviewer.title}
                    onChange={(e) => setNewInterviewer({ ...newInterviewer, title: e.target.value })}
                  />
                  <input
                    type="url"
                    className="input-field text-xs bg-white sm:col-span-2"
                    placeholder="Link Google Meet mặc định của người này (tùy chọn)"
                    value={newInterviewer.default_meet_url}
                    onChange={(e) => setNewInterviewer({ ...newInterviewer, default_meet_url: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickCreate(false)}
                    className="px-2.5 py-1 rounded-lg text-xs bg-white border border-gray-200 text-gray-600"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={creatingInterviewer || !newInterviewer.name.trim()}
                    onClick={handleQuickCreateInterviewer}
                    className="px-3 py-1 rounded-lg text-xs font-bold bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
                  >
                    {creatingInterviewer ? 'Đang lưu...' : 'Lưu & Chọn người này'}
                  </button>
                </div>
              </div>
            )}

            {interviewers.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-amber-300 bg-amber-50 text-xs text-amber-800 text-center">
                Chưa có người phỏng vấn nào trong danh sách. Hãy bấm <strong>"+ Tạo người phỏng vấn mới"</strong> ở góc phải bên trên để tạo!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {interviewers.map((person) => {
                  const isSelected = effectiveInterviewerId === person.id;
                  const dayCount = sameDayInterviews.filter((item) => belongsToInterviewer(item, person)).length;
                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => handleSelectInterviewer(person)}
                      className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-primary-50 border-primary-600 ring-2 ring-primary-200 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                              isSelected ? 'bg-primary-600 text-white' : 'border border-gray-300 text-transparent'
                            }`}
                          >
                            ✓
                          </span>
                          <span className={`text-xs font-bold truncate ${isSelected ? 'text-primary-900' : 'text-gray-800'}`}>
                            {person.name}
                          </span>
                        </div>
                        {person.title && (
                          <p className="text-[11px] text-gray-500 truncate pl-5">{person.title}</p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                          dayCount > 0
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {dayCount > 0 ? `${dayCount} ca ngày này` : 'Trống lịch'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bước 2: Thời lượng, Ngày phỏng vấn & Giờ bắt đầu */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                2. Thời lượng ca phỏng vấn
              </label>
              <div className="grid grid-cols-5 gap-1">
                {DURATION_OPTIONS.map((min) => (
                  <button
                    key={min}
                    type="button"
                    onClick={() => setForm({ ...form, interview_duration: min })}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                      Number(form.interview_duration) === min
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {min}p
                  </button>
                ))}
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                3. Ngày phỏng vấn *
              </label>
              <input
                type="date"
                className="input-field text-sm"
                min={toLocalDateInput(new Date())}
                value={form.interview_date}
                onChange={(e) => setForm({ ...form, interview_date: e.target.value })}
                required
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                Giờ bắt đầu – Kết thúc *
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="time"
                  className="input-field text-sm flex-1"
                  value={form.interview_time}
                  onChange={(e) => setForm({ ...form, interview_time: e.target.value })}
                  required
                />
                {form.interview_time && (
                  <span className="px-2 py-2 rounded-lg bg-primary-50 border border-primary-200 text-xs font-bold text-primary-700 whitespace-nowrap">
                    → {addMinutesToTimeStr(form.interview_time, Number(form.interview_duration) || 30)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bảng chọn nhanh khung giờ trống / bận trong ngày */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Icon name="clock" className="w-4 h-4 text-primary-600" />
                Lịch khung giờ của <strong>{effectiveInterviewerName}</strong> ngày{' '}
                {form.interview_date ? new Date(`${form.interview_date}T00:00:00`).toLocaleDateString('vi-VN') : '—'}
                {loadingSchedule && <span className="text-gray-400 font-normal">(đang kiểm tra...)</span>}
              </span>
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-white border border-emerald-400 inline-block" />Trống
                </span>
                <span className="inline-flex items-center gap-1 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-400 inline-block" />Có ca người khác
                </span>
                <span className="inline-flex items-center gap-1 text-red-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-300 inline-block" />Trùng người PV / Ứng viên
                </span>
              </div>
            </div>

            {INTERVIEW_SLOT_GROUPS.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="text-[11px] font-semibold text-gray-500">{group.label}</p>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
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
                        className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                          isSelected
                            ? 'bg-primary-600 text-white border-primary-700 shadow-sm ring-2 ring-primary-300 font-bold'
                            : isBlocked
                            ? check.status === 'PAST'
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through'
                              : 'bg-red-50 text-red-700 border-red-200 cursor-not-allowed'
                            : isOtherRoom
                            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                            : 'bg-white text-gray-700 border-emerald-200 hover:border-primary-400 hover:bg-primary-50/50'
                        }`}
                      >
                        <div>{slot}</div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-white/90' : 'opacity-75'}`}>
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

            {sameDayInterviews.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <p className="text-[11px] font-bold text-slate-600 mb-1.5">
                  Lịch phỏng vấn đã có trong ngày ({sameDayInterviews.length} ca):
                </p>
                <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                  {sameDayInterviews.map((item) => {
                    const st = toLocalTimeInput(item.interview_time);
                    const dur = item.interview_duration || 30;
                    const et = addMinutesToTimeStr(st, dur);
                    const sameInt = belongsToInterviewer(item, selectedInterviewer);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between gap-2 text-xs px-2.5 py-1.5 rounded-lg border ${
                          sameInt
                            ? 'bg-red-50/80 border-red-200 text-red-900'
                            : 'bg-white border-gray-200 text-gray-700'
                        }`}
                      >
                        <div className="truncate">
                          <span className="font-bold">{st} – {et}</span>
                          {' · '}
                          <span className="font-medium">{item.CandidateProfile?.User?.full_name || 'Ứng viên'}</span>
                          <span className="text-gray-500"> ({item.ProjectJob?.title})</span>
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded font-semibold flex-shrink-0 ${
                          sameInt ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
                        }`}>
                          PV: {item.Interviewer?.name || item.interviewer_name || 'Ban QLDA'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {selectedTimeCheck && hasHardConflict && (
            <div className="bg-red-50 border border-red-300 text-red-800 rounded-xl p-3 text-xs font-medium flex items-start gap-2">
              <Icon name="alert" className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Không thể đặt khung giờ này (Trùng lịch!):</p>
                <p>{selectedTimeCheck.reason}</p>
              </div>
            </div>
          )}

          {selectedTimeCheck?.status === 'OTHER_INTERVIEWER' && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-2.5 text-xs">
              ℹ️ <strong>Lưu ý:</strong> {selectedTimeCheck.reason}. Nếu dùng chung tài khoản Google Meet, hãy kiểm tra đường link phòng họp để không vào nhầm phòng.
            </div>
          )}

          {/* Bước 4: Link Google Meet & Ghi chú */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                4. Link phòng họp trực tuyến (Google Meet / Zoom) *
              </label>
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
            <input
              type="url"
              className="input-field text-sm"
              placeholder="https://meet.google.com/xxx-yyyy-zzz"
              value={form.meet_url}
              onChange={(e) => setForm({ ...form, meet_url: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
              Ghi chú / Nội dung chuẩn bị cho ứng viên (tùy chọn)
            </label>
            <textarea
              className="input-field resize-none text-sm"
              rows={2}
              placeholder="VD: Vui lòng chuẩn bị giới thiệu bản thân và demo project cá nhân trong 10 phút..."
              value={form.interview_note}
              onChange={(e) => setForm({ ...form, interview_note: e.target.value })}
            />
          </div>

          {form.interview_date && form.interview_time && !hasHardConflict && selectedInterviewer && (
            <div className="bg-primary-50 border border-primary-200 rounded-xl p-3 text-xs text-primary-800">
              <p className="font-bold mb-0.5 flex items-center gap-1">
                <Icon name="mail" className="w-3.5 h-3.5" />Tóm tắt lịch phỏng vấn sẽ gửi cho ứng viên:
              </p>
              <p>
                Ứng viên <strong>{user?.full_name}</strong> · Phỏng vấn từ{' '}
                <strong>
                  {form.interview_time} – {addMinutesToTimeStr(form.interview_time, Number(form.interview_duration) || 30)}
                </strong>{' '}
                ({form.interview_duration} phút) ngày{' '}
                <strong>{new Date(`${form.interview_date}T00:00:00`).toLocaleDateString('vi-VN')}</strong> · Người phỏng vấn:{' '}
                <strong>{effectiveInterviewerName}</strong>
                {selectedInterviewer.title ? ` (${selectedInterviewer.title})` : ''}.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Hủy
            </button>
            <button
              type="submit"
              disabled={sending || hasHardConflict || !effectiveInterviewerId}
              className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {sending ? (
                'Đang lưu & gửi lịch...'
              ) : (
                <>
                  <Icon name="mail" className="w-4 h-4" />
                  {app.interview_time ? 'Cập nhật & Gửi lại lịch' : 'Xác nhận & Gửi lịch phỏng vấn'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
