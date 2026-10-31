import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { jobApi } from '@/api/jobApi';
import Icon from '@/components/common/Icon';
import useEscapeKey from '@/hooks/useEscapeKey';

function addDaysLocalIso(days) {
  const d = new Date(Date.now() + days * 86400000);
  d.setHours(23, 59, 0, 0);
  const offsetMs = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offsetMs).toISOString().slice(0, 16);
}

export default function ReopenJobModal({ job, onClose }) {
  const qc = useQueryClient();
  useEscapeKey(onClose);

  const isOldExpired = job?.deadline && new Date(job.deadline) < new Date();
  const initialDeadline = !job?.deadline
    ? ''
    : isOldExpired
    ? addDaysLocalIso(30)
    : job.deadline.slice(0, 16);

  const [noDeadline, setNoDeadline] = useState(!job?.deadline);
  const [deadline, setDeadline] = useState(initialDeadline || addDaysLocalIso(30));

  const reopenMut = useMutation({
    mutationFn: (payload) => jobApi.reopenJob(job.id, payload),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['employer-jobs'] });
      qc.invalidateQueries({ queryKey: ['employer-job', job.id] });
      toast.success(res.data?.message || 'Đã mở lại tin tuyển dụng');
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Không thể mở lại tin tuyển dụng');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noDeadline) {
      if (!deadline) {
        return toast.error('Vui lòng chọn hạn nộp hồ sơ mới hoặc tích chọn Không giới hạn');
      }
      if (new Date(deadline) <= new Date()) {
        return toast.error('Hạn nộp hồ sơ mới phải sau thời điểm hiện tại');
      }
    }
    reopenMut.mutate({
      deadline: noDeadline ? null : new Date(deadline).toISOString(),
    });
  };

  if (!job) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Icon name="refresh" className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-gray-900">Mở lại tin tuyển dụng</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <p className="text-xs text-gray-500">Tin tuyển dụng:</p>
            <p className="font-semibold text-sm text-gray-900 mt-0.5">{job.title}</p>
          </div>

          {isOldExpired && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
              Hạn nộp hồ sơ cũ của tin này đã qua. Hệ thống đã tự động đề xuất gia hạn thêm <strong>30 ngày</strong> (bạn có thể tùy chỉnh bên dưới).
            </div>
          )}

          <div className="space-y-2.5">
            <label className="block text-sm font-semibold text-gray-700">
              Hạn chót nộp hồ sơ mới
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={noDeadline}
                onChange={(e) => setNoDeadline(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span>Nhận hồ sơ không giới hạn thời gian</span>
            </label>

            {!noDeadline && (
              <>
                <input
                  type="datetime-local"
                  className="input-field"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-xs text-gray-400 mr-1">Gia hạn nhanh:</span>
                  {[7, 15, 30, 60].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDeadline(addDaysLocalIso(d))}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                    >
                      +{d} ngày
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="btn-secondary text-sm">
              Hủy
            </button>
            <button
              type="submit"
              disabled={reopenMut.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              <Icon name="refresh" className="w-4 h-4" />
              {reopenMut.isPending ? 'Đang mở lại...' : 'Mở lại tin ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
