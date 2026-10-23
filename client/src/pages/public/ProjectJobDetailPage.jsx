import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectJobApi } from '@/api/projectJobApi';
import { candidateApi } from '@/api/candidateApi';
import { useAuth } from '@/contexts/AuthContext';
import CvSelector from '@/components/candidate/CvSelector';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import Icon, { IconBadge } from '@/components/common/Icon';
import useEscapeKey from '@/hooks/useEscapeKey';
import ProjectJobDetailView from '@/components/job/ProjectJobDetailView';
import { deadlineInfo } from '@/utils/jobMeta';

export default function ProjectJobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCandidate, openLoginModal } = useAuth();
  const qc = useQueryClient();

  const [showApply, setShowApply] = useState(false);
  useEscapeKey(() => setShowApply(false), showApply);
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
    if (deadlineInfo(job.deadline).expired) { toast.error('Vị trí dự án này đã hết hạn nộp hồ sơ'); return; }
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
      <IconBadge name="search" size="lg" className="mx-auto mb-4" />
      <p className="text-gray-500 font-medium">Không tìm thấy vị trí dự án này</p>
      <button onClick={() => navigate('/projects')} className="btn-primary mt-4">
        ← Quay lại danh sách dự án
      </button>
    </div>
  );

  const expired = deadlineInfo(job.deadline).expired;
  let action = null;
  if (isApplied) {
    action = (
      <span className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
        <Icon name="check" className="w-4 h-4" strokeWidth={2.5} /> Đã ứng tuyển
      </span>
    );
  } else if (job.status === 'OPEN') {
    action = (
      <button onClick={handleOpenApply} disabled={expired} className="btn-primary px-7 py-2.5">
        {expired ? 'Đã hết hạn nộp hồ sơ' : 'Ứng tuyển vị trí này'}
      </button>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-4">
        <Icon name="chevronRight" className="w-4 h-4 rotate-180" />Quay lại danh sách dự án
      </Link>
      <ProjectJobDetailView job={job} action={action} />

      {/* Apply Modal */}
      {showApply && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Ứng tuyển vị trí dự án</h2>
                  <p className="text-sm font-semibold text-primary-600 mt-0.5">{job.title}</p>
                  <p className="text-xs text-gray-500"><Icon name="folder" className="w-3.5 h-3.5 mr-1" />Dự án: {job.Project?.name}</p>
                </div>
                <button
                  onClick={() => setShowApply(false)}
                  className="text-gray-400 hover:text-gray-600 p-1" aria-label="Đóng"
                >
                  <Icon name="x" className="w-5 h-5" />
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
