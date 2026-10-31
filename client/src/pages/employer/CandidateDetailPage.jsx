import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { companyApi } from '@/api/companyApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Icon, { IconBadge } from '@/components/common/Icon';
import Avatar from '@/components/common/Avatar';
import { SkillTag, VerifiedSkillTag } from '@/components/common/Badges';
import ExperienceTimeline from '@/components/candidate/ExperienceTimeline';
import { EMPLOYER_APPLICATION_STATUS } from '@/utils/applicationStatus';
import { formatDate } from '@/utils/jobMeta';
import { formatFileSize } from '@/utils/fileHelper';
import { timeAgo } from '@/utils/timeAgo';

// Với nhà tuyển dụng chỉ cần biết dự án đã xong, đang làm hay đã hủy (giai đoạn "lên kế hoạch / tuyển người" vẫn là đang triển khai)
const ONGOING = { label: 'Đang thực hiện', cls: 'bg-primary-50 text-primary-700' };
const PROJECT_STATUS = {
  PLANNING: ONGOING,
  RECRUITING: ONGOING,
  IN_PROGRESS: ONGOING,
  COMPLETED: { label: 'Đã hoàn thành', cls: 'bg-emerald-50 text-emerald-700' },
  CANCELLED: { label: 'Đã hủy', cls: 'bg-red-50 text-red-600' },
};
const MEMBER_STATUS = { ACTIVE: 'Đang tham gia', COMPLETED: 'Đã hoàn thành phần việc', REMOVED: 'Đã rời dự án' };

const scoreTone = (s) => (s >= 8 ? 'text-emerald-600' : s >= 5 ? 'text-amber-600' : 'text-red-500');

// "1 năm 8 tháng", "5 tháng", "dưới 1 tháng"
const durationText = (months) => {
  if (!months || months < 1) return 'dưới 1 tháng';
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y ? `${y} năm` : '', m ? `${m} tháng` : ''].filter(Boolean).join(' ');
};
// Cùng cách tính (ngày / 30,44) với số "Kinh nghiệm làm việc" tính ở server để hai con số khớp nhau
const monthsBetween = (start, end) => {
  if (!start) return 0;
  const ms = (end ? new Date(end) : new Date()) - new Date(start);
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24 * 30.4375)));
};
const monthYear = (d) => { const x = new Date(d); return `${String(x.getMonth() + 1).padStart(2, '0')}/${x.getFullYear()}`; };
const num = (n) => Number(n).toLocaleString('vi-VN'); // 1.5 → "1,5"
// "Đã tham gia 12 ngày" / "3 tháng"
const sinceText = (from) => {
  const days = Math.floor((Date.now() - new Date(from).getTime()) / 86400000);
  if (days < 1) return 'vừa tham gia hôm nay';
  if (days < 30) return `đã tham gia ${days} ngày`;
  return `đã tham gia ${durationText(Math.round(days / 30.4375))}`;
};

// Khối có tiêu đề
function Section({ icon, title, hint, count, children }) {
  return (
    <section className="card !p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="w-9 h-9 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0">
          <Icon name={icon} className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-bold text-slate-900 text-lg leading-tight">
            {title}{count !== undefined && <span className="ml-1.5 text-slate-400 font-semibold">({count})</span>}
          </h2>
          {hint && <p className="text-sm text-slate-500 mt-0.5">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

// Một dự án thật ứng viên đã làm trên DevHub
function ProjectCard({ p }) {
  const [open, setOpen] = useState(false);
  const proj = p.project || {};
  const st = PROJECT_STATUS[proj.status];
  const ev = p.evaluation;
  const score = ev ? parseFloat(ev.score) : null;
  const t = p.tasks;
  const longDesc = (proj.description || '').length > 220;
  const periodEnd = proj.status === 'COMPLETED' && proj.actual_end_date ? proj.actual_end_date : null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-slate-900 leading-snug">{proj.name || 'Dự án'}</h3>
            <p className="text-sm text-primary-700 font-medium mt-0.5">
              {p.position || 'Thành viên dự án'}
              {p.role === 'LEAD' && <span className="ml-2 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-primary-50 text-primary-700 align-middle">Lead</span>}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {score !== null && !Number.isNaN(score) ? (
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                score >= 8
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : score >= 5
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                <Icon name="star" className="w-3.5 h-3.5" />
                {score.toFixed(1)}/10
              </span>
            ) : (
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                Chưa chấm điểm
              </span>
            )}
            {st && <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>}
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">{MEMBER_STATUS[p.member_status] || p.member_status}</span>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="inline-flex items-center gap-1.5">
            <Icon name="calendar" className="w-3.5 h-3.5" />
            Tham gia {formatDate(p.joined_at)}{periodEnd ? ` · kết thúc ${formatDate(periodEnd)}` : p.member_status === 'ACTIVE' ? ' · đến nay' : ''}
          </span>
          {p.member_status === 'ACTIVE' && (
            <span className="inline-flex items-center gap-1.5"><Icon name="clock" className="w-3.5 h-3.5" />{sinceText(p.joined_at)}</span>
          )}
        </p>

        {proj.description && (
          <div className="mt-3">
            <p className={`text-sm text-slate-600 leading-relaxed whitespace-pre-line ${open ? '' : 'line-clamp-3'}`}>{proj.description}</p>
            {longDesc && (
              <button onClick={() => setOpen((v) => !v)} className="text-xs text-primary-700 font-medium hover:underline mt-1">
                {open ? 'Thu gọn' : 'Xem thêm'}
              </button>
            )}
          </div>
        )}

        {p.skills?.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-slate-500 mb-1.5">Công nghệ / kỹ năng của vị trí</p>
            <div className="flex flex-wrap gap-1.5">{p.skills.map((s) => <SkillTag key={s.id} name={s.name} />)}</div>
          </div>
        )}
      </div>

      {/* Đóng góp (số liệu thật từ bảng công việc của dự án) */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        {t.total > 0 ? (
          <>
            <span className="inline-flex items-center gap-1.5 text-slate-700">
              <Icon name="clipboardCheck" className="w-4 h-4 text-primary-700" />
              <strong>{t.done}/{t.total}</strong> task đã được nghiệm thu
            </span>
            {t.done > 0 && (
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <Icon name="clock" className="w-4 h-4 text-primary-700" />
                <strong>{t.on_time}/{t.done}</strong> task nộp đúng hạn
              </span>
            )}
          </>
        ) : (
          <span className="text-slate-400">Chưa được giao task trong dự án này</span>
        )}
      </div>

      {/* Đánh giá của Admin / Lead */}
      <div className="px-4 sm:px-5 py-4 border-t border-slate-100">
        {ev ? (
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-center rounded-xl bg-primary-50 border border-primary-100 px-3 py-2 min-w-[72px]">
              <p className={`text-2xl font-extrabold leading-none ${scoreTone(score)}`}>{score.toFixed(1)}</p>
              <p className="text-[11px] text-slate-400 mt-1">/ 10 điểm</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-500">Đánh giá của quản lý dự án · {formatDate(ev.evaluated_at)}</p>
              {ev.comment
                ? <p className="text-sm text-slate-700 italic mt-1 whitespace-pre-line">“{ev.comment}”</p>
                : <p className="text-sm text-slate-400 mt-1">Không có nhận xét kèm theo.</p>}
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400 flex items-center gap-2"><Icon name="info" className="w-4 h-4" />Chưa có đánh giá cho dự án này.</p>
        )}
      </div>
    </div>
  );
}

// Sao chép nhanh email / số điện thoại
function ContactRow({ icon, label, value, href }) {
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); toast.success(`Đã sao chép ${label.toLowerCase()}`); }
    catch { toast.error('Không sao chép được'); }
  };
  return (
    <div className="flex items-start gap-3">
      <span className="w-9 h-9 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0"><Icon name={icon} className="w-[18px] h-[18px]" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <a href={href} className="text-sm font-semibold text-slate-900 hover:text-primary-700 break-all">{value}</a>
      </div>
      <button onClick={copy} className="text-xs text-primary-700 font-medium hover:underline flex-shrink-0 mt-1">Sao chép</button>
    </div>
  );
}

export default function CandidateDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['employer-candidate', id],
    queryFn: () => companyApi.getCandidateProfile(id),
    retry: false,
  });
  const c = data?.data?.data;

  const saveMutation = useMutation({
    mutationFn: () => companyApi.toggleSaveCandidate(id),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'Đã cập nhật danh sách lưu');
      qc.invalidateQueries({ queryKey: ['employer-candidate', id] });
      qc.invalidateQueries({ queryKey: ['employer-search-candidates'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể lưu ứng viên');
    },
  });

  const back = () => (window.history.length > 1 ? navigate(-1) : navigate('/employer/candidates'));

  if (isLoading) return <LoadingSpinner />;
  if (isError || !c) {
    const isForbidden = error?.response?.status === 403;
    return (
      <div className="card text-center py-14">
        <IconBadge name={isForbidden ? 'lock' : 'search'} size="lg" className="mx-auto mb-3" />
        <p className="font-semibold text-slate-800">
          {isForbidden ? 'Hồ sơ đang ở chế độ riêng tư' : 'Không tìm thấy ứng viên'}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          {error?.response?.data?.message || 'Hồ sơ có thể đã bị xóa hoặc đường dẫn không đúng.'}
        </p>
        <Link to="/employer/candidates" className="btn-primary inline-block mt-4">← Về trang tìm ứng viên</Link>
      </div>
    );
  }

  const score = parseFloat(c.competency_score) || 0;
  const s = c.summary;
  const hidden = c.hidden_sections || {};
  const skills = [...c.skills].sort((a, b) => (b.evidence?.length > 0) - (a.evidence?.length > 0));
  const mainCv = c.cvs?.[0]?.file_url || c.cv_url;

  return (
    <div className="space-y-6">
      <button onClick={back} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-700">
        <Icon name="chevronRight" className="w-4 h-4 rotate-180" />Quay lại
      </button>

      {/* Đầu hồ sơ */}
      <div className="rounded-2xl bg-brand-gradient text-white p-6 sm:p-7 shadow-lift">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <Avatar name={c.full_name} src={c.avatar_url} size="xl" className="ring-4 ring-white/40" zoomable />
          <div className="min-w-0 flex-1">
            {/* Tên + điểm năng lực cùng một hàng */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{c.full_name}</h1>
              {score ? (
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-primary-700 text-sm font-bold shadow"
                  title={s.evaluation_count ? `Dựa trên ${s.evaluation_count} lượt đánh giá dự án` : 'Điểm năng lực do Admin ghi nhận'}
                >
                  <Icon name="star" className="w-4 h-4" />
                  Điểm năng lực: <span className={scoreTone(score)}>{score.toFixed(1)}</span><span className="text-xs font-semibold text-slate-400 -ml-1">/10</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 border border-white/30 text-white text-sm font-medium">
                  <Icon name="star" className="w-4 h-4" />Chưa được đánh giá năng lực
                </span>
              )}
            </div>
            <p className="text-white font-medium mt-1">{c.professional_title || 'Chưa cập nhật chức danh'}</p>
            {c.address && <p className="text-white text-sm mt-1 flex items-center gap-1.5"><Icon name="mapPin" className="w-4 h-4" />{c.address}</p>}

            <div className="flex flex-wrap gap-2 mt-4">
              <button
                type="button"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm ${
                  c.is_saved
                    ? 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                    : 'bg-white/20 border border-white/30 text-white hover:bg-white/30'
                }`}
              >
                <Icon name="bookmark" className="w-4 h-4" />
                {c.is_saved ? 'Đã lưu ứng viên' : 'Lưu ứng viên'}
              </button>
              {mainCv && (
                <a href={mainCv} target="_blank" rel="noopener noreferrer" className="btn-light">
                  <Icon name="document" className="w-4 h-4" />Xem CV
                </a>
              )}
              {c.github_url && (
                <a href={c.github_url} target="_blank" rel="noopener noreferrer" className="btn-glass"><Icon name="code" className="w-4 h-4" />GitHub</a>
              )}
              {c.portfolio_url && (
                <a href={c.portfolio_url} target="_blank" rel="noopener noreferrer" className="btn-glass"><Icon name="globe" className="w-4 h-4" />Portfolio</a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ───────── Cột chính ───────── */}
        <div className="lg:col-span-2 space-y-6 min-w-0">
          {c.introduction ? (
            <Section icon="user" title="Giới thiệu">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{c.introduction}</p>
            </Section>
          ) : hidden.introduction ? (
            <Section icon="user" title="Giới thiệu">
              <p className="text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl px-4 py-4 flex items-center justify-center gap-2">
                <Icon name="lock" className="w-4 h-4" />Ứng viên đã ẩn phần giới thiệu bản thân.
              </p>
            </Section>
          ) : null}

          <Section icon="folder" title="Dự án đã tham gia trên DevHub" count={hidden.devhub_projects ? undefined : c.projects.length}
            hint="Dự án thực tế ứng viên đã làm trong Workspace của DevHub: vị trí, đóng góp (task) và đánh giá từ quản lý dự án.">
            {hidden.devhub_projects ? (
              <p className="text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl px-4 py-6 text-center flex items-center justify-center gap-2">
                <Icon name="lock" className="w-4 h-4" />Ứng viên đã ẩn thông tin dự án trên DevHub theo cài đặt quyền riêng tư.
              </p>
            ) : c.projects.length ? (
              <div className="space-y-4">
                {/* Bảng tóm tắt nhanh điểm số từng dự án */}
                <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5">
                  <p className="text-xs font-semibold text-slate-500 mb-2">
                    Tổng hợp điểm đánh giá từng dự án ({c.projects.length} dự án)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {c.projects.map((p) => {
                      const pScore = p.evaluation ? parseFloat(p.evaluation.score) : null;
                      return (
                        <div
                          key={`sum-${p.member_id}`}
                          className="flex items-center justify-between gap-2 bg-white rounded-lg border border-slate-200 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {p.project?.name || 'Dự án DevHub'}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {p.position || 'Thành viên'}
                            </p>
                          </div>
                          {pScore !== null && !Number.isNaN(pScore) ? (
                            <span className={`shrink-0 text-xs font-extrabold px-2 py-0.5 rounded-md border ${
                              pScore >= 8
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : pScore >= 5
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-600 border-red-200'
                            }`}>
                              ★ {pScore.toFixed(1)}/10
                            </span>
                          ) : (
                            <span className="shrink-0 text-[11px] font-medium text-slate-400">
                              Chưa chấm
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {c.projects.map((p) => <ProjectCard key={p.member_id} p={p} />)}
              </div>
            ) : (
              <p className="text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl px-4 py-6 text-center">
                Ứng viên chưa tham gia dự án nào trên DevHub.
              </p>
            )}
          </Section>

          <Section icon="briefcase" title="Sơ đồ kinh nghiệm" hint="Công ty, dự án, freelance và dự án cá nhân theo thời gian. Dự án có huy hiệu xanh được DevHub xác thực.">
            {hidden.experiences ? (
              <p className="text-sm text-slate-400 border border-dashed border-slate-200 rounded-xl px-4 py-6 text-center flex items-center justify-center gap-2">
                <Icon name="lock" className="w-4 h-4" />Ứng viên đã ẩn sơ đồ kinh nghiệm làm việc theo cài đặt quyền riêng tư.
              </p>
            ) : (
              <ExperienceTimeline
                experiences={c.experiences}
                devhubProjects={c.projects}
                emptyHint="Ứng viên chưa khai báo kinh nghiệm làm việc."
              />
            )}
          </Section>
        </div>

        {/* ───────── Cột bên ───────── */}
        <aside className="space-y-6 min-w-0">
          <div className="card !p-5">
            <h3 className="font-bold text-slate-900 mb-4">Thông tin liên hệ</h3>
            {c.contact_locked ? (
              <div className="flex items-start gap-2.5 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <Icon name="lock" className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  Email và số điện thoại chỉ hiện với doanh nghiệp đã được Admin xác thực.{' '}
                  <Link to="/employer/company" className="font-semibold underline">Xem hồ sơ doanh nghiệp</Link>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {c.email ? (
                  <ContactRow icon="mail" label="Email" value={c.email} href={`mailto:${c.email}`} />
                ) : hidden.email ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2">
                    <Icon name="lock" className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Ứng viên đã ẩn địa chỉ Email</span>
                  </div>
                ) : null}
                {c.phone ? (
                  <ContactRow icon="phone" label="Số điện thoại" value={c.phone} href={`tel:${c.phone}`} />
                ) : hidden.phone ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-2">
                    <Icon name="lock" className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Ứng viên đã ẩn số điện thoại</span>
                  </div>
                ) : null}
                {!c.email && !c.phone && !hidden.email && !hidden.phone && (
                  <p className="text-sm text-slate-400">Ứng viên chưa cập nhật thông tin liên hệ.</p>
                )}
              </div>
            )}
          </div>

          <div className="card !p-5">
            <h3 className="font-bold text-slate-900 mb-4">Kỹ năng {skills.length > 0 && <span className="text-slate-400 font-semibold">({skills.length})</span>}</h3>
            {skills.length ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((sk) => <VerifiedSkillTag key={sk.id} name={sk.name} evidence={sk.evidence} className="!text-sm" />)}
              </div>
            ) : <p className="text-sm text-slate-400">Chưa khai báo kỹ năng.</p>}
          </div>

          {hidden.cv ? (
            <div className="card !p-5">
              <h3 className="font-bold text-slate-900 mb-2">CV của ứng viên</h3>
              <p className="text-xs text-slate-400 flex items-center gap-2 bg-slate-50 border border-dashed border-slate-200 rounded-lg p-3">
                <Icon name="lock" className="w-4 h-4 flex-shrink-0" />
                <span>Ứng viên đang ẩn CV trong tìm kiếm công khai (chỉ hiển thị với công ty mà ứng viên nộp đơn).</span>
              </p>
            </div>
          ) : c.cvs?.length > 0 && (
            <div className="card !p-5">
              <h3 className="font-bold text-slate-900 mb-3">CV của ứng viên</h3>
              <div className="space-y-2">
                {c.cvs.map((cv) => (
                  <a key={cv.id} href={cv.file_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2.5 rounded-lg border border-slate-200 hover:border-primary-300 hover:bg-primary-50/40 transition-colors">
                    <span className="w-9 h-9 rounded-lg bg-primary-50 text-primary-700 flex items-center justify-center flex-shrink-0"><Icon name="document" className="w-5 h-5" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-slate-900 truncate">{cv.name}</span>
                      <span className="block text-[11px] text-slate-400 truncate">{cv.file_name}{cv.file_size ? ` · ${formatFileSize(cv.file_size)}` : ''}</span>
                    </span>
                    {cv.is_default && <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-primary-100 text-primary-700 flex-shrink-0">Mặc định</span>}
                    <Icon name="external" className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {c.applications?.length > 0 && (
            <div className="card !p-5 border-primary-200 bg-primary-50/30">
              <h3 className="font-bold text-slate-900 mb-1">Đã ứng tuyển vào tin của bạn</h3>
              {c.full_access_by_application && (
                <p className="text-xs text-primary-700 mb-3">
                  Bạn đang xem đầy đủ hồ sơ & CV vì ứng viên đã nộp đơn vào doanh nghiệp của bạn.
                </p>
              )}
              <div className="space-y-2">
                {c.applications.map((a) => {
                  const st = EMPLOYER_APPLICATION_STATUS[a.status] || EMPLOYER_APPLICATION_STATUS.PENDING;
                  return (
                    <Link key={a.id} to={`/employer/jobs/${a.job_id}?tab=applications`}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white border border-slate-200 hover:border-primary-300 transition-colors">
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-slate-900 truncate">{a.job_title}</span>
                        <span className="block text-[11px] text-slate-400">Nộp {timeAgo(a.applied_at)}</span>
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium flex-shrink-0 ${st.cls}`}>{st.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
