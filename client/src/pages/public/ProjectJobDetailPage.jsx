import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectJobApi } from '@/api/projectJobApi';
import { candidateApi } from '@/api/candidateApi';
import { useAuth } from '@/contexts/AuthContext';
import CvSelector from '@/components/candidate/CvSelector';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const formatSalary = (amount) => {
  if (!amount) return 'Thỏa thuận';
  return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
};

export default function ProjectJobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCandidate, openLoginModal } = useAuth();
  const qc = useQueryClient();

  const [showApply, setShowApply] = useState(false);
  const [applyForm, setApplyForm] = useState({ cover_letter: '', cv_url: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['project-job', id],
    queryFn: () => projectJobApi.getProjectJobById(id),
  });

  const { data: profileRes } = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: () => candidateApi.getProfile(),
    enabled: !!user && isCandidate(),
  });

  const { data: myAppsRes } = useQuery({
    queryKey: ['my-project-applications'],
    queryFn: () => projectJobApi.getMyProjectApplications(),
    enabled: !!user && isCandidate(),
  });

  const profile = profileRes?.data?.data;
  const appliedIds = new Set(myAppsRes?.data?.data?.map((a) => a.project_job_id) || []);
  const isApplied = appliedIds.has(id);

  const applyMutation = useMutation({
    mutationFn: (data) => projectJobApi.applyProjectJob(id, data),
    onSuccess: () => {
      toast.success('Nộp đơn ứng tuyển dự án thành công!');
      setShowApply(false);
      qc.invalidateQueries({ queryKey: ['my-project-applications'] });
      navigate('/candidate/applications');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi nộp đơn'),
  });

  const handleOpenApply = () => {
    if (!user) { openLoginModal(); return; }
    if (!isCandidate()) { toast.error('Chỉ tài khoản Ứng viên mới có thể ứng tuyển'); return; }
    setApplyForm({ cover_letter: '', cv_url: profile?.cv_url || '' });
    setShowApply(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!applyForm.cv_url) {
      toast.error('Vui lòng chọn hoặc tải lên CV để ứng tuyển');
      return;
    }
    applyMutation.mutate(applyForm);
  };

  if (isLoading) return <LoadingSpinner />;
  const job = data?.data?.data;
  if (!job) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <p className="text-5xl mb-4">😕</p>
      <p className="text-gray-500 font-medium">Không tìm thấy vị trí dự án này</p>
      <button onClick={() => navigate('/projects')} className="btn-primary mt-4">
        ← Quay lại danh sách dự án
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <button onClick={() => navigate('/projects')} className="hover:text-primary-600 transition-colors">
          Dự án thời vụ
        </button>
        <span>/</span>
        <span className="text-gray-700 font-medium truncate">{job.title}</span>
      </nav>

      <div className="card mb-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5 pb-5 border-b border-gray-100">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="badge bg-purple-100 text-purple-700 text-xs font-semibold">Dự án thời vụ</span>
              <span className={`badge text-xs font-semibold ${job.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {job.status === 'OPEN' ? '🟢 Đang tuyển' : '🔴 Đã đóng'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{job.title}</h1>
            <p className="text-sm font-semibold text-primary-700">📁 Dự án: {job.Project?.name}</p>
          </div>

          <div className="ml-4 flex-shrink-0">
            {isApplied ? (
              <div className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                ✓ Đã ứng tuyển
              </div>
            ) : job.status === 'OPEN' ? (
              <button onClick={handleOpenApply} className="btn-primary shadow-sm px-6 py-2.5">
                Ứng tuyển vị trí này
              </button>
            ) : null}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div>
            <p className="text-xs text-gray-400">Thù lao</p>
            <p className="font-semibold text-sm text-green-700 mt-0.5">{formatSalary(job.budget)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Số lượng</p>
            <p className="font-medium text-sm mt-0.5">{job.quantity || 1} người</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Hạn nộp hồ sơ</p>
            <p className="font-medium text-sm mt-0.5">
              {job.deadline ? new Date(job.deadline).toLocaleDateString('vi-VN') : 'Không giới hạn'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Trạng thái</p>
            <p className="font-medium text-sm mt-0.5">{job.status === 'OPEN' ? 'Đang tuyển' : 'Đã đóng'}</p>
          </div>
        </div>

        {/* Skills */}
        {job.Skills?.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-gray-900 mb-2 uppercase tracking-wide">Kỹ năng yêu cầu</h3>
            <div className="flex flex-wrap gap-2">
              {job.Skills.map((s) => (
                <span key={s.id} className="badge bg-primary-50 text-primary-700 border border-primary-200">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <h3 className="font-semibold text-sm text-gray-900 mb-2 uppercase tracking-wide">Mô tả công việc</h3>
          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            {job.description || 'Chưa có mô tả chi tiết.'}
          </div>
        </div>

        {/* Project Info */}
        {job.Project && (
          <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl">
            <h3 className="font-semibold text-sm text-gray-900 mb-3 uppercase tracking-wide">Về dự án {job.Project.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs mb-3 bg-white p-3 rounded-lg border border-purple-100">
              <div>
                <p className="text-gray-400">Ngân sách dự án</p>
                <p className="font-semibold text-gray-800 mt-0.5">{formatSalary(job.Project.budget)}</p>
              </div>
              <div>
                <p className="text-gray-400">Trạng thái</p>
                <p className="font-semibold text-gray-800 mt-0.5">{job.Project.status || 'Đang thực hiện'}</p>
              </div>
              {job.Project.expected_end_date && (
                <div>
                  <p className="text-gray-400">Dự kiến hoàn thành</p>
                  <p className="font-medium text-gray-800 mt-0.5">
                    {new Date(job.Project.expected_end_date).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
            {job.Project.description && (
              <p className="text-sm text-gray-600 leading-relaxed">{job.Project.description}</p>
            )}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApply && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Ứng tuyển vị trí dự án</h2>
                  <p className="text-sm font-semibold text-primary-600 mt-0.5">{job.title}</p>
                  <p className="text-xs text-gray-500">📁 Dự án: {job.Project?.name}</p>
                </div>
                <button
                  onClick={() => setShowApply(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">
                    Thư giới thiệu (Cover Letter) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="input-field resize-none"
                    rows={4}
                    required
                    placeholder="Giới thiệu năng lực, kinh nghiệm thực chiến và cam kết hoàn thành dự án..."
                    value={applyForm.cover_letter}
                    onChange={(e) => setApplyForm({ ...applyForm, cover_letter: e.target.value })}
                  />
                </div>

                <CvSelector
                  profile={profile}
                  value={applyForm.cv_url}
                  onChange={(url) => setApplyForm({ ...applyForm, cv_url: url })}
                />

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
