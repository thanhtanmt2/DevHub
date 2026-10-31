import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { jobApi } from '@/api/jobApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Icon, { IconBadge } from '@/components/common/Icon';
import JobDetailView from '@/components/job/JobDetailView';
import ApplicantsPanel from '@/components/employer/ApplicantsPanel';
import JobFormModal from '@/components/employer/JobFormModal';
import ReopenJobModal from '@/components/employer/ReopenJobModal';
import { useConfirm } from '@/components/common/ConfirmDialog';
import { JOB_STATUS_META } from '@/utils/jobMeta';

// Lời nhắn theo trạng thái tin
const STATUS_NOTE = {
  PENDING_APPROVAL: { cls: 'bg-amber-50 border-amber-200 text-amber-800', text: 'Tin đang chờ Admin duyệt nên chưa hiển thị cho ứng viên. Bạn sẽ nhận thông báo ngay khi có kết quả.' },
  HIDDEN: { cls: 'bg-rose-50 border-rose-200 text-rose-800', text: 'Tin đã bị Admin từ chối. Bấm "Sửa tin" để chỉnh sửa — khi lưu, tin sẽ tự được gửi lại để Admin duyệt.' },
  CLOSED: { cls: 'bg-red-50 border-red-200 text-red-700', text: 'Tin đã đóng: ứng viên không còn thấy và không nộp thêm hồ sơ được. Bạn có thể bấm "Mở lại tin" bất cứ lúc nào để tiếp tục tuyển dụng.' },
  DRAFT: { cls: 'bg-slate-100 border-slate-200 text-slate-600', text: 'Đây là bản nháp, chưa được đăng. Bấm "Đăng tin (Gửi duyệt)" khi bạn đã sẵn sàng công bố.' },
};

// Chi tiết một tin tuyển dụng của nhà tuyển dụng: xem nội dung tin + xử lý hồ sơ ứng viên ngay trong tin
export default function EmployerJobDetailPage() {
  const { id } = useParams();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'applications' ? 'applications' : 'info';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [modalMode, setModalMode] = useState(null); // null | 'edit' | 'duplicate'
  const [showReopen, setShowReopen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['employer-job', id],
    queryFn: () => jobApi.getMyJob(id),
    retry: false,
    refetchInterval: 20000,
  });
  const job = data?.data?.data;

  const closeMut = useMutation({
    mutationFn: () => jobApi.closeJob(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['employer-job', id] });
      qc.invalidateQueries({ queryKey: ['employer-jobs'] });
      toast.success('Đã đóng tin tuyển dụng');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể đóng tin'),
  });

  const publishDraftMut = useMutation({
    mutationFn: () => jobApi.updateJob(id, { is_draft: false }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['employer-job', id] });
      qc.invalidateQueries({ queryKey: ['employer-jobs'] });
      toast.success(res.data?.message || 'Đã gửi bản nháp để Admin duyệt');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể đăng bản nháp'),
  });

  const setTab = (t) => setParams(t === 'applications' ? { tab: 'applications' } : {}, { replace: true });

  if (isLoading) return <LoadingSpinner />;
  if (isError || !job) {
    return (
      <div className="card text-center py-14">
        <IconBadge name="search" size="lg" className="mx-auto mb-3" />
        <p className="font-semibold text-slate-800">Không tìm thấy tin tuyển dụng</p>
        <p className="text-sm text-slate-500 mt-1">Tin có thể đã bị xóa hoặc không thuộc doanh nghiệp của bạn.</p>
        <Link to="/employer/jobs" className="btn-primary inline-block mt-4">← Về danh sách tin</Link>
      </div>
    );
  }

  const st = JOB_STATUS_META[job.status] || JOB_STATUS_META.DRAFT;
  const note = STATUS_NOTE[job.status];
  const total = Number(job.application_count) || 0;
  const pending = Number(job.pending_count) || 0;

  const askClose = async () => {
    if (await confirm({ title: 'Đóng tin tuyển dụng', message: `Đóng tin "${job.title}"? Ứng viên sẽ không thể nộp thêm hồ sơ vào tin này.`, confirmText: 'Đóng tin', tone: 'danger' })) {
      closeMut.mutate();
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <button onClick={() => navigate('/employer/jobs')} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-3">
          <Icon name="chevronRight" className="w-4 h-4 rotate-180" />Tin tuyển dụng
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{job.title}</h1>
              <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold ${st.cls}`}>{st.label}</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5"><Icon name="inbox" className="w-4 h-4" />{total} hồ sơ{pending > 0 && <strong className="text-primary-700">· {pending} chờ xem</strong>}</span>
              <span className="inline-flex items-center gap-1.5"><Icon name="eye" className="w-4 h-4" />{job.view_count || 0} lượt xem</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {job.status === 'OPEN' && (
              <Link to={`/jobs/${job.id}`} target="_blank" className="btn-secondary text-sm">
                <Icon name="external" className="w-4 h-4" />Xem như ứng viên
              </Link>
            )}
            {job.status === 'DRAFT' && (
              <button
                onClick={() => publishDraftMut.mutate()}
                disabled={publishDraftMut.isPending}
                className="btn-primary text-sm"
              >
                <Icon name="upload" className="w-4 h-4" />Đăng tin (Gửi duyệt)
              </button>
            )}
            <button onClick={() => setModalMode('duplicate')} className="btn-secondary text-sm">
              <Icon name="copy" className="w-4 h-4" />Nhân bản
            </button>
            <button onClick={() => setModalMode('edit')} className="btn-secondary text-sm">
              <Icon name="pencil" className="w-4 h-4" />Sửa tin
            </button>
            {job.status === 'CLOSED' ? (
              <button
                onClick={() => setShowReopen(true)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Icon name="refresh" className="w-4 h-4" />Mở lại tin
              </button>
            ) : (
              <button onClick={askClose} disabled={closeMut.isPending} className="text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
                <Icon name="lock" className="w-4 h-4 mr-1" />Đóng tin
              </button>
            )}
          </div>
        </div>
      </div>

      {note && <p className={`text-sm border rounded-xl px-4 py-3 ${note.cls}`}>{note.text}</p>}

      {/* Tab */}
      <div className="flex gap-1 border-b border-slate-200">
        {[
          ['info', 'Nội dung tin', null],
          ['applications', 'Hồ sơ ứng tuyển', total],
        ].map(([key, label, count]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors inline-flex items-center gap-2 ${
              tab === key ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}>
            {label}
            {count !== null && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${pending > 0 && key === 'applications' ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'applications' ? <ApplicantsPanel jobId={job.id} /> : <JobDetailView job={job} showTitle={false} />}

      {modalMode && <JobFormModal job={job} mode={modalMode} onClose={() => setModalMode(null)} />}
      {showReopen && <ReopenJobModal job={job} onClose={() => setShowReopen(false)} />}
    </div>
  );
}
