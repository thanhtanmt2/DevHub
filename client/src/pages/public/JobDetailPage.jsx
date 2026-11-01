import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApi } from '@/api/jobApi';
import { candidateApi } from '@/api/candidateApi';
import { useAuth } from '@/contexts/AuthContext';
import CvSelector from '@/components/candidate/CvSelector';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import JobDetailView from '@/components/job/JobDetailView';
import { AppliedBadge } from '@/components/job/JobParts';
import { deadlineInfo } from '@/utils/jobMeta';
import Icon from '@/components/common/Icon';
import useEscapeKey from '@/hooks/useEscapeKey';

export default function JobDetailPage() {
  const { id } = useParams();
  const { user, isCandidate, openLoginModal } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showApply, setShowApply] = useState(false);
  useEscapeKey(() => setShowApply(false), showApply);
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

  const { data: myAppsRes } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => candidateApi.getMyApplications(),
    enabled: !!user && isCandidate(),
  });

  const profile = profileRes?.data?.data;
  const applied = myAppsRes?.data?.data?.find((a) => a.job_post_id === id);

  const applyMutation = useMutation({
    mutationFn: (data) => jobApi.apply({ job_post_id: id, ...data }),
    onSuccess: () => {
      toast.success('Nộp hồ sơ ứng tuyển thành công!');
      qc.invalidateQueries({ queryKey: ['my-applications'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      setShowApply(false);
      navigate('/candidate/applications');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Ứng tuyển thất bại'),
  });

  const handleOpenApply = () => {
    // Kiểm tra candidate đã tạo profile chưa
    if (user && isCandidate() && !profile) {
      toast.error(
        <span>
          Bạn cần tạo hồ sơ ứng viên trước.{' '}
          <a href="/candidate/profile" className="underline font-semibold">Tạo ngay →</a>
        </span>,
        { duration: 5000 }
      );
      return;
    }
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

  const closed = job.status !== 'OPEN' || deadlineInfo(job.deadline).expired;
  let action = null;
  if (!user) {
    action = <button onClick={openLoginModal} className="btn-primary px-7 py-2.5">Đăng nhập để ứng tuyển</button>;
  } else if (isCandidate()) {
    if (applied) {
      action = <AppliedBadge application={applied} className="!px-4 !py-2 !text-sm" />;
    } else {
      action = (
        <button onClick={handleOpenApply} disabled={closed} className="btn-primary px-7 py-2.5">
          {closed ? 'Đã hết hạn nộp hồ sơ' : 'Ứng tuyển ngay'}
        </button>
      );
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-700 mb-4">
        <Icon name="chevronRight" className="w-4 h-4 rotate-180" />Quay lại danh sách việc làm
      </Link>
      <JobDetailView job={job} action={action} />

      {/* Apply Modal */}
      {showApply && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Ứng tuyển công việc</h2>
                  <p className="text-sm font-semibold text-primary-700 mt-0.5">{job.title}</p>
                  {job.Company && <p className="text-xs text-gray-500">Doanh nghiệp: {job.Company.name}</p>}
                </div>
                <button
                  onClick={() => setShowApply(false)}
                  className="text-gray-400 hover:text-gray-600 p-1" aria-label="Đóng"
                >
                  <Icon name="x" className="w-5 h-5" />
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
