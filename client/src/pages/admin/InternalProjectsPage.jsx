import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { workspaceApi } from '@/api/workspaceApi';
import { projectJobApi } from '@/api/projectJobApi';
import { skillApi } from '@/api/skillApi';
import { adminApi } from '@/api/adminApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import Icon from '@/components/common/Icon';
import Avatar from '@/components/common/Avatar';
import MoneyInput from '@/components/common/MoneyInput';
import { RankBadge } from '@/components/candidate/RankBadge';
import { VerifiedSkillTag, SkillTag } from '@/components/common/Badges';
import ExperienceTimeline from '@/components/candidate/ExperienceTimeline';
import { useConfirm } from '@/components/common/ConfirmDialog';
import useEscapeKey from '@/hooks/useEscapeKey';
import PageBanner from '@/components/common/PageBanner';
import { EXPERIENCE_LABELS, deadlineInfo, formatDate } from '@/utils/jobMeta';
import { formatFileSize } from '@/utils/fileHelper';

const EMPTY_JOB_FORM = {
  title: '', description: '', requirements: '', benefits: '', budget: '', quantity: 1,
  deadline: '', experience: '', skill_ids: [],
};

// Chuẩn hóa dữ liệu form gửi lên server (hạn nộp tính đến hết ngày được chọn)
const buildJobPayload = (form) => ({
  ...form,
  budget: parseFloat(form.budget) || 0,
  quantity: parseInt(form.quantity) || 1,
  deadline: form.deadline ? new Date(`${form.deadline}T23:59:59`).toISOString() : null,
});

const formatCurrency = (amount) => {
  if (!amount) return '0đ';
  return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
};

const STATUS_LABELS = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700' },
  REVIEWING: { label: 'Đang xét duyệt', color: 'bg-primary-100 text-primary-700' },
  INTERVIEW: { label: 'Mời phỏng vấn', color: 'bg-sky-100 text-sky-700' },
  ACCEPTED: { label: 'Trúng tuyển', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-700' },
};

const PROJECT_STATUS_META = {
  PLANNING:    { label: 'Lập kế hoạch', color: 'bg-gray-100 text-gray-700' },
  RECRUITING:  { label: 'Đang tuyển dụng', color: 'bg-primary-100 text-primary-700' },
  IN_PROGRESS: { label: 'Đang triển khai', color: 'bg-amber-100 text-amber-700' },
  COMPLETED:   { label: 'Đã nghiệm thu', color: 'bg-emerald-100 text-emerald-700' },
  CANCELLED:   { label: 'Đã hủy', color: 'bg-red-100 text-red-700' },
};

const MEMBER_STATUS_LABELS = {
  ACTIVE: 'Đang tham gia',
  COMPLETED: 'Đã hoàn thành',
  REMOVED: 'Đã rời dự án',
};

// ─── Candidate Detail Panel ─────────────────────────────────────────────────
function CandidateDetailPanel({ app, onClose }) {
  useEscapeKey(onClose);
  const profile = app.CandidateProfile;
  const user = profile?.User;

  const { data: detailRes, isLoading: detailLoading } = useQuery({
    queryKey: ['admin-candidate', profile?.id],
    queryFn: () => adminApi.getCandidateProfile(profile.id),
    enabled: !!profile?.id,
  });
  const c = detailRes?.data?.data;

  const fullName = c?.full_name || user?.full_name || 'Ứng viên';
  const email = c?.email || user?.email;
  const phone = c?.phone || profile?.phone;
  const address = c?.address || profile?.address;
  const title = c?.professional_title || profile?.professional_title || 'Chưa cập nhật chức danh';
  const avatarUrl = c?.avatar_url || profile?.avatar_url;
  const introduction = c?.introduction || profile?.introduction;
  const githubUrl = c?.github_url || profile?.github_url;
  const portfolioUrl = c?.portfolio_url || profile?.portfolio_url;
  const competencyScore = c?.competency_score ?? profile?.competency_score;
  const rank = c?.rank;

  const skills = c?.skills || profile?.Skills || [];
  const projects = c?.projects || [];
  const fallbackMembers = profile?.WorkspaceMembers || [];
  const scoredMembers = fallbackMembers.filter(m => m.CandidateEvaluation);
  const avgScore = c?.summary?.avg_evaluation_score ?? (
    scoredMembers.length > 0
      ? (scoredMembers.reduce((s, m) => s + parseFloat(m.CandidateEvaluation.score), 0) / scoredMembers.length).toFixed(1)
      : null
  );
  const projectCount = c?.summary?.total_projects ?? fallbackMembers.length;
  const cvs = c?.cvs || [];
  const experiences = c?.experiences || [];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl max-h-[92vh] flex flex-col animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="bg-brand-gradient text-white p-5 sm:p-6 flex items-start justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4 min-w-0">
            <Avatar name={fullName} src={avatarUrl} size="lg" className="ring-2 ring-white/40 flex-shrink-0" zoomable />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-extrabold tracking-tight">{fullName}</h3>
                {rank && <RankBadge rank={rank} onDark className="!text-xs" />}
              </div>
              <p className="text-sm text-white/90 font-medium mt-0.5">{title}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/85 mt-1.5">
                {email && <span className="inline-flex items-center gap-1"><Icon name="mail" className="w-3.5 h-3.5" />{email}</span>}
                {phone && <span className="inline-flex items-center gap-1"><Icon name="phone" className="w-3.5 h-3.5" />{phone}</span>}
                {address && <span className="inline-flex items-center gap-1"><Icon name="mapPin" className="w-3.5 h-3.5" />{address}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {profile?.id && (
              <Link
                to={`/admin/candidates/${profile.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/30 text-white text-xs font-semibold transition-colors"
                title="Mở trang hồ sơ đầy đủ trong tab mới"
              >
                <Icon name="external" className="w-3.5 h-3.5" />Trang hồ sơ
              </Link>
            )}
            <button onClick={onClose} aria-label="Đóng" className="text-white/80 hover:text-white p-1">
              <Icon name="x" className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Contact & Quick Links */}
          <div className="flex flex-wrap items-center gap-2">
            {app.cv_url && (
              <a href={app.cv_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-sm font-semibold border border-primary-200 transition-colors">
                <Icon name="document" className="w-4 h-4" />CV nộp kèm đơn ↗
              </a>
            )}
            {!app.cv_url && (c?.cv_url || profile?.cv_url) && (
              <a href={c?.cv_url || profile?.cv_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg text-sm font-semibold border border-primary-200 transition-colors">
                <Icon name="document" className="w-4 h-4" />Xem CV mặc định ↗
              </a>
            )}
            {email && (
              <a href={`mailto:${email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                <Icon name="mail" className="w-4 h-4" />Gửi Email
              </a>
            )}
            {phone && (
              <a href={`tel:${phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                <Icon name="phone" className="w-4 h-4" />Gọi: {phone}
              </a>
            )}
            {githubUrl && (
              <a href={githubUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                <Icon name="code" className="w-4 h-4" />GitHub ↗
              </a>
            )}
            {portfolioUrl && (
              <a href={portfolioUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                <Icon name="globe" className="w-4 h-4" />Portfolio ↗
              </a>
            )}
          </div>

          {/* Score & Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-primary-50 border border-primary-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-primary-700">{competencyScore ? parseFloat(competencyScore).toFixed(1) : '—'}</p>
              <p className="text-xs text-primary-600 mt-0.5">Điểm năng lực</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-amber-600">{avgScore ?? '—'}</p>
              <p className="text-xs text-amber-600 mt-0.5">Điểm đánh giá TB</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-emerald-700">{projectCount}</p>
              <p className="text-xs text-emerald-600 mt-0.5">Dự án DevHub</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
              <p className="text-2xl font-extrabold text-slate-800">
                {c?.summary ? `${c.summary.tasks_completed}/${c.summary.tasks_assigned}` : (rank?.points ?? '—')}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {c?.summary ? 'Task hoàn thành' : 'Điểm tích lũy'}
              </p>
            </div>
          </div>

          {/* Cover Letter */}
          {app.cover_letter && (
            <div className="bg-primary-50/40 border border-primary-100 rounded-xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary-700 mb-1.5 flex items-center gap-1.5">
                <Icon name="inbox" className="w-4 h-4" />Thư ứng tuyển cho vị trí này
              </h4>
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed italic">
                “{app.cover_letter}”
              </p>
            </div>
          )}

          {/* Interview info (if scheduled) */}
          {app.interview_time && (() => {
            const startD = new Date(app.interview_time);
            const dur = app.interview_duration || 30;
            const endD = new Date(startD.getTime() + dur * 60000);
            const resp = app.interview_response || 'PENDING';
            return (
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-sky-800 flex items-center gap-1.5">
                    <Icon name="calendar" className="w-4 h-4" />Lịch phỏng vấn đã đặt
                  </h4>
                  {resp === 'CONFIRMED' && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ✓ Ứng viên đã xác nhận tham gia
                    </span>
                  )}
                  {resp === 'RESCHEDULE_REQUESTED' && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                      ⚠ Ứng viên xin dời lịch
                    </span>
                  )}
                  {resp === 'PENDING' && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-sky-700 border border-sky-200">
                      ⏳ Chờ ứng viên xác nhận
                    </span>
                  )}
                </div>
                <p className="text-sm text-sky-900 font-medium">
                  {startD.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  {' · '}
                  <span className="font-bold text-primary-700">
                    {startD.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} – {endD.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {' '}({dur} phút)
                </p>
                {app.interviewer_name && (
                  <p className="text-xs text-sky-800">
                    Người phỏng vấn: <strong>{app.interviewer_name}</strong>
                  </p>
                )}
                {app.meet_url && (
                  <a href={app.meet_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-sky-700 hover:text-sky-900 font-medium underline">
                    <Icon name="video" className="w-4 h-4" />{app.meet_url}
                  </a>
                )}
                {app.interview_note && (
                  <p className="text-xs text-sky-700 italic">Ghi chú: {app.interview_note}</p>
                )}
                {resp === 'RESCHEDULE_REQUESTED' && app.candidate_reschedule_note && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900">
                    <strong>Lý do / Khung giờ ứng viên đề xuất:</strong> “{app.candidate_reschedule_note}”
                  </div>
                )}
              </div>
            );
          })()}

          {/* Introduction */}
          {introduction && (
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <Icon name="user" className="w-4 h-4 text-primary-700" />Giới thiệu bản thân
              </h4>
              <div className="bg-gray-50 rounded-xl p-3.5 text-sm text-gray-700 whitespace-pre-line leading-relaxed border border-gray-200">
                {introduction}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <Icon name="badge" className="w-4 h-4 text-primary-700" />Kỹ năng chuyên môn ({skills.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  skill.evidence ? (
                    <VerifiedSkillTag key={skill.id} name={skill.name} evidence={skill.evidence} />
                  ) : (
                    <SkillTag key={skill.id} name={skill.name} />
                  )
                ))}
              </div>
            </div>
          )}

          {detailLoading && (
            <div className="py-4 flex justify-center">
              <LoadingSpinner />
            </div>
          )}

          {/* CVs list */}
          {cvs.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <Icon name="document" className="w-4 h-4 text-primary-700" />Danh sách CV trong hồ sơ ({cvs.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {cvs.map(cv => (
                  <a
                    key={cv.id}
                    href={cv.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50/40 transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0">
                      <Icon name="document" className="w-4 h-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-gray-900 truncate">{cv.name}</span>
                      <span className="block text-[11px] text-gray-400 truncate">
                        {cv.file_name}{cv.file_size ? ` · ${formatFileSize(cv.file_size)}` : ''}
                      </span>
                    </span>
                    {cv.is_default && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 flex-shrink-0">
                        Mặc định
                      </span>
                    )}
                    <Icon name="external" className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Project History on DevHub */}
          {projects.length > 0 ? (
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <Icon name="folder" className="w-4 h-4 text-primary-700" />Dự án đã tham gia trên DevHub ({projects.length})
              </h4>
              <div className="space-y-2.5">
                {projects.map(p => {
                  const ev = p.evaluation;
                  const t = p.tasks || { total: 0, done: 0, on_time: 0 };
                  return (
                    <div key={p.member_id} className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900">
                            {p.project?.name || 'Dự án không tên'}
                          </p>
                          <p className="text-xs text-primary-700 font-medium">
                            {p.position || 'Thành viên dự án'}
                            {p.role === 'LEAD' && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 text-[10px] font-bold">Lead</span>}
                            <span className="text-gray-400 font-normal"> · {MEMBER_STATUS_LABELS[p.member_status] || p.member_status}</span>
                          </p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Tham gia: {p.joined_at ? formatDate(p.joined_at) : '—'}
                            {t.total > 0 && ` · Đã nghiệm thu ${t.done}/${t.total} task (${t.on_time} đúng hạn)`}
                          </p>
                        </div>
                        {ev ? (
                          <div className="text-right flex-shrink-0 bg-white border border-gray-200 rounded-lg px-2.5 py-1">
                            <span className="text-base font-extrabold text-primary-700">{parseFloat(ev.score).toFixed(1)}</span>
                            <span className="text-xs text-gray-400">/10</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic flex-shrink-0">Chưa đánh giá</span>
                        )}
                      </div>
                      {ev?.comment && (
                        <p className="text-xs text-gray-600 italic bg-white rounded-lg p-2 border border-gray-100">
                          “{ev.comment}”
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : fallbackMembers.length > 0 ? (
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <Icon name="folder" className="w-4 h-4 text-primary-700" />Lịch sử dự án trên DevHub ({fallbackMembers.length})
              </h4>
              <div className="space-y-2">
                {fallbackMembers.map(member => (
                  <div key={member.id} className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {member.Workspace?.Project?.name || 'Dự án không tên'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Tham gia: {member.joined_at ? new Date(member.joined_at).toLocaleDateString('vi-VN') : '—'} · Trạng thái: {MEMBER_STATUS_LABELS[member.status] || member.status}
                      </p>
                    </div>
                    {member.CandidateEvaluation ? (
                      <div className="text-right flex-shrink-0">
                        <span className="text-lg font-bold text-primary-700">{parseFloat(member.CandidateEvaluation.score).toFixed(1)}</span>
                        <span className="text-xs text-gray-400">/10</span>
                        {member.CandidateEvaluation.comment && (
                          <p className="text-xs text-gray-500 max-w-[160px] text-right line-clamp-1">{member.CandidateEvaluation.comment}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Chưa đánh giá</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Experience Timeline */}
          {(experiences.length > 0 || projects.length > 0) && (
            <div>
              <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                <Icon name="briefcase" className="w-4 h-4 text-primary-700" />Sơ đồ kinh nghiệm làm việc
              </h4>
              <ExperienceTimeline
                experiences={experiences}
                devhubProjects={projects}
                emptyHint="Ứng viên chưa khai báo kinh nghiệm làm việc."
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t bg-gray-50 flex items-center justify-between gap-3">
          {profile?.id ? (
            <Link
              to={`/admin/candidates/${profile.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-primary-700 hover:text-primary-800 inline-flex items-center gap-1.5"
            >
              <Icon name="external" className="w-4 h-4" />Mở trang hồ sơ năng lực đầy đủ
            </Link>
          ) : <span />}
          <button type="button" onClick={onClose} className="btn-secondary text-sm">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Manage Interviewers Modal (Tạo & Quản lý danh sách Người phỏng vấn) ─────
function ManageInterviewersModal({ onClose }) {
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

function ScheduleInterviewModal({ app, onClose, onSuccess, onManageInterviewers }) {
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

  // Người phỏng vấn đang được lựa chọn (nếu chưa chọn thì mặc định chọn người đầu tiên trong danh sách)
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

  // Các lịch phỏng vấn khác trong cùng ngày đang chọn
  const sameDayInterviews = allInterviews.filter((item) => {
    if (item.id === app.id || item.status !== 'INTERVIEW' || !item.interview_time) return false;
    return toLocalDateInput(item.interview_time) === form.interview_date;
  });

  // Kiểm tra xem một lịch phỏng vấn có thuộc về một người phỏng vấn cụ thể hay không
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

  // Kiểm tra xung đột cho một giờ bắt đầu (HH:mm) với thời lượng hiện tại
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
          {/* Cảnh báo nếu ứng viên xin dời lịch */}
          {app.interview_response === 'RESCHEDULE_REQUESTED' && app.candidate_reschedule_note && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-sm text-amber-900">
              <p className="font-bold flex items-center gap-1.5 text-amber-800 mb-1">
                <Icon name="clock" className="w-4 h-4" />
                Ứng viên xin đổi lịch phỏng vấn:
              </p>
              <p className="italic">“{app.candidate_reschedule_note}”</p>
            </div>
          )}

          {/* Bước 1: Lựa chọn Người phỏng vấn từ danh sách đã tạo */}
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

            {/* Form tạo nhanh người phỏng vấn mới ngay trong modal */}
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

            {/* Danh sách thẻ lựa chọn Người phỏng vấn đã tạo */}
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
                        <div className={`text-[10px] truncate ${isSelected ? 'text-white/90' : ' opacity-75'}`}>
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

            {/* Danh sách các ca phỏng vấn đã đặt trong ngày */}
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

          {/* Cảnh báo xung đột trực tiếp nếu chọn giờ bị trùng */}
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

          {/* Preview */}
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

// ─── Main Component ──────────────────────────────────────────────────────────
export default function InternalProjectsPage() {
  const confirm = useConfirm();
  const qc = useQueryClient();
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', expected_end_date: '' });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table' | 'kanban'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Add Job Modal State
  const [activeProjectForJob, setActiveProjectForJob] = useState(null);
  const [jobForm, setJobForm] = useState(EMPTY_JOB_FORM);
  const [editingJob, setEditingJob] = useState(null); // vị trí đang sửa (null = đang thêm mới)

  // View Applications Modal State
  const [viewJobsProject, setViewJobsProject] = useState(null);

  // Candidate detail & interview
  const [detailApp, setDetailApp] = useState(null);
  const [interviewApp, setInterviewApp] = useState(null);
  const [showManageInterviewers, setShowManageInterviewers] = useState(false);

  const closeJobModal = () => { setActiveProjectForJob(null); setEditingJob(null); setJobForm(EMPTY_JOB_FORM); };
  useEscapeKey(closeJobModal, !!activeProjectForJob);
  useEscapeKey(() => setViewJobsProject(null), !!viewJobsProject);

  const { data: projectsRes, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => workspaceApi.getProjects(),
    staleTime: 0, // tiến độ dự án thay đổi khi Task được cập nhật trong Workspace
  });

  const { data: skillsRes } = useQuery({
    queryKey: ['public-skills'],
    queryFn: () => skillApi.getPublicSkills(),
  });

  const { data: projectJobsRes, isLoading: jobsLoading } = useQuery({
    queryKey: ['admin-project-jobs', viewJobsProject?.id],
    queryFn: () => projectJobApi.getAdminProjectJobs(viewJobsProject.id),
    enabled: !!viewJobsProject,
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

  // Đóng dự án: nghiệm thu + tự tạo các khoản thù lao rồi chuyển sang trang thanh toán của đúng dự án này
  const navigate = useNavigate();
  const closeProjectMutation = useMutation({
    mutationFn: ({ id, force }) => workspaceApi.closeProject(id, { force }),
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      qc.invalidateQueries({ queryKey: ['admin-payments'] });
      qc.invalidateQueries({ queryKey: ['admin-payable-members'] });
      qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
      const n = res.data?.auto_created_payments || 0;
      toast.success(n > 0 ? `Đã đóng dự án và tạo ${n} khoản thanh toán thù lao` : 'Đã đóng dự án');
      // Đóng dự án xong thì mở trang chấm điểm năng lực cho từng thành viên, rồi mới sang trang thanh toán
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
      if (vars.status === 'COMPLETED') navigate(`/admin/projects/${vars.id}/evaluations`); // nghiệm thu xong thì chấm điểm năng lực cho thành viên
      const createdCount = res.data?.auto_created_payments || 0;
      if (createdCount > 0) {
        toast.success(`Đã nghiệm thu dự án và tự động tạo ${createdCount} khoản thanh toán thù lao!`);
      } else {
        toast.success('Đã cập nhật trạng thái dự án!');
      }
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái dự án'),
  });

  // Create Project Job
  const createJobMutation = useMutation({
    mutationFn: ({ projectId, data }) => projectJobApi.createAdminProjectJob(projectId, buildJobPayload(data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      if (viewJobsProject) qc.invalidateQueries({ queryKey: ['admin-project-jobs', viewJobsProject.id] });
      closeJobModal();
      toast.success('Đã thêm vị trí công việc vào dự án!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi thêm vị trí'),
  });

  // Sửa vị trí (gia hạn, đóng/mở lại, cập nhật nội dung)
  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }) => projectJobApi.updateAdminProjectJob(id, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      qc.invalidateQueries({ queryKey: ['project-jobs'] });
      if (viewJobsProject) qc.invalidateQueries({ queryKey: ['admin-project-jobs', viewJobsProject.id] });
      closeJobModal();
      toast.success(res.data?.message || 'Đã cập nhật vị trí');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi cập nhật vị trí'),
  });

  const openEditJob = (project, job) => {
    setEditingJob(job);
    setActiveProjectForJob(project);
    setJobForm({
      title: job.title || '',
      description: job.description || '',
      requirements: job.requirements || '',
      benefits: job.benefits || '',
      budget: job.budget ? String(parseFloat(job.budget)) : '',
      quantity: job.quantity || 1,
      deadline: job.deadline ? job.deadline.slice(0, 10) : '',
      experience: job.experience || '',
      skill_ids: job.Skills?.map((sk) => sk.id) || [],
    });
  };

  const submitJob = () => {
    if (editingJob) {
      const payload = buildJobPayload(jobForm);
      // Không đổi ngày hạn thì giữ nguyên giá trị cũ (để vẫn lưu được các thay đổi khác trên vị trí đã hết hạn)
      if (editingJob.deadline && editingJob.deadline.slice(0, 10) === jobForm.deadline) payload.deadline = editingJob.deadline;
      updateJobMutation.mutate({ id: editingJob.id, data: payload });
    }
    else createJobMutation.mutate({ projectId: activeProjectForJob.id, data: jobForm });
  };

  const toggleJobStatus = async (job) => {
    const closing = job.status === 'OPEN';
    const ok = await confirm({
      title: closing ? 'Đóng vị trí tuyển dụng' : 'Mở lại vị trí tuyển dụng',
      message: closing ? 'Ứng viên sẽ không thể nộp thêm hồ sơ vào vị trí này.' : 'Vị trí sẽ hiển thị lại cho ứng viên (nhớ gia hạn nếu đã quá hạn nộp).',
      confirmText: closing ? 'Đóng vị trí' : 'Mở lại',
      tone: closing ? 'danger' : 'primary',
    });
    if (ok) updateJobMutation.mutate({ id: job.id, data: { status: closing ? 'CLOSED' : 'OPEN' } });
  };

  // Review Application (status update)
  const reviewAppMutation = useMutation({
    mutationFn: ({ appId, status }) => projectJobApi.updateProjectApplicationStatus(appId, { status }),
    onSuccess: (res) => {
      if (viewJobsProject) qc.invalidateQueries({ queryKey: ['admin-project-jobs', viewJobsProject.id] });
      qc.invalidateQueries({ queryKey: ['admin-projects'] });
      toast.success(res.data?.message || 'Đã cập nhật hồ sơ');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi duyệt hồ sơ'),
  });

  const projects = projectsRes?.data?.data || [];
  const skills = skillsRes?.data?.data || [];
  const projectJobs = projectJobsRes?.data?.data || [];

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
    if (await confirm({ title: 'Xóa dự án', message: `Bạn có chắc chắn muốn xóa dự án "${project.name}" không?`, confirmText: 'Xóa dự án', tone: 'danger' })) {
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
      <PageBanner compact icon="folder" title="Quản lý dự án thời vụ & vị trí tuyển dụng" subtitle="Quản lý các dự án nội bộ và vị trí tuyển dụng thời vụ">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowManageInterviewers(true)}
            className="btn-light flex items-center gap-1.5"
          >
            <Icon name="users" className="w-4 h-4" />
            Quản lý người phỏng vấn
          </button>
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
                    <th className="p-3.5">Vị trí tuyển</th>
                    <th className="p-3.5">Nhân sự & Thanh toán</th>
                    <th className="p-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProjects.map((project) => {
                    const pStatus = PROJECT_STATUS_META[project.status] || { label: project.status, color: 'bg-primary-100 text-primary-700' };
                    const ps = project.payment_summary || {};
                    return (
                      <tr key={project.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="p-3.5 max-w-xs">
                          <p className="font-bold text-gray-900 truncate" title={project.name}>{project.name}</p>
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
                          <button
                            type="button"
                            onClick={() => setViewJobsProject(project)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-50 hover:bg-primary-100 text-primary-700 text-xs font-semibold transition-colors"
                          >
                            <Icon name="briefcase" className="w-3.5 h-3.5" />
                            {project.ProjectJobs?.length || 0} vị trí
                          </button>
                        </td>
                        <td className="p-3.5 whitespace-nowrap text-xs">
                          <div className="text-gray-700 font-medium">
                            {ps.members || 0} thành viên
                            {ps.open_tasks > 0 && <span className="text-amber-600"> · {ps.open_tasks} task mở</span>}
                          </div>
                          {ps.total_amount > 0 && (
                            <div className="text-[11px] text-emerald-700 mt-0.5">
                              Đã trả {ps.paid || 0}/{ps.members || 0} ({formatCurrency(ps.paid_amount)})
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
                            <button
                              type="button"
                              onClick={() => setActiveProjectForJob(project)}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium"
                              title="Thêm vị trí tuyển dụng"
                            >
                              + Vị trí
                            </button>
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
                      return (
                        <div
                          key={project.id}
                          className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm hover:shadow-md transition-shadow space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-sm text-gray-900 leading-snug">{project.name}</h4>
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
                              <strong>{project.ProjectJobs?.length || 0} vị trí</strong>
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
                            <button
                              type="button"
                              onClick={() => setViewJobsProject(project)}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium"
                            >
                              Vị trí & UV ({project.ProjectJobs?.length || 0})
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveProjectForJob(project)}
                              className="px-2 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded text-xs font-medium"
                            >
                              + Vị trí
                            </button>
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
          return (
          <div key={project.id} className="card hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2 gap-2">
                <h3 className="font-bold text-lg text-gray-900">{project.name}</h3>
                <div className="flex gap-2 items-center flex-shrink-0">
                  <select
                    value={project.status}
                    disabled={updateProjectStatusMutation.isPending}
                    onChange={async (e) => {
                      const nextStatus = e.target.value;
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
                    }}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-400 ${pStatus.color}`}
                  >
                    {Object.entries(PROJECT_STATUS_META).filter(([k]) => k !== 'COMPLETED' || project.status === 'COMPLETED').map(([k, v]) => (
                      <option key={k} value={k} className="bg-white text-gray-800 font-normal">
                        {v.label}
                      </option>
                    ))}
                  </select>
                  <button 
                    onClick={async () => {
                      if (await confirm({ title: 'Xóa dự án', message: `Bạn có chắc chắn muốn xóa dự án "${project.name}" không?`, confirmText: 'Xóa dự án', tone: 'danger' })) {
                        deleteProjectMutation.mutate(project.id);
                      }
                    }}
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

              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1 text-gray-600 mb-4 border border-gray-100">
                <p><Icon name="users" className="w-4 h-4 mr-1" /><strong>Vị trí tuyển dụng:</strong> {project.ProjectJobs?.length || 0} vị trí</p>
              </div>

              {/* Tình hình thanh toán thù lao của dự án: bao nhiêu thành viên đã được trả */}
              {(project.status === 'COMPLETED' || (project.payment_summary?.members > 0 && project.payment_summary.total_amount > 0)) && (() => {
                const ps = project.payment_summary;
                const pct = ps.members ? Math.round((ps.paid / ps.members) * 100) : 0;
                return (
                  <div className="mb-4 rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-emerald-800 inline-flex items-center gap-1"><Icon name="card" className="w-3.5 h-3.5" />Thanh toán thù lao</span>
                      <span className="font-bold text-emerald-700">{ps.paid}/{ps.members} thành viên đã nhận</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-emerald-100 overflow-hidden"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} /></div>
                    <p className="mt-1.5 text-[11px] text-slate-600">
                      Đã trả {formatCurrency(ps.paid_amount)} / {formatCurrency(ps.total_amount)}
                      {(ps.pending > 0 || ps.failed > 0) && <> · {(ps.pending || 0) + (ps.failed || 0)} chưa thanh toán</>}
                      {ps.none > 0 && <> · {ps.none} chưa có khoản</>}
                    </p>
                  </div>
                );
              })()}

              {/* Tình hình chấm điểm năng lực: nhắc Admin chấm điểm các thành viên sau khi đóng dự án */}
              {project.status === 'COMPLETED' && project.evaluation_summary?.members > 0 && (() => {
                const es = project.evaluation_summary;
                const left = es.members - es.evaluated;
                return (
                  <div className={`mb-4 rounded-lg border p-3 ${left > 0 ? 'border-amber-200 bg-amber-50/60' : 'border-emerald-100 bg-emerald-50/50'}`}>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className={`font-semibold inline-flex items-center gap-1 ${left > 0 ? 'text-amber-800' : 'text-emerald-800'}`}><Icon name="star" className="w-3.5 h-3.5" />Chấm điểm năng lực</span>
                      <span className={`font-bold ${left > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>{es.evaluated}/{es.members} thành viên đã chấm</span>
                    </div>
                    {left > 0 && <p className="mt-1 text-[11px] text-slate-600">Còn {left} thành viên chưa được chấm điểm.</p>}
                  </div>
                );
              })()}
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setViewJobsProject(project)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium"
                >
                  Xem vị trí & Ứng viên ({project.ProjectJobs?.length || 0})
                </button>
                <button
                  onClick={() => setActiveProjectForJob(project)}
                  className="px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded text-xs font-medium"
                >
                  + Thêm Vị Trí
                </button>
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

      {/* Modal Thêm / Sửa Vị Trí (ProjectJob) */}
      {activeProjectForJob && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-[60] p-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-xl animate-fade-in">
            <h2 className="text-xl font-bold mb-1">{editingJob ? 'Sửa vị trí tuyển dụng' : 'Thêm vị trí tuyển dụng'}</h2>
            <p className="text-xs text-primary-700 font-medium mb-4">Dự án: {activeProjectForJob.name} · Làm việc từ xa</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên vị trí công việc <span className="text-red-500">*</span></label>
                <input
                  className="input-field"
                  placeholder="VD: Frontend React Developer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thù lao vị trí (VNĐ) <span className="text-red-500">*</span></label>
                  <MoneyInput
                    required
                    className="input-field"
                    placeholder="10.000.000"
                    value={jobForm.budget}
                    onChange={(v) => setJobForm({ ...jobForm, budget: v })}
                    aria-invalid={Number(jobForm.budget) > 0 && Number(jobForm.budget) < 1000}
                  />
                  {Number(jobForm.budget) > 0 && Number(jobForm.budget) < 1000
                    ? <p role="alert" className="mt-1 text-xs font-semibold text-red-600">Thù lao tối thiểu 1.000đ.</p>
                    : <p className="mt-1 text-xs text-gray-500">Thù lao cho mỗi người nhận vị trí này, hiển thị cho ứng viên khi ứng tuyển.</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng tuyển</label>
                  <input
                    type="number"
                    min="1"
                    className="input-field"
                    value={jobForm.quantity}
                    onChange={(e) => setJobForm({ ...jobForm, quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hạn nộp hồ sơ</label>
                  <input
                    type="date"
                    className="input-field"
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kinh nghiệm</label>
                  <select
                    className="input-field"
                    value={jobForm.experience}
                    onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                  >
                    <option value="">-- Chọn yêu cầu kinh nghiệm --</option>
                    {Object.entries(EXPERIENCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả công việc</label>
                <textarea
                  className="input-field resize-none"
                  rows={4}
                  placeholder={'Các đầu việc chính của vị trí...'}
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yêu cầu ứng viên</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder={'Ví dụ:\n- Thành thạo React, Tailwind CSS\n- Biết dùng Git'}
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quyền lợi được hưởng</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder={'Ví dụ:\n- Thanh toán thù lao ngay khi nghiệm thu\n- Được đánh giá năng lực, cộng điểm hồ sơ'}
                  value={jobForm.benefits}
                  onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kỹ năng yêu cầu</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                  {skills.map(skill => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => {
                        const ids = jobForm.skill_ids.includes(skill.id)
                          ? jobForm.skill_ids.filter(id => id !== skill.id)
                          : [...jobForm.skill_ids, skill.id];
                        setJobForm({ ...jobForm, skill_ids: ids });
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        jobForm.skill_ids.includes(skill.id)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={closeJobModal} className="btn-secondary">
                Hủy
              </button>
              <button
                type="button"
                onClick={submitJob}
                disabled={!jobForm.title || !(Number(jobForm.budget) >= 1000) || createJobMutation.isPending || updateJobMutation.isPending}
                className="btn-primary"
              >
                {(createJobMutation.isPending || updateJobMutation.isPending) ? 'Đang lưu...' : editingJob ? 'Lưu thay đổi' : 'Tạo vị trí tuyển dụng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem Vị Trí & Hồ Sơ Ứng Tuyển */}
      {viewJobsProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-xl max-h-[90vh] flex flex-col animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <div>
                <h2 className="text-xl font-bold">Vị trí & Ứng viên Dự án</h2>
                <p className="text-xs text-primary-700">{viewJobsProject.name}</p>
              </div>
              <button
                onClick={() => setViewJobsProject(null)}
                className="text-gray-400 hover:text-gray-600" aria-label="Đóng"
              >
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {jobsLoading ? (
                <LoadingSpinner />
              ) : projectJobs.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  Dự án này chưa có vị trí công việc nào. Hãy thêm vị trí để ứng viên ứng tuyển.
                </div>
              ) : (
                projectJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 bg-gray-50/50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-base text-gray-900">{job.title}</h3>
                        <p className="text-xs text-green-700 font-semibold">
                          Thù lao: {formatCurrency(job.budget)} · Hạn nộp: {job.deadline ? formatDate(job.deadline) : 'Không giới hạn'}
                          {job.status !== 'OPEN'
                            ? <span className="ml-2 text-red-600 font-semibold">· Đã đóng</span>
                            : deadlineInfo(job.deadline).expired && <span className="ml-2 text-red-600">· Đã hết hạn nộp</span>}
                        </p>
                        {job.Skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.Skills.map(s => (
                              <span key={s.id} className="px-1.5 py-0.5 bg-white border border-gray-200 text-gray-600 rounded text-[10px]">{s.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="badge bg-primary-100 text-primary-700 text-xs">
                          {job.ProjectApplications?.length || 0} ứng viên nộp
                        </span>
                        <div className="flex items-center gap-3 text-xs font-medium">
                          <button onClick={() => openEditJob(viewJobsProject, job)} className="text-primary-700 hover:underline">Sửa / Gia hạn</button>
                          <button onClick={() => toggleJobStatus(job)} className={job.status === 'OPEN' ? 'text-red-500 hover:underline' : 'text-emerald-600 hover:underline'}>
                            {job.status === 'OPEN' ? 'Đóng vị trí' : 'Mở lại'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Danh sách ứng viên */}
                    <div className="bg-white rounded border border-gray-200 overflow-hidden">
                      <div className="px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-600 border-b">
                        Hồ sơ ứng tuyển ({job.ProjectApplications?.length || 0})
                      </div>

                      {job.ProjectApplications?.length === 0 ? (
                        <p className="p-3 text-xs text-gray-400 italic">Chưa có ứng viên nào nộp hồ sơ.</p>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {job.ProjectApplications?.map((app) => {
                            const profile = app.CandidateProfile;
                            const user = profile?.User;
                            const skills = profile?.Skills || [];
                            const members = profile?.WorkspaceMembers || [];
                            const scoredMembers = members.filter(m => m.CandidateEvaluation);
                            const avgScore = scoredMembers.length > 0
                              ? (scoredMembers.reduce((s, m) => s + parseFloat(m.CandidateEvaluation.score), 0) / scoredMembers.length).toFixed(1)
                              : null;
                            const statusInfo = STATUS_LABELS[app.status] || STATUS_LABELS.PENDING;
                            const cvUrl = app.cv_url || profile?.cv_url;

                            return (
                              <div key={app.id} className="p-3.5 hover:bg-gray-50/60 transition-colors">
                                {/* Row 1: Avatar + Name + Contact + Status */}
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <Avatar name={user?.full_name} src={profile?.avatar_url} size="md" className="flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => setDetailApp(app)}
                                          className="font-bold text-sm text-gray-900 hover:text-primary-700 hover:underline text-left"
                                          title="Xem thông tin chi tiết ứng viên"
                                        >
                                          {user?.full_name}
                                        </button>
                                        {profile?.professional_title && (
                                          <span className="text-xs text-primary-700 font-medium">· {profile.professional_title}</span>
                                        )}
                                      </div>
                                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                                        {user?.email && (
                                          <span className="inline-flex items-center gap-1">
                                            <Icon name="mail" className="w-3.5 h-3.5 text-gray-400" />{user.email}
                                          </span>
                                        )}
                                        {profile?.phone && (
                                          <span className="inline-flex items-center gap-1">
                                            <Icon name="phone" className="w-3.5 h-3.5 text-gray-400" />{profile.phone}
                                          </span>
                                        )}
                                        {profile?.address && (
                                          <span className="inline-flex items-center gap-1">
                                            <Icon name="mapPin" className="w-3.5 h-3.5 text-gray-400" />{profile.address}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <span className={`badge text-xs flex-shrink-0 ${statusInfo.color}`}>
                                    {statusInfo.label}
                                  </span>
                                </div>

                                {/* Row 2: Stats */}
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  {profile?.competency_score != null && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full border border-primary-100">
                                      <Icon name="star" className="w-3.5 h-3.5 mr-0" />Điểm NL: <strong>{profile.competency_score}</strong>
                                    </span>
                                  )}
                                  {avgScore && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                      <Icon name="badge" className="w-3.5 h-3.5 mr-0" />Đánh giá TB: <strong>{avgScore}/10</strong>
                                    </span>
                                  )}
                                  {members.length > 0 && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                      <Icon name="folder" className="w-3.5 h-3.5 mr-0" />{members.length} dự án DevHub
                                    </span>
                                  )}
                                  {profile?.github_url && (
                                    <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-primary-700 hover:underline">
                                      <Icon name="code" className="w-3.5 h-3.5" />GitHub
                                    </a>
                                  )}
                                  {profile?.portfolio_url && (
                                    <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-primary-700 hover:underline">
                                      <Icon name="globe" className="w-3.5 h-3.5" />Portfolio
                                    </a>
                                  )}
                                </div>

                                {/* Row 3: Skills */}
                                {skills.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {skills.slice(0, 6).map(s => (
                                      <span key={s.id} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px] font-medium">{s.name}</span>
                                    ))}
                                    {skills.length > 6 && (
                                      <span className="px-1.5 py-0.5 text-gray-400 text-[11px]">+{skills.length - 6}</span>
                                    )}
                                  </div>
                                )}

                                {/* Cover letter preview */}
                                {app.cover_letter && (
                                  <div className="mb-2 text-xs text-gray-600 bg-gray-50 border border-gray-200/80 rounded-lg px-2.5 py-1.5 italic line-clamp-2">
                                    <span className="font-semibold not-italic text-gray-700">Thư ứng tuyển: </span>“{app.cover_letter}”
                                  </div>
                                )}

                                {/* Interview badge */}
                                {app.interview_time && (() => {
                                  const st = new Date(app.interview_time);
                                  const dur = app.interview_duration || 30;
                                  const et = new Date(st.getTime() + dur * 60000);
                                  const resp = app.interview_response || 'PENDING';
                                  return (
                                    <div className={`mb-2 text-xs rounded-lg px-2.5 py-2 border ${
                                      resp === 'RESCHEDULE_REQUESTED'
                                        ? 'bg-amber-50 border-amber-300 text-amber-900'
                                        : resp === 'CONFIRMED'
                                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                        : 'bg-primary-50 border-primary-200 text-primary-800'
                                    }`}>
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <span className="inline-flex flex-wrap items-center gap-1 font-medium">
                                          <Icon name="calendar" className="w-3.5 h-3.5" />
                                          Phỏng vấn:{' '}
                                          <strong>
                                            {st.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })} ·{' '}
                                            {st.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} –{' '}
                                            {et.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                          </strong>
                                          <span>({dur}p)</span>
                                          {app.interviewer_name && (
                                            <span className="px-1.5 py-0.5 rounded bg-white/80 border border-black/10 text-[11px]">
                                              Người PV: <strong>{app.interviewer_name}</strong>
                                            </span>
                                          )}
                                          {app.meet_url && (
                                            <a href={app.meet_url} target="_blank" rel="noopener noreferrer" className="ml-1 underline font-semibold hover:opacity-80">
                                              · Phòng Meet ↗
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
                                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/90 text-gray-600 border border-gray-200">
                                            ⏳ Chờ UV xác nhận
                                          </span>
                                        )}
                                      </div>

                                      {resp === 'RESCHEDULE_REQUESTED' && app.candidate_reschedule_note && (
                                        <div className="mt-1.5 pt-1.5 border-t border-amber-200/80 flex items-center justify-between gap-2">
                                          <span className="italic">
                                            Đề xuất của ứng viên: “{app.candidate_reschedule_note}”
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => setInterviewApp(app)}
                                            className="px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] flex-shrink-0"
                                          >
                                            Đặt lại giờ ngay
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}

                                {/* Row 4: Actions */}
                                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                  {/* View Detailed Candidate Modal */}
                                  <button
                                    type="button"
                                    onClick={() => setDetailApp(app)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-xs font-semibold shadow-sm transition-colors"
                                  >
                                    <Icon name="user" className="w-3.5 h-3.5" />Thông tin chi tiết
                                  </button>

                                  {/* Full Page Candidate Profile */}
                                  {profile?.id && (
                                    <Link
                                      to={`/admin/candidates/${profile.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded text-xs font-medium border border-primary-200 transition-colors"
                                      title="Mở trang hồ sơ năng lực đầy đủ của ứng viên"
                                    >
                                      <Icon name="external" className="w-3.5 h-3.5" />Trang hồ sơ
                                    </Link>
                                  )}

                                  {/* CV Link */}
                                  {cvUrl && (
                                    <a
                                      href={cvUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded text-xs font-medium border border-primary-100 transition-colors"
                                    >
                                      <Icon name="document" className="w-3.5 h-3.5" />Xem CV
                                    </a>
                                  )}

                                  {/* Schedule Interview */}
                                  {app.status !== 'ACCEPTED' && app.status !== 'REJECTED' && (
                                    <button
                                      type="button"
                                      onClick={() => setInterviewApp(app)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded text-xs font-medium border border-primary-100 transition-colors"
                                    >
                                      <Icon name="calendar" className="w-3.5 h-3.5" />
                                      {app.interview_time ? 'Đổi lịch phỏng vấn' : 'Đặt lịch phỏng vấn'}
                                    </button>
                                  )}

                                  {/* Status Dropdown */}
                                  <select
                                    value={app.status}
                                    onChange={async (e) => {
                                      const status = e.target.value;
                                      if (status === 'ACCEPTED' && !(await confirm({ title: 'Duyệt vào Workspace', message: 'Duyệt ứng viên vào Workspace? Sau khi duyệt sẽ không thể đổi trạng thái hồ sơ nữa.', confirmText: 'Duyệt vào Workspace' }))) return;
                                      reviewAppMutation.mutate({ appId: app.id, status });
                                    }}
                                    disabled={reviewAppMutation.isPending || app.status === 'ACCEPTED'}
                                    title={app.status === 'ACCEPTED' ? 'Hồ sơ đã trúng tuyển — muốn cho ứng viên rời dự án, hãy xóa khỏi Workspace' : undefined}
                                    className="ml-auto text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-400 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-50"
                                  >
                                    <option value="PENDING" disabled>Chờ duyệt</option>
                                    <option value="REVIEWING">Đang xét duyệt</option>
                                    <option value="INTERVIEW">Mời phỏng vấn</option>
                                    <option value="ACCEPTED">Duyệt vào Workspace</option>
                                    <option value="REJECTED">Từ chối</option>
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setViewJobsProject(null)}
                className="btn-secondary"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Detail Panel */}
      {detailApp && (
        <CandidateDetailPanel
          app={detailApp}
          onClose={() => setDetailApp(null)}
        />
      )}

      {/* Schedule Interview Modal */}
      {interviewApp && (
        <ScheduleInterviewModal
          app={interviewApp}
          onClose={() => setInterviewApp(null)}
          onManageInterviewers={() => setShowManageInterviewers(true)}
          onSuccess={() => {
            setInterviewApp(null);
            if (viewJobsProject) qc.invalidateQueries({ queryKey: ['admin-project-jobs', viewJobsProject.id] });
          }}
        />
      )}

      {/* Manage Interviewers Modal */}
      {showManageInterviewers && (
        <ManageInterviewersModal onClose={() => setShowManageInterviewers(false)} />
      )}

    </div>
  );
}
