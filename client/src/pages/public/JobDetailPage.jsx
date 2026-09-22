import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { jobApi } from '@/api/jobApi';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const formatSalary = (min, max) => {
  if (!min && !max) return 'Thỏa thuận';
  const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)} VNĐ/tháng`;
  if (min) return `Từ ${fmt(min)} VNĐ/tháng`;
  return `Đến ${fmt(max)} VNĐ/tháng`;
};

export default function JobDetailPage() {
  const { id } = useParams();
  const { user, isCandidate, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const [showApply, setShowApply] = useState(false);
  const [applyForm, setApplyForm] = useState({ cover_letter: '', cv_url: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobApi.getJobById(id),
  });

  const applyMutation = useMutation({
    mutationFn: (data) => jobApi.apply({ job_post_id: id, ...data }),
    onSuccess: () => {
      toast.success('Nộp hồ sơ thành công!');
      setShowApply(false);
      navigate('/candidate/applications');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Ứng tuyển thất bại'),
  });

  if (isLoading) return <LoadingSpinner />;
  const job = data?.data?.data;
  if (!job) return <div className="card text-center text-gray-400">Không tìm thấy việc làm</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="card mb-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <span className={`badge ${
                job.post_type === 'INTERNAL' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
              }`}>{job.post_type === 'INTERNAL' ? 'Dự án nội bộ' : 'Doanh nghiệp'}</span>
            </div>
            {job.Company && <p className="text-gray-600">{job.Company.name}</p>}
          </div>
          {isCandidate() && (
            <button onClick={() => setShowApply(true)} className="btn-primary">Ứng tuyển ngay</button>
          )}
          {!user && (
            <button onClick={openLoginModal} className="btn-primary">Đăng nhập để ứng tuyển</button>
          )}
        </div>


        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 p-4 bg-gray-50 rounded-lg">
          <div><p className="text-xs text-gray-400">Mức lương</p><p className="font-medium text-sm">{formatSalary(job.salary_min, job.salary_max)}</p></div>
          <div><p className="text-xs text-gray-400">Hình thức</p><p className="font-medium text-sm">{job.work_type || 'N/A'}</p></div>
          <div><p className="text-xs text-gray-400">Số lượng</p><p className="font-medium text-sm">{job.quantity} người</p></div>
          <div><p className="text-xs text-gray-400">Hạn nộp</p><p className="font-medium text-sm">{job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'N/A'}</p></div>
        </div>

        {/* Skills */}
        {job.Skills?.length > 0 && (
          <div className="mb-5">
            <h3 className="font-semibold mb-2">Kỹ năng yêu cầu</h3>
            <div className="flex flex-wrap gap-2">
              {job.Skills.map(s => <span key={s.id} className="badge bg-primary-100 text-primary-700">{s.name}</span>)}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="font-semibold mb-2">Mô tả công việc</h3>
          <div className="text-gray-600 text-sm whitespace-pre-wrap">{job.description}</div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApply && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Ứng tuyển: {job.title}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link CV (Google Drive / PDF)</label>
                  <input className="input-field" placeholder="https://drive.google.com/..."
                    value={applyForm.cv_url} onChange={e => setApplyForm({...applyForm, cv_url: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
                  <textarea className="input-field resize-none" rows={5}
                    placeholder="Giới thiệu bản thân và lý do bạn phù hợp với vị trí này..."
                    value={applyForm.cover_letter} onChange={e => setApplyForm({...applyForm, cover_letter: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => applyMutation.mutate(applyForm)} disabled={applyMutation.isPending} className="btn-primary flex-1">
                  {applyMutation.isPending ? 'Đang gửi...' : 'Gửi hồ sơ'}
                </button>
                <button onClick={() => setShowApply(false)} className="btn-secondary">Hủy</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
