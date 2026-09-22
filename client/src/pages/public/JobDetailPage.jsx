import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { jobApi } from '@/api/jobApi';
import { candidateApi } from '@/api/candidateApi';
import { useAuth } from '@/contexts/AuthContext';
import CvSelector from '@/components/candidate/CvSelector';
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

  const { data: profileRes } = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: () => candidateApi.getProfile(),
    enabled: !!user && isCandidate(),
  });

  const profile = profileRes?.data?.data;

  const applyMutation = useMutation({
    mutationFn: (data) => jobApi.apply({ job_post_id: id, ...data }),
    onSuccess: () => {
      toast.success('Nộp hồ sơ ứng tuyển thành công!');
      setShowApply(false);
      navigate('/candidate/applications');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Ứng tuyển thất bại'),
  });

  const handleOpenApply = () => {
    setApplyForm({
      cover_letter: '',
      cv_url: profile?.cv_url || '',
    });
    setShowApply(true);
  };

  const handleSubmitApply = (e) => {
    e.preventDefault();
    if (!applyForm.cv_url) {
      toast.error('Vui lòng chọn hoặc tải lên CV để ứng tuyển');
      return;
    }
    applyMutation.mutate(applyForm);
  };

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
              <span className="badge bg-blue-100 text-blue-700 text-xs font-semibold">
                Doanh nghiệp tuyển dụng
              </span>
            </div>
            {job.Company && <p className="text-gray-600 font-medium">{job.Company.name}</p>}
          </div>

          {isCandidate() && (
            <button onClick={handleOpenApply} className="btn-primary shadow-sm px-6 py-2.5">
              Ứng tuyển ngay
            </button>
          )}
          {!user && (
            <button onClick={openLoginModal} className="btn-primary">
              Đăng nhập để ứng tuyển
            </button>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Mức lương</p>
            <p className="font-semibold text-sm text-green-700 mt-0.5">{formatSalary(job.salary_min, job.salary_max)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Hình thức</p>
            <p className="font-medium text-sm mt-0.5">{job.work_type || 'Thỏa thuận'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Số lượng</p>
            <p className="font-medium text-sm mt-0.5">{job.quantity || 1} người</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Hạn nộp</p>
            <p className="font-medium text-sm mt-0.5">{job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'Còn hạn'}</p>
          </div>
        </div>

        {/* Skills */}
        {job.Skills?.length > 0 && (
          <div className="mb-5">
            <h3 className="font-semibold text-sm text-gray-900 mb-2 uppercase tracking-wide">Kỹ năng yêu cầu</h3>
            <div className="flex flex-wrap gap-2">
              {job.Skills.map(s => (
                <span key={s.id} className="badge bg-primary-50 text-primary-700 border border-primary-200">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="font-semibold text-sm text-gray-900 mb-2 uppercase tracking-wide">Mô tả công việc</h3>
          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            {job.description}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApply && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Ứng tuyển công việc</h2>
                  <p className="text-sm font-semibold text-primary-600 mt-0.5">{job.title}</p>
                  {job.Company && <p className="text-xs text-gray-500">Doanh nghiệp: {job.Company.name}</p>}
                </div>
                <button
                  onClick={() => setShowApply(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitApply} className="space-y-4">
                {/* CV Selector */}
                <CvSelector
                  profile={profile}
                  value={applyForm.cv_url}
                  onChange={(url) => setApplyForm({ ...applyForm, cv_url: url })}
                />

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Thư giới thiệu (Cover Letter)
                  </label>
                  <textarea
                    className="input-field resize-none"
                    rows={4}
                    placeholder="Giới thiệu bản thân, kinh nghiệm và lý do bạn là ứng viên phù hợp nhất..."
                    value={applyForm.cover_letter}
                    onChange={(e) => setApplyForm({ ...applyForm, cover_letter: e.target.value })}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowApply(false)}
                    className="btn-secondary flex-1"
                    disabled={applyMutation.isPending}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={applyMutation.isPending || !applyForm.cv_url}
                    className="btn-primary flex-1 shadow-md"
                  >
                    {applyMutation.isPending ? 'Đang gửi hồ sơ...' : 'Nộp hồ sơ ứng tuyển'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
