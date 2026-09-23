import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { jobApi } from '@/api/jobApi';
import { skillApi } from '@/api/skillApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';

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
  const [filters, setFilters] = useState({ keyword: '', work_type: '', page: 1 });
  const [selectedJob, setSelectedJob] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobApi.getJobs(filters),
    keepPreviousData: true,
  });

  const { data: skillsRes } = useQuery({
    queryKey: ['public-skills'],
    queryFn: () => skillApi.getPublicSkills(),
  });

  const jobs = data?.data?.data || [];
  const pagination = data?.data?.pagination;
  const skills = skillsRes?.data?.data || [];

  const handleApplyClick = (jobId) => {
    window.open(`/jobs/${jobId}`, '_blank');
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

                      <button
                        onClick={() => handleApplyClick(selectedJob.id)}
                        className="btn-primary px-6 py-2.5 shadow-md flex items-center gap-1.5 whitespace-nowrap"
                      >
                        Ứng tuyển ngay ↗
                      </button>
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
    </div>
  );
}
