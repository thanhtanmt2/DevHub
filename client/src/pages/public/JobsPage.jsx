import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobApi } from '@/api/jobApi';
import { skillApi } from '@/api/skillApi';
import { candidateApi } from '@/api/candidateApi';
import { useAuth } from '@/contexts/AuthContext';
import CvSelector from '@/components/candidate/CvSelector';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const WORK_TYPES = ['', 'FULL_TIME', 'PART_TIME', 'REMOTE', 'FREELANCE'];
const WORK_TYPE_LABELS = { '': 'Tất cả', FULL_TIME: 'Full-time', PART_TIME: 'Part-time', REMOTE: 'Remote', FREELANCE: 'Freelance' };

const formatSalary = (min, max) => {
  if (!min && !max) return 'Thỏa thuận';
  const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}đ`;
  if (min) return `Từ ${fmt(min)}đ`;
  return `Đến ${fmt(max)}đ`;
};

export default function JobsPage() {
  const { user, isCandidate, openLoginModal } = useAuth();
  const qc = useQueryClient();

  const [filters, setFilters] = useState({ keyword: '', work_type: '', page: 1 });
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [applyForm, setApplyForm] = useState({ cover_letter: '', cv_url: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobApi.getJobs(filters),
    keepPreviousData: true,
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
  const appliedJobIds = new Set(myAppsRes?.data?.data?.map((a) => a.job_post_id) || []);

  const { data: skillsRes } = useQuery({
    queryKey: ['public-skills'],
    queryFn: () => skillApi.getPublicSkills(),
  });

  const applyMutation = useMutation({
    mutationFn: ({ jobId, data }) => jobApi.apply({ job_post_id: jobId, ...data }),
    onSuccess: () => {
      toast.success('Nộp đơn ứng tuyển thành công!');
      setSelectedJobForApply(null);
      setApplyForm({ cover_letter: '', cv_url: '' });
      qc.invalidateQueries({ queryKey: ['my-applications'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi nộp đơn');
    }
  });

  const jobs = data?.data?.data || [];
  const pagination = data?.data?.pagination;
  const skills = skillsRes?.data?.data || [];

  const handleApplyClick = (job) => {
    if (!user) {
      openLoginModal();
      return;
    }
    if (!isCandidate()) {
      toast.error('Chỉ tài khoản Ứng viên mới có thể nộp đơn');
      return;
    }
    setSelectedJobForApply(job);
    setApplyForm({
      cover_letter: '',
      cv_url: profile?.cv_url || ''
    });
  };

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!selectedJobForApply) return;
    if (!applyForm.cv_url) {
      toast.error('Vui lòng chọn hoặc tải lên file CV để nộp hồ sơ');
      return;
    }
    applyMutation.mutate({ jobId: selectedJobForApply.id, data: applyForm });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            className="input-field flex-1"
            placeholder="Tìm theo vị trí, công nghệ, công ty..."
            value={filters.keyword}
            onChange={e => setFilters({ ...filters, keyword: e.target.value, page: 1 })}
          />
          <div className="flex gap-2 flex-wrap">
            {WORK_TYPES.map(type => (
              <button key={type}
                onClick={() => setFilters({ ...filters, work_type: type, page: 1 })}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filters.work_type === type ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {WORK_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Tìm thấy <strong>{pagination?.total || 0}</strong> công việc
          </p>

          {jobs.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🔍</p>
              <p>Không tìm thấy công việc phù hợp</p>
            </div>
          ) : (
            <div className={`flex flex-col ${selectedJob ? 'lg:flex-row gap-6' : ''}`}>
              {/* Nửa bên trái: Danh sách công việc */}
              <div className={`${selectedJob ? 'w-full lg:w-1/2 space-y-4' : 'w-full space-y-4'}`}>
                {jobs.map(job => {
                  const isSelected = selectedJob?.id === job.id;

                  return (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`card cursor-pointer transition-all duration-200 border-2 ${
                        isSelected
                          ? 'border-primary-600 ring-2 ring-primary-100 bg-primary-50/10 shadow-md'
                          : 'border-transparent hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg text-gray-900 hover:text-primary-600">
                              {job.title}
                            </h3>
                          </div>
                          {job.Company && <p className="text-sm text-gray-500 mb-2">{job.Company.name}</p>}
                          <div className="flex flex-wrap gap-1 mb-2">
                            {job.Skills?.slice(0, 5).map(s => (
                              <span key={s.id} className="badge bg-gray-100 text-gray-600 text-xs">{s.name}</span>
                            ))}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="font-semibold text-green-700">{formatSalary(job.salary_min, job.salary_max)}</span>
                            {job.work_type && <span>🏠 {WORK_TYPE_LABELS[job.work_type]}</span>}
                            {job.deadline && <span>⏰ HSD: {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setFilters({ ...filters, page: p })}
                        className={`w-9 h-9 rounded-lg text-sm font-medium ${
                          p === filters.page ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}>
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Nửa bên phải: Khung chi tiết công việc */}
              {selectedJob && (
                <div className="w-full lg:w-1/2 sticky top-20 self-start animate-fade-in mt-6 lg:mt-0">
                  <div className="card border border-primary-200 shadow-xl bg-white max-h-[calc(100vh-110px)] overflow-y-auto space-y-6">
                    {/* Header with Close button */}
                    <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                      <div>
                        <span className="badge bg-blue-100 text-blue-700 text-xs font-semibold mb-1 inline-block">
                          Doanh nghiệp tuyển dụng
                        </span>
                        <h2 className="text-xl font-bold text-gray-900">{selectedJob.title}</h2>
                        {selectedJob.Company && (
                          <p className="text-sm font-semibold text-primary-600 mt-0.5">
                            🏢 {selectedJob.Company.name}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedJob(null)}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 text-lg transition-colors"
                        title="Đóng khung chi tiết"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl flex items-center justify-between gap-4 border border-blue-100">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Mức lương</p>
                        <p className="text-lg font-bold text-blue-800">
                          {formatSalary(selectedJob.salary_min, selectedJob.salary_max)}
                        </p>
                      </div>

                      {appliedJobIds.has(selectedJob.id) ? (
                        <div className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                          <span className="font-bold">✓</span> Đã nộp hồ sơ
                        </div>
                      ) : (
                        <button
                          onClick={() => handleApplyClick(selectedJob)}
                          className="btn-primary px-6 py-2.5 shadow-md flex items-center gap-1.5 whitespace-nowrap"
                        >
                          Ứng tuyển ngay ↗
                        </button>
                      )}
                    </div>

                    {/* General Info Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-gray-500">Hình thức làm việc:</p>
                        <p className="font-semibold text-gray-800 text-sm mt-0.5">
                          {WORK_TYPE_LABELS[selectedJob.work_type] || selectedJob.work_type || 'Thỏa thuận'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Số lượng cần tuyển:</p>
                        <p className="font-semibold text-gray-800 text-sm mt-0.5">
                          {selectedJob.quantity || 1} người
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Địa điểm:</p>
                        <p className="font-medium text-gray-800 mt-0.5">
                          {selectedJob.location || 'Toàn quốc / Remote'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Hạn nộp hồ sơ:</p>
                        <p className="font-medium text-gray-800 mt-0.5">
                          {selectedJob.deadline
                            ? new Date(selectedJob.deadline).toLocaleDateString('vi-VN')
                            : 'Còn hạn'}
                        </p>
                      </div>
                    </div>

                    {/* Kỹ năng yêu cầu */}
                    {selectedJob.Skills?.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                          Kỹ năng yêu cầu
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedJob.Skills.map(s => (
                            <span key={s.id} className="badge bg-primary-50 text-primary-700 border border-primary-200 text-xs px-2.5 py-1">
                              {s.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mô tả công việc */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                        Mô tả công việc & Yêu cầu
                      </h3>
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                        {selectedJob.description}
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Apply Modal */}
      {selectedJobForApply && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-1">Ứng tuyển công việc</h2>
            <p className="text-sm font-medium text-primary-600 mb-1">{selectedJobForApply.title}</p>
            <p className="text-xs text-gray-500 mb-4">🏢 Doanh nghiệp: {selectedJobForApply.Company?.name}</p>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              {/* CV Selector */}
              <CvSelector
                profile={profile}
                value={applyForm.cv_url}
                onChange={(url) => setApplyForm({ ...applyForm, cv_url: url })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thư giới thiệu (Cover Letter)
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Giới thiệu năng lực, kinh nghiệm thực chiến..."
                  value={applyForm.cover_letter}
                  onChange={(e) => setApplyForm({ ...applyForm, cover_letter: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedJobForApply(null)}
                  className="btn-secondary"
                  disabled={applyMutation.isPending}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={applyMutation.isPending}
                >
                  {applyMutation.isPending ? 'Đang gửi...' : 'Xác nhận nộp đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
