import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { jobApi } from '@/api/jobApi';
import Icon, { IconBadge } from '@/components/common/Icon';
import Avatar from '@/components/common/Avatar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { SkillTag } from '@/components/common/Badges';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { timeAgo } from '@/utils/timeAgo';
import { EMPLOYER_APPLICATION_STATUS } from '@/utils/applicationStatus';

const STATUS = EMPLOYER_APPLICATION_STATUS;
// Các trạng thái này gửi email cho ứng viên nên hỏi lại trước khi đổi (tránh bấm nhầm)
const EMAIL_STATUSES = ['INTERVIEW', 'HIRED', 'REJECTED'];

// Danh sách hồ sơ ứng tuyển của MỘT tin tuyển dụng
export default function ApplicantsPanel({ jobId }) {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [filter, setFilter] = useState('ALL');
  const [expanded, setExpanded] = useState({}); // id hồ sơ → đang mở rộng thư giới thiệu

  const { data, isLoading } = useQuery({
    queryKey: ['employer-job-applications', jobId],
    queryFn: () => jobApi.getJobApplications(jobId),
    refetchInterval: 20000, // có hồ sơ mới thì tự hiện
  });
  const all = data?.data?.data || [];

  const statusMut = useMutation({
    mutationFn: ({ id, status }) => jobApi.updateApplicationStatus(id, { status }),
    onSuccess: () => {
      toast.success('Đã cập nhật trạng thái hồ sơ');
      qc.invalidateQueries({ queryKey: ['employer-job-applications', jobId] });
      qc.invalidateQueries({ queryKey: ['employer-job', jobId] });
      qc.invalidateQueries({ queryKey: ['employer-jobs'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái'),
  });

  const changeStatus = async (app, status) => {
    if (status === app.status) return;
    if (EMAIL_STATUSES.includes(status)) {
      const name = app.CandidateProfile?.User?.full_name || 'ứng viên';
      const ok = await confirm({
        title: `Chuyển sang "${STATUS[status].label}"`,
        message: `Hồ sơ của ${name} sẽ chuyển sang "${STATUS[status].label}" và hệ thống gửi email thông báo cho ứng viên.`,
        confirmText: 'Xác nhận',
        tone: status === 'REJECTED' ? 'danger' : 'primary',
      });
      if (!ok) return;
    }
    statusMut.mutate({ id: app.id, status });
  };

  if (isLoading) return <div className="py-16"><LoadingSpinner /></div>;

  const counts = all.reduce((acc, a) => { acc[a.status] = (acc[a.status] || 0) + 1; return acc; }, {});
  // Hồ sơ chờ xem lên trước, sau đó mới nhất trước
  const sorted = [...all].sort((a, b) =>
    (b.status === 'PENDING') - (a.status === 'PENDING') || new Date(b.applied_at) - new Date(a.applied_at));
  const shown = filter === 'ALL' ? sorted : sorted.filter((a) => a.status === filter);

  if (!all.length) {
    return (
      <div className="card text-center py-14">
        <IconBadge name="inbox" size="lg" className="mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-slate-900 mb-1">Chưa có hồ sơ ứng tuyển nào</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Khi ứng viên nộp hồ sơ vào tin này, thông tin và CV sẽ hiện tại đây và bạn nhận thông báo ngay.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Lọc theo trạng thái */}
      <div className="flex flex-wrap gap-2">
        {[['ALL', 'Tất cả', all.length], ...Object.entries(STATUS).map(([k, v]) => [k, v.label, counts[k] || 0])]
          .filter(([k, , n]) => k === 'ALL' || n > 0)
          .map(([k, label, n]) => (
            <button key={k} onClick={() => setFilter(k)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                filter === k ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
              }`}>
              {label} <span className={filter === k ? 'text-white' : 'text-slate-400'}>({n})</span>
            </button>
          ))}
      </div>

      <div className="space-y-3">
        {shown.map((app) => {
          const profile = app.CandidateProfile;
          const user = profile?.User;
          const name = user?.full_name || 'Ứng viên';
          const cvUrl = app.cv_url || profile?.cv_url;
          const st = STATUS[app.status] || STATUS.PENDING;
          const score = parseFloat(profile?.competency_score || 0);
          const isOpen = !!expanded[app.id];
          const long = (app.cover_letter || '').length > 160 || (app.cover_letter || '').split('\n').length > 3;
          return (
            <div key={app.id} className={`card !p-5 ${app.status === 'PENDING' ? 'border-l-4 border-l-primary-500' : ''}`}>
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                <div className="flex gap-4 flex-1 min-w-0">
                  <Avatar name={name} src={profile?.avatar_url} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {profile?.id ? (
                        <Link to={`/employer/candidates/${profile.id}`} className="font-semibold text-slate-900 text-base hover:text-primary-700 hover:underline" title="Xem hồ sơ năng lực đầy đủ">{name}</Link>
                      ) : <h3 className="font-semibold text-slate-900 text-base">{name}</h3>}
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${st.cls}`}>{st.label}</span>
                      {score > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700" title="Điểm năng lực">
                          <Icon name="star" className="w-3.5 h-3.5" />{score.toFixed(1)}/10
                        </span>
                      )}
                    </div>
                    {profile?.professional_title && <p className="text-sm text-slate-500">{profile.professional_title}</p>}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-600">
                      {user?.email && (
                        <a href={`mailto:${user.email}`} className="inline-flex items-center gap-1.5 hover:text-primary-600 hover:underline">
                          <Icon name="mail" className="w-4 h-4 text-slate-400" />{user.email}
                        </a>
                      )}
                      {profile?.phone && (
                        <a href={`tel:${profile.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary-600">
                          <Icon name="phone" className="w-4 h-4 text-slate-400" />{profile.phone}
                        </a>
                      )}
                      {profile?.github_url && (
                        <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary-600 hover:underline">
                          <Icon name="code" className="w-4 h-4 text-slate-400" />GitHub
                        </a>
                      )}
                      {profile?.portfolio_url && (
                        <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary-600 hover:underline">
                          <Icon name="globe" className="w-4 h-4 text-slate-400" />Portfolio
                        </a>
                      )}
                      <span className="inline-flex items-center gap-1.5 text-slate-500" title={new Date(app.applied_at).toLocaleString('vi-VN')}>
                        <Icon name="clock" className="w-4 h-4 text-slate-400" />Nộp {timeAgo(app.applied_at)}
                      </span>
                    </div>

                    {profile?.Skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {profile.Skills.map((s, i) => <SkillTag key={i} name={s.name} />)}
                      </div>
                    )}

                    {app.cover_letter && (
                      <div className="mt-3 text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Thư giới thiệu</p>
                        <p className={`whitespace-pre-line ${isOpen ? '' : 'line-clamp-3'}`}>{app.cover_letter}</p>
                        {long && (
                          <button onClick={() => setExpanded((e) => ({ ...e, [app.id]: !isOpen }))} className="text-xs text-primary-600 font-medium hover:underline mt-1">
                            {isOpen ? 'Thu gọn' : 'Xem đầy đủ'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-row flex-wrap lg:flex-col items-center lg:items-end justify-between gap-3 lg:flex-shrink-0">
                  {cvUrl ? (
                    <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm !py-2 !px-4 whitespace-nowrap">
                      <Icon name="document" className="w-4 h-4" />Xem CV<Icon name="external" className="w-3.5 h-3.5 opacity-80" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500 italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">Chưa đính kèm CV</span>
                  )}
                  {profile?.id && (
                    <Link to={`/employer/candidates/${profile.id}`} className="text-sm font-medium text-primary-700 hover:underline whitespace-nowrap">
                      Hồ sơ năng lực →
                    </Link>
                  )}
                  <label className="flex items-center gap-2 text-xs text-slate-500">
                    Trạng thái
                    <select
                      value={app.status}
                      disabled={statusMut.isPending && statusMut.variables?.id === app.id}
                      onChange={(e) => changeStatus(app, e.target.value)}
                      className="input-field w-auto text-sm !py-1.5 !px-2.5 font-medium"
                    >
                      {/* "Chờ xem" là trạng thái ban đầu của hồ sơ mới: hiển thị để biết hiện tại, không chọn lại được */}
                      {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k} disabled={k === 'PENDING'}>{v.label}</option>)}
                    </select>
                  </label>
                </div>
              </div>
            </div>
          );
        })}
        {!shown.length && <p className="text-center text-sm text-slate-400 py-8">Không có hồ sơ nào ở trạng thái này.</p>}
      </div>
    </div>
  );
}
