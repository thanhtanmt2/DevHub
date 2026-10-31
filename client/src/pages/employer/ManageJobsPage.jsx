import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jobApi } from '@/api/jobApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Icon, { IconBadge } from '@/components/common/Icon';
import PageBanner from '@/components/common/PageBanner';
import { SkillTag, WorkTypeBadge } from '@/components/common/Badges';
import { DeadlineChip, MetaItem } from '@/components/job/JobParts';
import JobFormModal from '@/components/employer/JobFormModal';
import ReopenJobModal from '@/components/employer/ReopenJobModal';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { timeAgo } from '@/utils/timeAgo';
import {
  JOB_STATUS_META, EXPERIENCE_LABELS, LEVEL_LABELS, formatSalaryShort, shortLocation,
} from '@/utils/jobMeta';

// Bộ lọc nhanh theo trạng thái tin
const FILTERS = [
  { key: 'ALL', label: 'Tất cả', match: () => true },
  { key: 'OPEN', label: 'Đang tuyển', match: (j) => j.status === 'OPEN' },
  { key: 'PENDING', label: 'Chờ duyệt', match: (j) => j.status === 'PENDING_APPROVAL' },
  { key: 'DRAFT', label: 'Bản nháp', match: (j) => j.status === 'DRAFT' },
  { key: 'CLOSED', label: 'Đã đóng / từ chối', match: (j) => ['CLOSED', 'HIDDEN'].includes(j.status) },
];

export default function ManageJobsPage() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [form, setForm] = useState(null); // null = đóng; { job, mode } = mở form
  const [reopenJob, setReopenJob] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: jobApi.getMyJobs,
    refetchInterval: 20000, // hồ sơ mới nộp thì số hồ sơ trên thẻ tự tăng
  });
  const jobs = jobsData?.data?.data || [];

  const closeJobMut = useMutation({
    mutationFn: (id) => jobApi.closeJob(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ['employer-jobs'] });
      qc.invalidateQueries({ queryKey: ['employer-job', id] });
      toast.success('Đã đóng tin tuyển dụng');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể đóng tin'),
  });

  const publishDraftMut = useMutation({
    mutationFn: (id) => jobApi.updateJob(id, { is_draft: false }),
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: ['employer-jobs'] });
      qc.invalidateQueries({ queryKey: ['employer-job', id] });
      toast.success(res.data?.message || 'Đã gửi bản nháp để Admin duyệt');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể đăng bản nháp'),
  });

  const askClose = async (job) => {
    if (await confirm({ title: 'Đóng tin tuyển dụng', message: `Đóng tin "${job.title}"? Ứng viên sẽ không thể nộp thêm hồ sơ vào tin này.`, confirmText: 'Đóng tin', tone: 'danger' })) {
      closeJobMut.mutate(job.id);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  const current = FILTERS.find((f) => f.key === filter) || FILTERS[0];
  const shown = jobs.filter(current.match);
  const stop = (fn) => (e) => { e.stopPropagation(); fn(e); }; // nút con không kích hoạt việc mở thẻ

  return (
    <div className="space-y-6">
      <PageBanner compact icon="briefcase" title="Tin tuyển dụng" subtitle="Đăng tin, xem nội dung tin và xử lý hồ sơ ứng viên ngay trong từng tin">
        <button onClick={() => setForm({ job: null })} className="btn-light">+ Đăng tin mới</button>
      </PageBanner>

      {jobs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const n = jobs.filter(f.match).length;
            if (f.key !== 'ALL' && n === 0) return null;
            return (
              <button key={f.key} onClick={() => setFilter(f.key)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  filter === f.key ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'
                }`}>
                {f.label} <span className={filter === f.key ? 'text-white' : 'text-slate-400'}>({n})</span>
              </button>
            );
          })}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="card text-center py-14">
          <IconBadge name="briefcase" size="lg" className="mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Bạn chưa có tin tuyển dụng nào</h3>
          <p className="text-slate-500 text-sm mb-4">Đăng tin đầu tiên để ứng viên IT bắt đầu nộp hồ sơ.</p>
          <button onClick={() => setForm({ job: null })} className="btn-primary">+ Đăng tin mới</button>
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((job) => {
            const st = JOB_STATUS_META[job.status] || JOB_STATUS_META.DRAFT;
            const total = Number(job.application_count) || 0;
            const pending = Number(job.pending_count) || 0;
            const open = () => navigate(`/employer/jobs/${job.id}`);
            return (
              <div
                key={job.id}
                role="link"
                tabIndex={0}
                onClick={open}
                onKeyDown={(e) => { if (e.key === 'Enter') open(); }}
                className="card card-hover cursor-pointer !p-5 border-2 border-transparent border-l-4 border-l-primary-400 hover:border-l-primary-500"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                      <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold ${st.cls}`}>{st.label}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                      <MetaItem icon="mapPin">{shortLocation(job.location) || 'Toàn quốc'}</MetaItem>
                      <MetaItem icon="clock">{EXPERIENCE_LABELS[job.experience]}</MetaItem>
                      <MetaItem icon="badge">{LEVEL_LABELS[job.position_level]}</MetaItem>
                      <MetaItem icon="users">{job.quantity > 1 ? `Cần ${job.quantity} người` : ''}</MetaItem>
                    </div>
                    {job.Skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.Skills.slice(0, 6).map((s) => <SkillTag key={s.id} name={s.name} />)}
                        {job.Skills.length > 6 && <span className="text-xs text-slate-400 self-center">+{job.Skills.length - 6}</span>}
                      </div>
                    )}
                  </div>
                  <span className="text-primary-700 font-bold whitespace-nowrap">{formatSalaryShort(job.salary_min, job.salary_max)}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <button
                      onClick={stop(() => navigate(`/employer/jobs/${job.id}?tab=applications`))}
                      className={`inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        pending > 0 ? 'bg-primary-50 text-primary-700 hover:bg-primary-100' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon name="inbox" className="w-4 h-4" />
                      {total} hồ sơ
                      {pending > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary-600 text-white text-[11px] leading-none">{pending} mới</span>}
                    </button>
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-500"><Icon name="eye" className="w-4 h-4" />{job.view_count || 0} lượt xem</span>
                    <WorkTypeBadge type={job.work_type} />
                    <DeadlineChip deadline={job.deadline} />
                    {job.posted_at && <span className="text-xs text-slate-400">Đăng {timeAgo(job.posted_at)}</span>}
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {job.status === 'DRAFT' && (
                      <button
                        onClick={stop(() => publishDraftMut.mutate(job.id))}
                        disabled={publishDraftMut.isPending}
                        className="text-sm font-semibold text-primary-600 hover:text-primary-800 px-3 py-1.5 rounded-lg hover:bg-primary-50"
                      >
                        <Icon name="upload" className="w-4 h-4 mr-1" />Đăng tin
                      </button>
                    )}
                    <button
                      onClick={stop(() => setForm({ job, mode: 'duplicate' }))}
                      className="text-sm font-medium text-slate-600 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-slate-100"
                    >
                      <Icon name="copy" className="w-4 h-4 mr-1" />Nhân bản
                    </button>
                    <button
                      onClick={stop(() => setForm({ job, mode: 'edit' }))}
                      className="text-sm font-medium text-slate-600 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-slate-100"
                    >
                      <Icon name="pencil" className="w-4 h-4 mr-1" />Sửa
                    </button>
                    {job.status === 'CLOSED' ? (
                      <button
                        onClick={stop(() => setReopenJob(job))}
                        className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50"
                      >
                        <Icon name="refresh" className="w-4 h-4 mr-1" />Mở lại tin
                      </button>
                    ) : (
                      <button
                        onClick={stop(() => askClose(job))}
                        className="text-sm font-medium text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50"
                      >
                        <Icon name="lock" className="w-4 h-4 mr-1" />Đóng tin
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {!shown.length && <p className="text-center text-sm text-slate-400 py-8">Không có tin nào ở nhóm này.</p>}
        </div>
      )}

      {form && <JobFormModal job={form.job} mode={form.mode || (form.job ? 'edit' : 'create')} onClose={() => setForm(null)} />}
      {reopenJob && <ReopenJobModal job={reopenJob} onClose={() => setReopenJob(null)} />}
    </div>
  );
}
