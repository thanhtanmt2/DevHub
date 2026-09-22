import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectJobApi } from '@/api/projectJobApi';
import { candidateApi } from '@/api/candidateApi';
import { skillApi } from '@/api/skillApi';
import { useAuth } from '@/contexts/AuthContext';
import CvSelector from '@/components/candidate/CvSelector';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const formatSalary = (amount) => {
  if (!amount) return 'Thỏa thuận';
  return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
};

export default function ProjectsPage() {
  const { user, isCandidate, openLoginModal } = useAuth();
  const qc = useQueryClient();

  const [filters, setFilters] = useState({ keyword: '', skill_id: '', page: 1 });
  const [activeDetailJob, setActiveDetailJob] = useState(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [applyForm, setApplyForm] = useState({ cover_letter: '', cv_url: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['project-jobs', filters],
    queryFn: () => projectJobApi.getProjectJobs(filters),
    keepPreviousData: true,
  });

  const { data: myAppsRes } = useQuery({
    queryKey: ['my-project-applications'],
    queryFn: () => projectJobApi.getMyProjectApplications(),
    enabled: !!user && isCandidate(),
  });

  const { data: profileRes } = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: () => candidateApi.getProfile(),
    enabled: !!user && isCandidate(),
  });

  const profile = profileRes?.data?.data;
  const appliedJobIds = new Set(myAppsRes?.data?.data?.map((a) => a.project_job_id) || []);

  const { data: skillsRes } = useQuery({
    queryKey: ['public-skills'],
    queryFn: () => skillApi.getPublicSkills(),
  });

  const applyMutation = useMutation({
    mutationFn: ({ jobId, data }) => projectJobApi.applyProjectJob(jobId, data),
    onSuccess: () => {
      toast.success('Nộp đơn ứng tuyển dự án thành công!');
      setSelectedJobForApply(null);
      setApplyForm({ cover_letter: '', cv_url: '' });
      qc.invalidateQueries(['project-jobs']);
      qc.invalidateQueries(['my-project-applications']);
      qc.invalidateQueries(['my-applications']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi nộp đơn');
    }
  });

  const handleApplyClick = (e, job) => {
    e.stopPropagation(); // prevent card click
    if (!user) {
      openLoginModal();
      return;
    }
    if (!isCandidate()) {
      toast.error('Chỉ tài khoản Ứng viên mới có thể nộp đơn dự án');
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

  const projectJobs = data?.data?.data || [];
  const pagination = data?.data?.pagination;
  const skills = skillsRes?.data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Bar & Skills */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            className="input-field flex-1"
            placeholder="Tìm vị trí công việc, dự án..."
            value={filters.keyword}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value, page: 1 })}
          />
          <select
            className="input-field md:w-56"
            value={filters.skill_id}
            onChange={(e) => setFilters({ ...filters, skill_id: e.target.value, page: 1 })}
          >
            <option value="">-- Tất cả kỹ năng --</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Section */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            Tìm thấy <strong>{pagination?.total || 0}</strong> vị trí dự án thời vụ
          </p>

          {projectJobs.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🔍</p>
              <p>Không tìm thấy vị trí dự án phù hợp</p>
            </div>
          ) : (
            <div className={`flex flex-col ${activeDetailJob ? 'lg:flex-row gap-6' : ''}`}>
              {/* Left Column: Danh sách Dự án */}
              <div className={`${activeDetailJob ? 'w-full lg:w-1/2 space-y-4' : 'w-full space-y-4'}`}>
                {projectJobs.map((job) => {
                  const isSelected = activeDetailJob?.id === job.id;
                  const isApplied = appliedJobIds.has(job.id);

                  return (
                    <div
                      key={job.id}
                      onClick={() => setActiveDetailJob(job)}
                      className={`card cursor-pointer transition-all duration-200 border-2 ${
                        isSelected
                          ? 'border-primary-600 ring-2 ring-primary-100 bg-primary-50/10 shadow-md'
                          : 'border-transparent hover:border-gray-300 hover:shadow-md'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary-600">
                              {job.title}
                            </h3>
                            <span className="badge bg-purple-100 text-purple-700 text-xs">
                              Dự án
                            </span>
                          </div>

                          <p className="text-sm font-medium text-primary-700 mb-2">
                            📁 {job.Project?.name}
                          </p>

                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                            {job.description}
                          </p>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {job.Skills?.slice(0, 4).map((s) => (
                              <span key={s.id} className="badge bg-gray-100 text-gray-700 text-xs">
                                {s.name}
                              </span>
                            ))}
                            {job.Skills?.length > 4 && (
                              <span className="text-xs text-gray-400">+{job.Skills.length - 4}</span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                            <span className="font-semibold text-green-700 text-sm">
                              💰 {formatSalary(job.budget)}
                            </span>
                            {job.deadline && (
                              <span>⏰ Hạn: {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0 sm:self-center">
                          {isApplied ? (
                            <button
                              disabled
                              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-not-allowed flex items-center gap-1"
                            >
                              <span>✓</span> Đã ứng tuyển
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleApplyClick(e, job)}
                              className="btn-primary text-xs py-1.5 px-4 whitespace-nowrap"
                            >
                              Ứng tuyển
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setFilters({ ...filters, page: p })}
                        className={`w-9 h-9 rounded-lg text-sm font-medium ${
                          p === filters.page
                            ? 'bg-primary-600 text-white'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Nửa khung hình chi tiết Dự án (Split View Pane) */}
              {activeDetailJob && (
                <div className="w-full lg:w-1/2 sticky top-20 self-start mt-6 lg:mt-0 animate-fade-in">
                  <div className="card border border-primary-200 shadow-xl bg-white max-h-[calc(100vh-110px)] overflow-y-auto space-y-6">
                    {/* Header with Close Button */}
                    <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge bg-purple-100 text-purple-700 text-xs font-semibold">
                            Dự án thời vụ
                          </span>
                          <span className="badge bg-emerald-100 text-emerald-700 text-xs">
                            Trạng thái: {activeDetailJob.status}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{activeDetailJob.title}</h2>
                        <p className="text-sm font-semibold text-primary-600 mt-1">
                          📁 {activeDetailJob.Project?.name}
                        </p>
                      </div>

                      <button
                        onClick={() => setActiveDetailJob(null)}
                        className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 text-lg transition-colors"
                        title="Đóng khung chi tiết"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-gradient-to-r from-primary-50 to-purple-50 p-4 rounded-xl flex items-center justify-between gap-4 border border-primary-100">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Thù lao vị trí</p>
                        <p className="text-xl font-bold text-green-700">
                          {formatSalary(activeDetailJob.budget)}
                        </p>
                      </div>

                      {appliedJobIds.has(activeDetailJob.id) ? (
                        <div className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shadow-sm">
                          <span className="font-bold">✓</span> Đã nộp hồ sơ
                        </div>
                      ) : (
                        <button
                          onClick={(e) => handleApplyClick(e, activeDetailJob)}
                          className="btn-primary px-6 py-2.5 shadow-md"
                        >
                          Ứng tuyển vị trí này
                        </button>
                      )}
                    </div>

                    {/* Thông tin dự án tổng quan */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                        Tổng quan Dự án
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                        <div>
                          <p className="text-gray-500">Tổng ngân sách dự án:</p>
                          <p className="font-semibold text-gray-800 text-sm mt-0.5">
                            {formatSalary(activeDetailJob.Project?.budget)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tiến độ dự án:</p>
                          <p className="font-semibold text-gray-800 text-sm mt-0.5">
                            {activeDetailJob.Project?.completion_rate || 0}% hoàn thành
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Hạn nộp hồ sơ:</p>
                          <p className="font-medium text-gray-800 mt-0.5">
                            {activeDetailJob.deadline
                              ? new Date(activeDetailJob.deadline).toLocaleDateString('vi-VN')
                              : 'Không giới hạn'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Thời gian dự kiến hoàn thành:</p>
                          <p className="font-medium text-gray-800 mt-0.5">
                            {activeDetailJob.Project?.expected_end_date
                              ? new Date(activeDetailJob.Project.expected_end_date).toLocaleDateString('vi-VN')
                              : 'Linh hoạt'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Kỹ năng yêu cầu */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                        Kỹ năng yêu cầu
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {activeDetailJob.Skills?.map((s) => (
                          <span key={s.id} className="badge bg-primary-50 text-primary-700 border border-primary-200 text-xs px-2.5 py-1">
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Mô tả vị trí */}
                    <div className="space-y-2">
                      <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                        Mô tả công việc vị trí
                      </h3>
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line bg-gray-50/70 p-4 rounded-xl border border-gray-100">
                        {activeDetailJob.description || 'Chưa có mô tả chi tiết cho vị trí này.'}
                      </div>
                    </div>

                    {/* Giới thiệu dự án cha */}
                    {activeDetailJob.Project?.description && (
                      <div className="space-y-2">
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                          Về dự án {activeDetailJob.Project?.name}
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed bg-purple-50/40 p-4 rounded-xl border border-purple-100">
                          {activeDetailJob.Project.description}
                        </p>
                      </div>
                    )}
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
            <h2 className="text-xl font-bold mb-1">Ứng tuyển vị trí dự án</h2>
            <p className="text-sm font-medium text-primary-600 mb-1">{selectedJobForApply.title}</p>
            <p className="text-xs text-gray-500 mb-4">📁 Dự án: {selectedJobForApply.Project?.name}</p>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thư giới thiệu (Cover Letter)
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  required
                  placeholder="Giới thiệu năng lực, kinh nghiệm thực chiến và cam kết hoàn thành dự án..."
                  value={applyForm.cover_letter}
                  onChange={(e) => setApplyForm({ ...applyForm, cover_letter: e.target.value })}
                />
              </div>

              {/* CV Selector */}
              <CvSelector
                profile={profile}
                value={applyForm.cv_url}
                onChange={(url) => setApplyForm({ ...applyForm, cv_url: url })}
              />

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedJobForApply(null)}
                  className="btn-secondary"
                  disabled={applyMutation.isLoading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={applyMutation.isLoading}
                >
                  {applyMutation.isLoading ? 'Đang gửi...' : 'Xác nhận nộp đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
