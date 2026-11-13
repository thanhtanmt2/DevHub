import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { projectJobApi } from '@/api/projectJobApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Icon from '@/components/common/Icon';
import PageBanner from '@/components/common/PageBanner';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { INTERVIEW_CRITERIA, INTERVIEW_RESULT_META } from '@/utils/applicationStatus';

export default function ManageInterviewersPage() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const qc = useQueryClient();

  const [newForm, setNewForm] = useState({ name: '', title: '', default_meet_url: '' });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', title: '', default_meet_url: '' });
  const [filterInterviewerId, setFilterInterviewerId] = useState('ALL');
  const [evalFilter, setEvalFilter] = useState('ALL'); // 'ALL' | 'PENDING_EVAL' | 'EVALUATED'
  const [showCriteriaInfo, setShowCriteriaInfo] = useState(false);

  useEffect(() => {
    document.title = 'Quản lý Người phỏng vấn & Link chấm kết quả | DevHub';
  }, []);

  const { data: scheduleRes, isLoading } = useQuery({
    queryKey: ['admin-interviews'],
    queryFn: () => projectJobApi.getAdminInterviews(),
    refetchInterval: 20000,
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

  const regenTokenMutation = useMutation({
    mutationFn: (id) => projectJobApi.regenerateInterviewerToken(id),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Đã tạo mới link share cho người phỏng vấn');
      qc.invalidateQueries({ queryKey: ['admin-interviews'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể đổi link share'),
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

  const copyShareLink = async (person) => {
    if (!person.share_token) return toast.error('Người phỏng vấn chưa có mã chia sẻ');
    const url = `${window.location.origin}/interviewer-portal/${person.share_token}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(`Đã sao chép link phỏng vấn của "${person.name}"!`);
    } catch {
      toast.error('Không thể tự động sao chép, vui lòng copy trực tiếp đường dẫn');
    }
  };

  const filteredInterviews = allInterviews.filter((i) => {
    if (!i.interview_time) return false;
    if (filterInterviewerId !== 'ALL') {
      const person = interviewers.find((p) => p.id === filterInterviewerId);
      if (!person) return false;
      const matchId = i.interviewer_id === person.id;
      const matchName =
        !i.interviewer_id &&
        (i.interviewer_name || '').trim().toLowerCase() === person.name.trim().toLowerCase();
      if (!matchId && !matchName) return false;
    }
    if (evalFilter === 'PENDING_EVAL' && i.interview_result) return false;
    if (evalFilter === 'EVALUATED' && !i.interview_result) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageBanner
          compact
          icon="users"
          title="Quản lý Người phỏng vấn & Link Chấm Kết quả"
          subtitle="Mỗi người phỏng vấn có một đường dẫn (link share) riêng để xem hồ sơ ứng viên được phân công và chấm điểm 5 tiêu chí sau phỏng vấn"
        >
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowCriteriaInfo((v) => !v)}
              className="btn-light inline-flex items-center gap-1.5"
            >
              <Icon name="star" className="w-4 h-4" />
              {showCriteriaInfo ? 'Ẩn bộ tiêu chí chấm PV' : 'Xem 5 tiêu chí chấm PV'}
            </button>
            {window.history.length > 1 && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn-glass inline-flex items-center gap-1.5"
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

        {/* Thông tin bộ 5 tiêu chí chấm điểm chuẩn */}
        {showCriteriaInfo && (
          <div className="card !p-5 border-amber-200 bg-amber-50/40 space-y-3 animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Icon name="star" className="w-4 h-4 text-amber-500" />
                Bộ 5 tiêu chí chuẩn trên Link Share của Người phỏng vấn (Thang điểm 1–10)
              </h3>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Chấm &ldquo;Đạt&rdquo; → Tự động duyệt vào Workspace · Chấm &ldquo;Không đạt&rdquo; → Tự động từ chối
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {INTERVIEW_CRITERIA.map((c, idx) => (
                <div key={c.key} className="bg-white rounded-xl p-3 border border-amber-200/80 text-xs">
                  <p className="font-bold text-slate-900">
                    {idx + 1}. {c.label}
                  </p>
                  <p className="text-slate-500 mt-1 leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form tạo mới người phỏng vấn */}
        <form
          onSubmit={handleCreate}
          className="card border border-primary-100 bg-primary-50/40 space-y-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-primary-900 flex items-center gap-2">
              <Icon name="user" className="w-4 h-4 text-primary-600" />
              + Thêm người phỏng vấn mới
            </h2>
            <span className="text-xs text-gray-500">
              Hệ thống tự động sinh link share riêng ngay khi tạo người phỏng vấn
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
            {/* Cột trái: Danh sách người phỏng vấn & Link Share */}
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
                <div className="space-y-3">
                  {interviewers.map((person) => {
                    const personInterviews = allInterviews.filter(
                      (i) =>
                        i.interviewer_id === person.id ||
                        (!i.interviewer_id &&
                          (i.interviewer_name || '').toLowerCase() === person.name.toLowerCase())
                    );
                    const upcomingCount = personInterviews.filter(
                      (i) =>
                        i.status === 'INTERVIEW' &&
                        new Date(i.interview_time).getTime() >= Date.now() - 3600000
                    ).length;
                    const evaluatedCount = personInterviews.filter((i) => !!i.interview_result).length;
                    const isFiltered = filterInterviewerId === person.id;
                    const shareUrl = person.share_token
                      ? `${window.location.origin}/interviewer-portal/${person.share_token}`
                      : '';

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
                        className={`card p-4 cursor-pointer transition-all border space-y-3 ${
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
                              {evaluatedCount > 0 && (
                                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-primary-50 text-primary-700 border border-primary-200">
                                  Đã chấm {evaluatedCount} UV
                                </span>
                              )}
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

                        {/* Khung Link Share dành riêng cho người phỏng vấn */}
                        {shareUrl && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="pt-2.5 border-t border-slate-100 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                Link Share xem ứng viên & điền kết quả PV:
                              </span>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (
                                    await confirm({
                                      title: 'Tạo lại link share mới',
                                      message: `Đổi đường dẫn mới cho "${person.name}"? Đường dẫn cũ sẽ không còn truy cập được nữa.`,
                                      confirmText: 'Đổi link mới',
                                      tone: 'danger',
                                    })
                                  ) {
                                    regenTokenMutation.mutate(person.id);
                                  }
                                }}
                                className="text-[11px] text-slate-400 hover:text-primary-700 hover:underline"
                                title="Tạo lại link share mới (vô hiệu hóa link cũ)"
                              >
                                Đổi link
                              </button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                readOnly
                                value={shareUrl}
                                onFocus={(e) => e.target.select()}
                                className="input-field !py-1.5 !px-2.5 text-xs bg-slate-50 text-slate-600 flex-1 font-mono"
                              />
                              <button
                                type="button"
                                onClick={() => copyShareLink(person)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white whitespace-nowrap"
                              >
                                Sao chép link
                              </button>
                              <Link
                                to={`/interviewer-portal/${person.share_token}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 whitespace-nowrap"
                                title="Mở trang chấm điểm phỏng vấn của người này ở tab mới"
                              >
                                Mở ↗
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cột phải: Lịch phỏng vấn & Kết quả đánh giá của các dự án */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                  Lịch phỏng vấn & Kết quả ({filteredInterviews.length})
                </h3>
                <div className="flex items-center gap-1.5">
                  {[
                    { id: 'ALL', label: 'Tất cả' },
                    { id: 'PENDING_EVAL', label: 'Chờ kết quả PV' },
                    { id: 'EVALUATED', label: 'Đã có kết quả PV' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEvalFilter(t.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                        evalFilter === t.id
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {filteredInterviews.length === 0 ? (
                <div className="card text-center py-12 text-gray-400 text-sm">
                  Chưa có lịch phỏng vấn nào khớp bộ lọc hiện tại.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredInterviews.map((item) => {
                    const cand = item.CandidateProfile?.User;
                    const job = item.ProjectJob;
                    const project = job?.Project;
                    const interviewerName =
                      item.Interviewer?.name || item.interviewer_name || 'Chưa phân công';
                    const duration = item.interview_duration || 30;
                    const startDate = new Date(item.interview_time);
                    const evalMeta = item.interview_result
                      ? INTERVIEW_RESULT_META[item.interview_result]
                      : null;

                    return (
                      <div
                        key={item.id}
                        className="card p-4 border border-gray-200 hover:border-gray-300 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
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
                              {evalMeta ? (
                                <span
                                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${evalMeta.badgeCls}`}
                                >
                                  ★ {item.interview_score ? `${Number(item.interview_score).toFixed(1)}/10 · ` : ''}
                                  {evalMeta.label}
                                </span>
                              ) : (
                                <>
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
                                </>
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
                              {project?.name && (
                                <span className="text-gray-400">• Dự án: {project.name}</span>
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
                            {item.Interviewer?.share_token && (
                              <Link
                                to={`/interviewer-portal/${item.Interviewer.share_token}?app=${item.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200"
                              >
                                <Icon name="star" className="w-3.5 h-3.5" />
                                {item.interview_result ? 'Xem / Sửa kết quả PV ↗' : 'Chấm kết quả PV ↗'}
                              </Link>
                            )}
                            {project?.id && item.status !== 'ACCEPTED' && item.status !== 'REJECTED' && (
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

                        {/* Hiển thị chi tiết kết quả đánh giá của người phỏng vấn nếu đã chấm */}
                        {item.interview_result && (
                          <div className="pt-2.5 border-t border-slate-100 bg-slate-50/80 rounded-xl p-3 text-xs space-y-2">
                            {item.interview_criteria_scores && (
                              <div className="flex flex-wrap gap-1.5">
                                {INTERVIEW_CRITERIA.map((c) => {
                                  const sc = item.interview_criteria_scores[c.key];
                                  if (sc === undefined) return null;
                                  return (
                                    <span
                                      key={c.key}
                                      className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700"
                                    >
                                      {c.label}: <strong className="text-primary-700">{sc}/10</strong>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                            {item.interview_feedback && (
                              <p className="text-slate-700 italic">
                                Nhận xét của {interviewerName}: “{item.interview_feedback}”
                              </p>
                            )}
                          </div>
                        )}
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
