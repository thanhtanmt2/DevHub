import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { candidateApi } from '@/api/candidateApi';
import Icon, { IconBadge } from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import PageBanner from '@/components/common/PageBanner';
import CompanyLogo, { DEVHUB_COMPANY, brandName } from '@/components/common/CompanyLogo';
import { SkillTag, WorkTypeBadge } from '@/components/common/Badges';
import { DeadlineChip, MetaItem } from '@/components/job/JobParts';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { EXPERIENCE_LABELS, formatSalaryShort, shortLocation } from '@/utils/jobMeta';
import { APPLICATION_STATUS_LABELS } from '@/utils/applicationStatus';
import { timeAgo } from '@/utils/timeAgo';

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'JOB', label: 'Việc làm' },
  { key: 'PROJECT', label: 'Dự án thời vụ' },
];
const budgetText = (n) => (n ? `${new Intl.NumberFormat('vi-VN').format(n)}đ` : 'Thỏa thuận');

// Một tin đã lưu: nhìn là biết còn hạn không, đã ứng tuyển chưa; mờ đi khi tin đã đóng / hết hạn
function SavedRow({ item, onRemove, removing }) {
  const isJob = item.type === 'JOB';
  const job = item.job;
  const to = isJob ? `/jobs/${job.id}` : `/projects/${job.id}`;
  const closedByStatus = job.status !== 'OPEN';
  const applied = item.applied_status;

  return (
    <div className={`card !p-4 border-l-4 transition-shadow hover:shadow-lift ${item.open ? 'border-l-primary-400' : 'border-l-slate-300 bg-slate-50/60'}`}>
      <div className="flex items-start gap-3.5">
        <div className={item.open ? '' : 'opacity-60'}>
          <CompanyLogo company={isJob ? job.Company : DEVHUB_COMPANY} className="w-12 h-12 text-lg" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <Link to={to} className={`font-semibold text-base leading-snug hover:text-primary-700 hover:underline ${item.open ? 'text-slate-900' : 'text-slate-500'}`}>{job.title}</Link>
            <span className={`font-bold whitespace-nowrap ${item.open ? 'text-primary-700' : 'text-slate-400'}`}>
              {isJob ? formatSalaryShort(job.salary_min, job.salary_max) : budgetText(job.budget)}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5 truncate">
            {isJob ? (brandName(job.Company?.name) || 'Doanh nghiệp') : (
              <><span className="uppercase tracking-wide">DevHub</span><span className="mx-1.5 text-slate-300">·</span><span className="font-medium text-primary-700">{job.Project?.name}</span></>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
            <MetaItem icon="mapPin">{isJob ? (shortLocation(job.location) || 'Toàn quốc') : 'Làm việc từ xa'}</MetaItem>
            <MetaItem icon="clock">{EXPERIENCE_LABELS[job.experience]}</MetaItem>
            <MetaItem icon="users">{job.quantity > 1 ? `${job.quantity} người` : ''}</MetaItem>
          </div>

          {job.Skills?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {job.Skills.slice(0, 5).map((s) => <SkillTag key={s.id} name={s.name} />)}
              {job.Skills.length > 5 && <span className="text-xs text-slate-400 self-center">+{job.Skills.length - 5}</span>}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 mt-2.5 pt-2.5 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              {isJob ? <WorkTypeBadge type={job.work_type} /> : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset bg-primary-50 text-primary-700 ring-primary-200">
                  <Icon name="sparkles" className="w-3.5 h-3.5" />Dự án thời vụ
                </span>
              )}
              {closedByStatus
                ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Đã đóng tuyển</span>
                : <DeadlineChip deadline={job.deadline} />}
              {applied && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset bg-emerald-50 text-emerald-700 ring-emerald-200">
                  <Icon name="check" className="w-3.5 h-3.5" strokeWidth={2.5} />Đã ứng tuyển{APPLICATION_STATUS_LABELS[applied] ? ` · ${APPLICATION_STATUS_LABELS[applied]}` : ''}
                </span>
              )}
              <span className="text-xs text-slate-400">Đã lưu {timeAgo(item.saved_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={removing}
                onClick={() => onRemove(item)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-60"
              >
                <Icon name="heart" filled className="w-3.5 h-3.5" />Bỏ lưu
              </button>
              {item.open && !applied && <Link to={to} className="btn-primary text-xs py-1.5 px-4 whitespace-nowrap">Ứng tuyển</Link>}
              {(!item.open || applied) && <Link to={to} className="btn-secondary text-xs py-1.5 px-4 whitespace-nowrap">Xem chi tiết</Link>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SavedJobsPage() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [tab, setTab] = useState('all');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: () => candidateApi.getSavedJobs(),
    staleTime: 0,
  });
  const items = data?.data?.data || [];
  const shown = tab === 'all' ? items : items.filter((i) => i.type === tab);
  const expired = items.filter((i) => !i.open);
  const count = (key) => (key === 'all' ? items.length : items.filter((i) => i.type === key).length);

  const refresh = () => { qc.invalidateQueries({ queryKey: ['saved-jobs'] }); qc.invalidateQueries({ queryKey: ['saved-ids'] }); };
  const remove = useMutation({
    mutationFn: (item) => candidateApi.unsaveJob(item.type === 'JOB' ? 'job' : 'project', item.job.id),
    onSuccess: () => { toast.success('Đã bỏ lưu tin'); refresh(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Chưa bỏ lưu được'),
  });
  const clean = useMutation({
    mutationFn: () => candidateApi.removeExpiredSaved(),
    onSuccess: ({ data: d }) => { toast.success(d.message); refresh(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Chưa xóa được'),
  });
  const onClean = async () => {
    if (await confirm({ title: 'Xóa tin đã đóng / hết hạn', message: `${expired.length} tin đã đóng hoặc hết hạn nộp hồ sơ sẽ bị gỡ khỏi danh sách đã lưu.`, confirmText: 'Xóa' })) clean.mutate();
  };

  return (
    <div className="space-y-6">
      <PageBanner icon="heart" title="Việc làm đã lưu" subtitle={items.length ? `Bạn đang lưu ${items.length} tin` : 'Lưu lại những tin bạn quan tâm để xem và ứng tuyển sau'}>
        <Link to="/jobs" className="btn-light">Tìm việc làm</Link>
        <Link to="/projects" className="btn-glass">Tìm dự án</Link>
      </PageBanner>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                tab === t.key ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-700'
              }`}
            >
              {t.label} <span className={tab === t.key ? 'text-white/80' : 'text-slate-400'}>({count(t.key)})</span>
            </button>
          ))}
        </div>
        {expired.length > 0 && (
          <button type="button" onClick={onClean} disabled={clean.isPending} className="text-sm font-semibold text-slate-600 hover:text-red-600 inline-flex items-center gap-1.5">
            <Icon name="trash" className="w-4 h-4" />Xóa {expired.length} tin đã đóng / hết hạn
          </button>
        )}
      </div>

      {isLoading ? <LoadingSpinner /> : isError ? (
        <div className="card text-center py-12">
          <IconBadge name="alert" tone="amber" size="lg" className="mx-auto" />
          <p className="mt-3 font-semibold text-slate-800">Không tải được danh sách đã lưu</p>
          <button type="button" className="btn-secondary mt-4" onClick={() => refetch()}>Thử lại</button>
        </div>
      ) : shown.length === 0 ? (
        <div className="card text-center py-14">
          <IconBadge name="heart" tone="blue" size="lg" className="mx-auto" />
          <p className="mt-4 font-semibold text-slate-800">{items.length ? 'Chưa có tin nào trong mục này' : 'Bạn chưa lưu tin nào'}</p>
          <p className="text-sm text-slate-500 mt-1">Bấm biểu tượng trái tim trên mỗi tin việc làm hoặc dự án để lưu lại tại đây.</p>
          <div className="flex justify-center gap-3 mt-5">
            <Link to="/jobs" className="btn-primary">Xem việc làm</Link>
            <Link to="/projects" className="btn-secondary">Xem dự án thời vụ</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {shown.map((item) => (
            <SavedRow key={item.id} item={item} onRemove={(it) => remove.mutate(it)} removing={remove.isPending && remove.variables?.id === item.id} />
          ))}
        </div>
      )}
    </div>
  );
}
