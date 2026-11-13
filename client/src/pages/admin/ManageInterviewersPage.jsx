import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { projectJobApi } from '@/api/projectJobApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Icon from '@/components/common/Icon';
import PageBanner from '@/components/common/PageBanner';
import { useConfirm } from '@/components/common/ConfirmDialog';

export default function ManageInterviewersPage() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const qc = useQueryClient();

  const [newForm, setNewForm] = useState({ name: '', title: '', default_meet_url: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', title: '', default_meet_url: '' });
  const [filterInterviewerId, setFilterInterviewerId] = useState('ALL');

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
      if (filterInterviewerId === id) setFilterInterviewerId('ALL');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể xóa người phỏng vấn'),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newForm.name.trim()) return toast.error('Vui lòng nhập tên người phỏng vấn');
    createMutation.mutate(newForm);
  };

  const upcomingInterviews = allInterviews.filter((i) => {
    if (i.status !== 'INTERVIEW' || !i.interview_time) return false;
    if (filterInterviewerId !== 'ALL') {
      const person = interviewers.find((p) => p.id === filterInterviewerId);
      if (!person) return false;
      const matchId = i.interviewer_id === person.id;
      const matchName =
        !i.interviewer_id &&
        (i.interviewer_name || '').trim().toLowerCase() === person.name.trim().toLowerCase();
      if (!matchId && !matchName) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageBanner
          compact
          icon="users"
          title="Quản lý Danh sách Người phỏng vấn"
          subtitle="Thiết lập người phỏng vấn, phòng họp Google Meet cố định và theo dõi toàn bộ lịch phỏng vấn dự án"
        >
          <div className="flex flex-wrap items-center gap-2">
            {window.history.length > 1 && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-light inline-flex items-center gap-1.5"
              >
                <Icon name="chevronLeft" className="w-4 h-4" />
                Quay lại
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                window.close();
                navigate(-1);
              }}
              className="btn-glass inline-flex items-center gap-1.5"
            >
              <Icon name="x" className="w-4 h-4" />
              Đóng tab
            </button>
          </div>
        </PageBanner>

      {/* Form tạo mới người phỏng vấn */}
      <form
        onSubmit={handleCreate}
        className="card border border-primary-100 bg-primary-50/40 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-primary-900 flex items-center gap-2">
            <Icon name="user" className="w-4 h-4 text-primary-600" />
            + Thêm người phỏng vấn mới
          </h2>
          <span className="text-xs text-gray-500">
            Người phỏng vấn sẽ xuất hiện khi xếp lịch để chống trùng ca
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Tên đại diện người phỏng vấn *
            </label>
            <input
              type="text"
              className="input-field text-sm bg-white"
              placeholder="VD: Nguyễn Văn A"
              value={newForm.name}
              onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
              required
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Chức danh / Chuyên môn
            </label>
            <input
              type="text"
              className="input-field text-sm bg-white"
              placeholder="VD: Tech Lead Backend, HR..."
              value={newForm.title}
              onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Link Google Meet cố định (tùy chọn)
            </label>
            <input
              type="url"
              className="input-field text-sm bg-white"
              placeholder="https://meet.google.com/xxx-yyyy-zzz"
              value={newForm.default_meet_url}
              onChange={(e) => setNewForm({ ...newForm, default_meet_url: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={createMutation.isPending || !newForm.name.trim()}
              className="btn-primary w-full py-2.5 text-sm font-semibold"
            >
              {createMutation.isPending ? 'Đang tạo...' : '+ Thêm mới'}
            </button>
          </div>
        </div>
      </form>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Cột trái: Danh sách người phỏng vấn */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                Danh sách người phỏng vấn ({interviewers.length})
              </h3>
              {filterInterviewerId !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setFilterInterviewerId('ALL')}
                  className="text-xs text-primary-600 hover:underline font-medium"
                >
                  Xem tất cả lịch ({allInterviews.length})
                </button>
              )}
            </div>

            {interviewers.length === 0 ? (
              <div className="card text-center py-12 text-gray-400 text-sm">
                Chưa có người phỏng vấn nào. Hãy thêm ở biểu mẫu phía trên.
              </div>
            ) : (
              <div className="space-y-2.5">
                {interviewers.map((person) => {
                  const upcomingCount = allInterviews.filter(
                    (i) =>
                      i.status === 'INTERVIEW' &&
                      (i.interviewer_id === person.id ||
                        (!i.interviewer_id &&
                          (i.interviewer_name || '').toLowerCase() === person.name.toLowerCase())) &&
                      new Date(i.interview_time).getTime() >= Date.now() - 3600000
                  ).length;

                  const isFiltered = filterInterviewerId === person.id;

                  if (editingId === person.id) {
                    return (
                      <div
                        key={person.id}
                        className="card border-2 border-primary-400 bg-primary-50/20 space-y-3"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Tên người phỏng vấn *
                            </label>
                            <input
                              className="input-field text-sm bg-white"
                              placeholder="Tên người phỏng vấn *"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Chức danh / Chuyên môn
                            </label>
                            <input
                              className="input-field text-sm bg-white"
                              placeholder="Chức danh / Chuyên môn"
                              value={editForm.title}
                              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Link Google Meet cố định
                            </label>
                            <input
                              className="input-field text-sm bg-white"
                              placeholder="Link Google Meet cố định (nếu có)"
                              value={editForm.default_meet_url}
                              onChange={(e) =>
                                setEditForm({ ...editForm, default_meet_url: e.target.value })
                              }
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => updateMutation.mutate({ id: person.id, data: editForm })}
                            disabled={updateMutation.isPending}
                            className="px-4 py-1.5 rounded-lg text-xs bg-primary-600 hover:bg-primary-700 text-white font-semibold"
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
                      onClick={() =>
                        setFilterInterviewerId(isFiltered ? 'ALL' : person.id)
                      }
                      className={`card p-4 cursor-pointer transition-all border ${
                        isFiltered
                          ? 'border-primary-500 ring-2 ring-primary-100 bg-primary-50/20'
                          : 'border-gray-200 hover:border-primary-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
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
                            <p className="text-xs text-gray-500 truncate mt-1">
                              Meet mặc định:{' '}
                              <a
                                href={person.default_meet_url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-primary-700 hover:underline"
                              >
                                {person.default_meet_url}
                              </a>
                            </p>
                          )}
                        </div>
                        <div
                          className="flex items-center gap-1.5 flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
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
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cột phải: Lịch phỏng vấn của các dự án */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                Lịch phỏng vấn dự án ({upcomingInterviews.length})
              </h3>
              <span className="text-xs text-gray-500">
                Bấm vào người phỏng vấn bên trái để lọc theo người phụ trách
              </span>
            </div>

            {upcomingInterviews.length === 0 ? (
              <div className="card text-center py-12 text-gray-400 text-sm">
                Chưa có lịch phỏng vấn nào khớp bộ lọc hiện tại.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingInterviews.map((item) => {
                  const cand = item.CandidateProfile?.User;
                  const job = item.ProjectJob;
                  const project = job?.Project;
                  const interviewerName =
                    item.Interviewer?.name || item.interviewer_name || 'Chưa phân công';
                  const duration = item.interview_duration || 30;
                  const startDate = new Date(item.interview_time);

                  return (
                    <div
                      key={item.id}
                      className="card p-4 border border-gray-200 hover:border-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold">
                            {startDate.toLocaleString('vi-VN', {
                              weekday: 'short',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            ({duration}p)
                          </span>
                          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                            Người PV: {interviewerName}
                          </span>
                          {item.interview_response === 'CONFIRMED' && (
                            <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              ✓ Ứng viên xác nhận
                            </span>
                          )}
                          {item.interview_response === 'RESCHEDULE_REQUESTED' && (
                            <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                              Xin đổi lịch
                            </span>
                          )}
                          {item.interview_response === 'PENDING' && (
                            <span className="text-xs font-medium bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                              Chờ ứng viên phản hồi
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-bold text-gray-900">
                          Ứng viên: {cand?.full_name || '—'}{' '}
                          <span className="text-xs font-normal text-gray-500">
                            ({cand?.email || ''})
                          </span>
                        </p>

                        <p className="text-xs text-gray-600">
                          Vị trí:{' '}
                          {project?.id ? (
                            <Link
                              to={`/admin/projects/${project.id}/jobs?job=${job.id}`}
                              className="font-semibold text-primary-700 hover:underline"
                            >
                              {job?.title}
                            </Link>
                          ) : (
                            <span className="font-semibold">{job?.title}</span>
                          )}{' '}
                          {project?.title && (
                            <span className="text-gray-400">• Dự án: {project.title}</span>
                          )}
                        </p>

                        {item.interview_response === 'RESCHEDULE_REQUESTED' &&
                          item.candidate_reschedule_note && (
                            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-1 italic">
                              Lý do xin dời: “{item.candidate_reschedule_note}”
                            </p>
                          )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
                        {item.meet_url && (
                          <a
                            href={item.meet_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white"
                          >
                            <Icon name="video" className="w-3.5 h-3.5" />
                            Vào Google Meet ↗
                          </a>
                        )}
                        {project?.id && (
                          <Link
                            to={`/admin/projects/${project.id}/applications/${item.id}/interview`}
                            className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                          >
                            <Icon name="calendar" className="w-3.5 h-3.5" />
                            Đổi lịch phỏng vấn
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
