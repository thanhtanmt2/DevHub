import { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { projectJobApi } from '@/api/projectJobApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Icon, { IconBadge } from '@/components/common/Icon';
import Avatar from '@/components/common/Avatar';
import PageBanner from '@/components/common/PageBanner';
import { SkillTag } from '@/components/common/Badges';
import { useConfirm } from '@/components/common/ConfirmDialog';
import {
  INTERVIEW_CRITERIA,
  INTERVIEW_RESULT_META,
  PROJECT_APPLICATION_STATUS,
} from '@/utils/applicationStatus';
import { EXPERIENCE_LABELS, formatDate, formatMoney } from '@/utils/jobMeta';

const DEFAULT_CRITERIA_SCORES = {
  technical: 7,
  problem_solving: 7,
  experience: 7,
  communication: 7,
  culture_fit: 7,
};

function getScoreGrade(avg) {
  if (avg >= 9) return { label: 'Xuất sắc', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  if (avg >= 8) return { label: 'Giỏi', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (avg >= 6.5) return { label: 'Khá', cls: 'bg-primary-50 text-primary-700 border-primary-200' };
  if (avg >= 5) return { label: 'Đạt yêu cầu', cls: 'bg-amber-50 text-amber-800 border-amber-200' };
  return { label: 'Chưa đạt', cls: 'bg-rose-50 text-rose-700 border-rose-200' };
}

export default function InterviewerPortalPage() {
  const { token } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();
  const confirm = useConfirm();

  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'PENDING_EVAL' | 'EVALUATED'
  const [searchQuery, setSearchQuery] = useState('');
  const [showJobDetails, setShowJobDetails] = useState(false);

  // State chấm điểm của hồ sơ đang chọn
  const [scores, setScores] = useState(DEFAULT_CRITERIA_SCORES);
  const [result, setResult] = useState(''); // 'PASS' | 'CONSIDER' | 'REJECT'
  const [feedback, setFeedback] = useState('');

  const { data: portalRes, isLoading, isError, error } = useQuery({
    queryKey: ['interviewer-portal', token],
    queryFn: () => projectJobApi.getInterviewerPortal(token),
    enabled: !!token,
    retry: false,
  });

  const portalData = portalRes?.data?.data;
  const interviewer = portalData?.interviewer;
  const criteriaList = portalData?.criteria || INTERVIEW_CRITERIA;
  const applications = useMemo(() => portalData?.applications || [], [portalData]);

  useEffect(() => {
    document.title = interviewer?.name
      ? `Cổng Phỏng vấn — ${interviewer.name} | DevHub`
      : 'Cổng Đánh giá Phỏng vấn | DevHub';
  }, [interviewer?.name]);

  const selectedAppId = searchParams.get('app') || applications[0]?.id || '';
  const selectedApp = useMemo(
    () => applications.find((a) => a.id === selectedAppId) || applications[0] || null,
    [applications, selectedAppId]
  );

  // Đồng bộ form chấm điểm khi chuyển sang ứng viên khác
  useEffect(() => {
    if (!selectedApp) return;
    const savedScores = selectedApp.interview_criteria_scores;
    if (savedScores && typeof savedScores === 'object') {
      const merged = { ...DEFAULT_CRITERIA_SCORES };
      for (const c of criteriaList) {
        if (Number.isFinite(Number(savedScores[c.key]))) {
          merged[c.key] = Number(savedScores[c.key]);
        }
      }
      setScores(merged);
    } else {
      setScores(DEFAULT_CRITERIA_SCORES);
    }
    setResult(selectedApp.interview_result || '');
    setFeedback(selectedApp.interview_feedback || '');
  }, [selectedApp?.id, selectedApp?.interview_evaluated_at, criteriaList]);

  const setSelectedAppId = (id) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (id) next.set('app', id);
      else next.delete('app');
      return next;
    }, { replace: true });
  };

  const evaluateMutation = useMutation({
    mutationFn: ({ appId, payload }) =>
      projectJobApi.submitInterviewerEvaluation(token, appId, payload),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Đã lưu kết quả phỏng vấn!');
      qc.invalidateQueries({ queryKey: ['interviewer-portal', token] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể lưu kết quả phỏng vấn');
    },
  });

  const avgScore = useMemo(() => {
    const vals = criteriaList.map((c) => Number(scores[c.key]) || 0);
    if (!vals.length) return 0;
    const sum = vals.reduce((a, b) => a + b, 0);
    return Math.round((sum / vals.length) * 10) / 10;
  }, [scores, criteriaList]);

  const filteredApps = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return applications.filter((app) => {
      if (filterTab === 'PENDING_EVAL' && app.interview_result) return false;
      if (filterTab === 'EVALUATED' && !app.interview_result) return false;
      if (q) {
        const candName = app.CandidateProfile?.User?.full_name?.toLowerCase() || '';
        const candEmail = app.CandidateProfile?.User?.email?.toLowerCase() || '';
        const jobTitle = app.ProjectJob?.title?.toLowerCase() || '';
        const projName = app.ProjectJob?.Project?.name?.toLowerCase() || '';
        if (!candName.includes(q) && !candEmail.includes(q) && !jobTitle.includes(q) && !projName.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [applications, filterTab, searchQuery]);

  const stats = useMemo(() => {
    const total = applications.length;
    const evaluated = applications.filter((a) => !!a.interview_result).length;
    const pending = total - evaluated;
    const passCount = applications.filter((a) => a.interview_result === 'PASS').length;
    return { total, evaluated, pending, passCount };
  }, [applications]);

  const handleSubmitEvaluation = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;
    if (!result) {
      toast.error('Vui lòng chọn Kết luận phỏng vấn (Đạt / Cân nhắc thêm / Không đạt)');
      return;
    }

    const candName = selectedApp.CandidateProfile?.User?.full_name || 'ứng viên';
    const jobTitle = selectedApp.ProjectJob?.title || 'vị trí dự án';

    if (result === 'PASS' && selectedApp.status !== 'ACCEPTED') {
      const ok = await confirm({
        title: 'Xác nhận ĐẠT & Duyệt thẳng vào Workspace',
        message: `Bạn chọn kết quả ĐẠT (${avgScore}/10) cho ứng viên ${candName} ở vị trí "${jobTitle}". Hệ thống sẽ tự động duyệt ứng viên vào Không gian làm việc (Workspace) của dự án và gửi email trúng tuyển ngay lập tức.`,
        confirmText: 'Xác nhận Đạt & Duyệt vào dự án',
        tone: 'primary',
      });
      if (!ok) return;
    } else if (result === 'REJECT' && selectedApp.status !== 'REJECTED') {
      const ok = await confirm({
        title: 'Xác nhận KHÔNG ĐẠT & Từ chối hồ sơ',
        message: `Bạn chọn kết quả KHÔNG ĐẠT (${avgScore}/10) cho ứng viên ${candName}. Hệ thống sẽ tự động chuyển hồ sơ sang trạng thái Từ chối và gửi email thông báo kết quả cho ứng viên.`,
        confirmText: 'Xác nhận Không đạt',
        tone: 'danger',
      });
      if (!ok) return;
    }

    evaluateMutation.mutate({
      appId: selectedApp.id,
      payload: {
        result,
        criteria_scores: scores,
        feedback,
      },
    });
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (isError || !interviewer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="card text-center py-14 max-w-md w-full">
          <IconBadge name="alert" tone="amber" size="lg" className="mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900">
            Đường dẫn chia sẻ không hợp lệ hoặc đã hết hạn
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {error?.response?.data?.message ||
              'Vui lòng liên hệ Quản trị viên dự án để nhận lại đường dẫn phỏng vấn mới nhất.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Banner thông tin Người phỏng vấn */}
        <PageBanner
          compact
          icon="users"
          title={`Cổng Phỏng vấn & Đánh giá Ứng viên — ${interviewer.name}`}
          subtitle={`${interviewer.title || 'Người phỏng vấn dự án'} · Tổng ${stats.total} ca phỏng vấn · ${stats.pending} chờ chấm kết quả · ${stats.evaluated} đã hoàn thành`}
        >
          <div className="flex flex-wrap items-center gap-2">
            {interviewer.default_meet_url && (
              <a
                href={interviewer.default_meet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-light inline-flex items-center gap-1.5"
              >
                <Icon name="video" className="w-4 h-4" />
                Phòng Google Meet cố định ↗
              </a>
            )}
          </div>
        </PageBanner>

        {applications.length === 0 ? (
          <div className="card text-center py-16">
            <IconBadge name="calendar" size="lg" className="mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Hiện chưa có lịch phỏng vấn nào được phân công cho bạn
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Khi Ban quản lý dự án xếp lịch phỏng vấn ứng viên cho <strong>{interviewer.name}</strong>, thông tin hồ sơ, CV và biểu mẫu chấm điểm sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ─── CỘT TRÁI: Danh sách các ca phỏng vấn được phân công ─── */}
            <aside className="lg:col-span-4 space-y-3 lg:sticky lg:top-6">
              <div className="card !p-3.5 space-y-3">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'ALL', label: `Tất cả (${stats.total})` },
                    { id: 'PENDING_EVAL', label: `Chờ chấm (${stats.pending})` },
                    { id: 'EVALUATED', label: `Đã chấm (${stats.evaluated})` },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFilterTab(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        filterTab === tab.id
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Icon
                    name="search"
                    className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                  <input
                    type="text"
                    className="input-field !pl-9 text-xs"
                    placeholder="Tìm tên ứng viên, vị trí, dự án..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2.5 max-h-[calc(100vh-14rem)] overflow-y-auto pr-0.5">
                {filteredApps.length === 0 ? (
                  <div className="card text-center py-8 text-xs text-slate-400">
                    Không có ứng viên nào khớp bộ lọc.
                  </div>
                ) : (
                  filteredApps.map((app) => {
                    const isSelected = selectedApp?.id === app.id;
                    const cand = app.CandidateProfile?.User;
                    const job = app.ProjectJob;
                    const proj = job?.Project;
                    const stTime = app.interview_time ? new Date(app.interview_time) : null;
                    const evalMeta = app.interview_result
                      ? INTERVIEW_RESULT_META[app.interview_result]
                      : null;

                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setSelectedAppId(app.id)}
                        className={`w-full text-left rounded-2xl border p-3.5 transition-all ${
                          isSelected
                            ? 'bg-primary-50/80 border-primary-600 ring-2 ring-primary-200 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-primary-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Avatar
                              name={cand?.full_name || 'Ứng viên'}
                              src={app.CandidateProfile?.avatar_url}
                              size="sm"
                            />
                            <div className="min-w-0">
                              <p
                                className={`font-bold text-sm truncate ${
                                  isSelected ? 'text-primary-900' : 'text-slate-900'
                                }`}
                              >
                                {cand?.full_name || 'Ứng viên'}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {job?.title || 'Vị trí dự án'}
                              </p>
                            </div>
                          </div>

                          {evalMeta ? (
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${evalMeta.badgeCls}`}
                            >
                              {app.interview_score ? `${Number(app.interview_score).toFixed(1)}đ · ` : ''}
                              {evalMeta.shortLabel}
                            </span>
                          ) : (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 flex-shrink-0">
                              Chưa chấm
                            </span>
                          )}
                        </div>

                        {proj?.name && (
                          <p className="text-[11px] text-slate-500 mt-1.5 truncate">
                            Dự án: <strong className="text-slate-700">{proj.name}</strong>
                          </p>
                        )}

                        {stTime && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                            <span className="text-sky-800 font-semibold inline-flex items-center gap-1">
                              <Icon name="calendar" className="w-3.5 h-3.5 text-sky-600" />
                              {stTime.toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              ({app.interview_duration || 30}p)
                            </span>
                            {app.interview_response === 'CONFIRMED' && (
                              <span className="text-emerald-700 font-semibold">✓ UV đã xác nhận</span>
                            )}
                            {app.interview_response === 'RESCHEDULE_REQUESTED' && (
                              <span className="text-amber-700 font-semibold">⚠ UV xin dời lịch</span>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            {/* ─── CỘT PHẢI: Chi tiết ứng viên & Biểu mẫu chấm điểm phỏng vấn ─── */}
            {selectedApp && (() => {
              const profile = selectedApp.CandidateProfile;
              const user = profile?.User;
              const job = selectedApp.ProjectJob;
              const proj = job?.Project;
              const cvUrl = selectedApp.cv_url || profile?.cv_url;
              const stTime = selectedApp.interview_time ? new Date(selectedApp.interview_time) : null;
              const dur = selectedApp.interview_duration || 30;
              const etTime = stTime ? new Date(stTime.getTime() + dur * 60000) : null;
              const appStatusMeta =
                PROJECT_APPLICATION_STATUS[selectedApp.status] || PROJECT_APPLICATION_STATUS.PENDING;
              const gradeMeta = getScoreGrade(avgScore);

              return (
                <div className="lg:col-span-8 space-y-6 min-w-0">
                  {/* Phần 1: Thông tin ứng viên & Ca phỏng vấn */}
                  <section className="card !p-6 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-100">
                      <div className="flex items-start gap-4 min-w-0">
                        <Avatar
                          name={user?.full_name || 'Ứng viên'}
                          src={profile?.avatar_url}
                          size="xl"
                          className="flex-shrink-0"
                        />
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-extrabold text-slate-900">
                              {user?.full_name || 'Ứng viên'}
                            </h2>
                            <span
                              className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${appStatusMeta.cls}`}
                            >
                              {appStatusMeta.label}
                            </span>
                          </div>
                          {profile?.professional_title && (
                            <p className="text-sm font-semibold text-primary-700">
                              {profile.professional_title}
                            </p>
                          )}
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
                                className="inline-flex items-center gap-1 text-primary-700 font-medium hover:underline"
                              >
                                <Icon name="code" className="w-3.5 h-3.5" />
                                GitHub ↗
                              </a>
                            )}
                            {profile?.portfolio_url && (
                              <a
                                href={profile.portfolio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary-700 font-medium hover:underline"
                              >
                                <Icon name="globe" className="w-3.5 h-3.5" />
                                Portfolio ↗
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                        {cvUrl ? (
                          <a
                            href={cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-xs !py-2 !px-3.5 inline-flex items-center gap-1.5"
                          >
                            <Icon name="document" className="w-4 h-4" />
                            Xem CV ứng viên ↗
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 italic px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                            Không có CV đính kèm
                          </span>
                        )}
                        {selectedApp.meet_url && (
                          <a
                            href={selectedApp.meet_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary text-xs !py-2 !px-3.5 inline-flex items-center gap-1.5"
                          >
                            <Icon name="video" className="w-4 h-4" />
                            Vào Google Meet ↗
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Khung thông tin ca phỏng vấn & Vị trí dự án */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-sky-50/70 border border-sky-200 rounded-xl p-4 text-xs">
                      <div className="space-y-1">
                        <p className="text-slate-500 font-medium">Vị trí & Dự án ứng tuyển:</p>
                        <p className="text-sm font-bold text-slate-900">{job?.title}</p>
                        <p className="text-slate-700">
                          Dự án: <strong>{proj?.name || '—'}</strong> · Thù lao:{' '}
                          <strong className="text-emerald-700">{formatMoney(job?.budget)}</strong>
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-500 font-medium">Thời gian phỏng vấn:</p>
                        {stTime ? (
                          <p className="text-sm font-bold text-sky-900">
                            {stTime.toLocaleDateString('vi-VN', {
                              weekday: 'long',
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}{' '}
                            ·{' '}
                            {stTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} –{' '}
                            {etTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ({dur} phút)
                          </p>
                        ) : (
                          <p className="text-slate-500">Chưa đặt giờ</p>
                        )}
                        <p className="text-slate-600">
                          Phản hồi của ứng viên:{' '}
                          {selectedApp.interview_response === 'CONFIRMED' ? (
                            <strong className="text-emerald-700">✓ Đã xác nhận tham gia</strong>
                          ) : selectedApp.interview_response === 'RESCHEDULE_REQUESTED' ? (
                            <strong className="text-amber-700">
                              ⚠ Xin dời lịch ({selectedApp.candidate_reschedule_note})
                            </strong>
                          ) : (
                            <span>Chờ ứng viên xác nhận</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Kỹ năng, Giới thiệu, Kinh nghiệm & Thư ứng tuyển */}
                    {profile?.Skills?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          Kỹ năng chuyên môn của ứng viên
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {profile.Skills.map((s) => (
                            <SkillTag key={s.id} name={s.name} />
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedApp.cover_letter && (
                      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs">
                        <p className="font-bold text-slate-600 mb-1">Thư giới thiệu / Ứng tuyển:</p>
                        <p className="text-slate-700 whitespace-pre-line italic leading-relaxed">
                          “{selectedApp.cover_letter}”
                        </p>
                      </div>
                    )}

                    {profile?.Experiences?.length > 0 && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Kinh nghiệm làm việc ({profile.Experiences.length})
                        </p>
                        <div className="space-y-2">
                          {profile.Experiences.map((exp) => (
                            <div
                              key={exp.id}
                              className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-bold text-slate-900">
                                  {exp.job_title} — <span className="text-primary-700">{exp.company_name}</span>
                                </span>
                                <span className="text-slate-500">
                                  {exp.start_date ? formatDate(exp.start_date) : ''} →{' '}
                                  {exp.end_date ? formatDate(exp.end_date) : 'Hiện tại'}
                                </span>
                              </div>
                              {exp.description && (
                                <p className="text-slate-600 whitespace-pre-line">{exp.description}</p>
                              )}
                              {Array.isArray(exp.technologies) && exp.technologies.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-0.5">
                                  {exp.technologies.map((tech, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] text-slate-600"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Xem mô tả & yêu cầu của vị trí tuyển dụng */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowJobDetails((v) => !v)}
                        className="text-xs font-semibold text-primary-700 hover:text-primary-800 inline-flex items-center gap-1"
                      >
                        <Icon
                          name="chevronDown"
                          className={`w-4 h-4 transition-transform ${showJobDetails ? 'rotate-180' : ''}`}
                        />
                        {showJobDetails
                          ? 'Thu gọn mô tả & yêu cầu của vị trí tuyển dụng'
                          : 'Xem mô tả công việc & yêu cầu của vị trí tuyển dụng'}
                      </button>

                      {showJobDetails && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-xs animate-fade-in">
                          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                            <p className="font-bold uppercase text-slate-500 mb-1">Mô tả công việc</p>
                            <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                              {job?.description || 'Chưa cập nhật.'}
                            </p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
                            <p className="font-bold uppercase text-slate-500 mb-1">
                              Yêu cầu ứng viên ({EXPERIENCE_LABELS[job?.experience] || 'Không yêu cầu'})
                            </p>
                            <p className="text-slate-700 whitespace-pre-line leading-relaxed">
                              {job?.requirements || 'Chưa cập nhật.'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Phần 2: Phiếu Chấm điểm 5 Tiêu chí chuẩn & Điền kết quả phỏng vấn */}
                  <form onSubmit={handleSubmitEvaluation} className="card !p-6 space-y-6 border-primary-200">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                          <Icon name="star" className="w-5 h-5 text-amber-500" />
                          Phiếu Đánh giá & Kết quả Phỏng vấn
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Chấm điểm theo 5 tiêu chí chuẩn (thang 1–10) và chọn kết luận sau buổi phỏng vấn
                        </p>
                      </div>

                      <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Điểm trung bình
                          </p>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-extrabold text-primary-700">
                              {avgScore.toFixed(1)}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">/10</span>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold border ${gradeMeta.cls}`}
                        >
                          {gradeMeta.label}
                        </span>
                      </div>
                    </div>

                    {/* 5 tiêu chí chấm điểm */}
                    <div className="space-y-4">
                      {criteriaList.map((crit, idx) => {
                        const val = Number(scores[crit.key]) || 7;
                        return (
                          <div
                            key={crit.key}
                            className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 space-y-2.5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-bold text-slate-900">
                                  {idx + 1}. {crit.label}
                                </p>
                                <p className="text-xs text-slate-500">{crit.desc}</p>
                              </div>
                              <span className="px-3 py-1 rounded-xl bg-white border border-primary-200 text-sm font-extrabold text-primary-700 shadow-sm">
                                {val}/10 điểm
                              </span>
                            </div>

                            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                                const active = val === num;
                                return (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() =>
                                      setScores((prev) => ({ ...prev, [crit.key]: num }))
                                    }
                                    className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                      active
                                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm ring-2 ring-primary-200'
                                        : num >= 8
                                        ? 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                                        : num >= 5
                                        ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                        : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50'
                                    }`}
                                  >
                                    {num}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Chọn Kết luận phỏng vấn */}
                    <div className="space-y-2.5">
                      <label className="block text-sm font-bold text-slate-800">
                        Kết luận sau phỏng vấn <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setResult('PASS')}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            result === 'PASS'
                              ? 'border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-200 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-extrabold text-sm text-emerald-800">
                              ✓ Đạt (Tuyển vào dự án)
                            </span>
                            {result === 'PASS' && (
                              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Hệ thống tự động duyệt ứng viên vào Workspace dự án và gửi email trúng tuyển.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setResult('CONSIDER')}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            result === 'CONSIDER'
                              ? 'border-amber-500 bg-amber-50/90 ring-2 ring-amber-200 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50/30'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-extrabold text-sm text-amber-800">
                              ⏳ Cân nhắc thêm
                            </span>
                            {result === 'CONSIDER' && (
                              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Lưu bảng điểm và nhận xét chi tiết để cân nhắc và quyết định sau.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setResult('REJECT')}
                          disabled={selectedApp.status === 'ACCEPTED'}
                          className={`p-4 rounded-xl border-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            result === 'REJECT'
                              ? 'border-rose-600 bg-rose-50/90 ring-2 ring-rose-200 shadow-sm'
                              : 'border-slate-200 bg-white hover:border-rose-300 hover:bg-rose-50/30'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-extrabold text-sm text-rose-800">
                              ✕ Không đạt (Từ chối)
                            </span>
                            {result === 'REJECT' && (
                              <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            Hệ thống tự động từ chối hồ sơ và gửi email thông báo kết quả cho ứng viên.
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Nhận xét chi tiết */}
                    <div>
                      <label className="block text-sm font-bold text-slate-800 mb-1.5">
                        Nhận xét chi tiết của người phỏng vấn
                      </label>
                      <textarea
                        rows={4}
                        className="input-field resize-none text-sm"
                        placeholder="Đánh giá điểm mạnh, điểm cần cải thiện, khả năng đáp ứng tiến độ dự án của ứng viên..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                      <div className="text-xs text-slate-500">
                        {selectedApp.interview_evaluated_at ? (
                          <span>
                            Đã chấm lần cuối lúc:{' '}
                            <strong>
                              {new Date(selectedApp.interview_evaluated_at).toLocaleString('vi-VN')}
                            </strong>
                          </span>
                        ) : (
                          <span>Chưa gửi kết quả đánh giá cho ứng viên này.</span>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={evaluateMutation.isPending || !result}
                        className="btn-primary px-6 py-2.5 text-sm font-bold inline-flex items-center gap-2 disabled:opacity-50"
                      >
                        <Icon name="check" className="w-4 h-4" strokeWidth={2.5} />
                        {evaluateMutation.isPending
                          ? 'Đang lưu kết quả...'
                          : selectedApp.interview_result
                          ? 'Cập nhật Kết quả Phỏng vấn'
                          : 'Hoàn tất & Gửi Kết quả Phỏng vấn'}
                      </button>
                    </div>
                  </form>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
