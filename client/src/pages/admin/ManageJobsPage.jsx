import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const STATUS_LABELS = {
  PENDING_APPROVAL: { text: 'Chờ duyệt', cls: 'bg-yellow-100 text-yellow-700' },
  OPEN:             { text: 'Đã duyệt',  cls: 'bg-green-100 text-green-700'  },
  HIDDEN:           { text: 'Từ chối',   cls: 'bg-red-100 text-red-700'      },
  CLOSED:           { text: 'Đã đóng',   cls: 'bg-gray-100 text-gray-600'    },
  DRAFT:            { text: 'Nháp',      cls: 'bg-gray-100 text-gray-500'    },
};

const WORK_TYPE_LABELS = {
  FREELANCE: 'Freelance',
  PART_TIME: 'Part-time',
  REMOTE:    'Remote',
  FULL_TIME: 'Full-time',
};

function fmt(n) {
  if (!n) return '—';
  return Number(n).toLocaleString('vi-VN') + ' đ';
}

export default function ManageJobsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('PENDING_APPROVAL');
  const [selectedJob, setSelectedJob] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-jobs', statusFilter],
    queryFn: () => adminApi.getJobs({ post_type: 'PARTNER', status: statusFilter || undefined }),
  });
  const jobs = data?.data?.data || [];

  const approveMutation = useMutation({
    mutationFn: (id) => adminApi.approveJob(id),
    onSuccess: () => {
      toast.success('✅ Đã duyệt tin tuyển dụng');
      qc.invalidateQueries({ queryKey: ['admin-jobs'] });
      setSelectedJob(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Lỗi khi duyệt'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.rejectJob(id, { reason }),
    onSuccess: () => {
      toast.success('🚫 Đã từ chối tin tuyển dụng');
      qc.invalidateQueries({ queryKey: ['admin-jobs'] });
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedJob(null);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Lỗi khi từ chối'),
  });

  return (
    <div className="flex gap-6 h-[calc(100vh-100px)]">
      {/* Left: Job List */}
      <div className="w-[380px] flex-shrink-0 flex flex-col gap-3">
        {/* Filter tabs */}
        <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
          {[
            { value: 'PENDING_APPROVAL', label: 'Chờ duyệt' },
            { value: 'OPEN', label: 'Đã duyệt' },
            { value: 'HIDDEN', label: 'Từ chối' },
            { value: '', label: 'Tất cả' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => { setStatusFilter(tab.value); setSelectedJob(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === tab.value ? 'bg-white shadow text-primary-700' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {isLoading ? (
            <LoadingSpinner />
          ) : jobs.length === 0 ? (
            <div className="text-center text-gray-400 py-16 text-sm">Không có tin tuyển dụng nào</div>
          ) : (
            jobs.map(job => {
              const st = STATUS_LABELS[job.status] || {};
              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedJob?.id === job.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{job.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">
                        🏢 {job.Company?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        👤 {job.creator?.full_name || '—'}
                      </p>
                    </div>
                    <span className={`badge text-xs shrink-0 ${st.cls}`}>{st.text}</span>
                  </div>
                  <div className="flex gap-3 mt-2 text-xs text-gray-500">
                    <span>{WORK_TYPE_LABELS[job.work_type] || job.work_type}</span>
                    {job.salary_min && <span>💰 {fmt(job.salary_min)} – {fmt(job.salary_max)}</span>}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(job.created_at || job.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right: Job Detail */}
      <div className="flex-1 min-w-0">
        {!selectedJob ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <span className="text-5xl mb-4">📋</span>
            <p className="text-sm">Chọn một tin tuyển dụng để xem chi tiết</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 h-full overflow-y-auto p-6 flex flex-col gap-5">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedJob.title}</h2>
                <p className="text-sm text-gray-500 mt-1">🏢 {selectedJob.Company?.name}</p>
              </div>
              <span className={`badge ${STATUS_LABELS[selectedJob.status]?.cls}`}>
                {STATUS_LABELS[selectedJob.status]?.text}
              </span>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Người đăng', value: selectedJob.creator?.full_name || '—' },
                { label: 'Email', value: selectedJob.creator?.email || '—' },
                { label: 'Loại hình', value: WORK_TYPE_LABELS[selectedJob.work_type] || '—' },
                { label: 'Địa điểm', value: selectedJob.location || '—' },
                { label: 'Mức lương', value: selectedJob.salary_min ? `${fmt(selectedJob.salary_min)} – ${fmt(selectedJob.salary_max)}` : 'Thỏa thuận' },
                { label: 'Số lượng', value: selectedJob.quantity || 1 },
                { label: 'Hạn nộp', value: selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString('vi-VN') : '—' },
                { label: 'Địa chỉ công ty', value: selectedJob.Company?.address || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* Skills */}
            {selectedJob.Skills?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Kỹ năng yêu cầu</p>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.Skills.map(s => (
                    <span key={s.id} className="badge bg-blue-100 text-blue-700">{s.name}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mô tả công việc</p>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-100">
                {selectedJob.description}
              </div>
            </div>

            {/* Actions */}
            {selectedJob.status === 'PENDING_APPROVAL' && (
              <div className="flex gap-3 mt-auto pt-2">
                <button
                  disabled={approveMutation.isPending}
                  onClick={() => approveMutation.mutate(selectedJob.id)}
                  className="btn-primary flex-1 py-3"
                >
                  {approveMutation.isPending ? 'Đang duyệt...' : '✅ Duyệt tin'}
                </button>
                <button
                  disabled={rejectMutation.isPending}
                  onClick={() => setShowRejectModal(true)}
                  className="flex-1 py-3 rounded-xl border border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-colors"
                >
                  🚫 Từ chối
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Từ chối tin tuyển dụng</h3>
            <p className="text-sm text-gray-600 mb-4">
              Nhập lý do từ chối tin "<strong>{selectedJob?.title}</strong>":
            </p>
            <textarea
              className="input-field w-full h-28 resize-none"
              placeholder="Ví dụ: Nội dung không phù hợp, thiếu thông tin lương thưởng..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowRejectModal(false); setRejectReason(''); }}
                className="flex-1 py-2 border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Huỷ
              </button>
              <button
                disabled={rejectMutation.isPending}
                onClick={() => rejectMutation.mutate({ id: selectedJob.id, reason: rejectReason })}
                className="flex-1 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                {rejectMutation.isPending ? 'Đang từ chối...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
