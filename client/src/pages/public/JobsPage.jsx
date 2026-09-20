import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { jobApi } from '@/api/jobApi';
import { skillApi } from '@/api/skillApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const WORK_TYPES = ['', 'FREELANCE', 'REMOTE', 'PART_TIME', 'FULL_TIME'];
const WORK_TYPE_LABELS = { '': 'Tất cả', FREELANCE: 'Freelance', REMOTE: 'Remote', PART_TIME: 'Part-time', FULL_TIME: 'Full-time' };

const formatSalary = (min, max) => {
  if (!min && !max) return 'Thỏa thuận';
  const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}đ`;
  if (min) return `Từ ${fmt(min)}đ`;
  return `Đến ${fmt(max)}đ`;
};

export default function JobsPage() {
  const [filters, setFilters] = useState({ keyword: '', work_type: '', page: 1 });

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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Tìm kiếm việc làm IT</h1>
      <p className="text-gray-500 mb-6">Khám phá các cơ hội Freelance, Remote &amp; Part-time</p>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            className="input-field flex-1"
            placeholder="Tìm theo tên công việc, mô tả..."
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
      {isLoading ? <LoadingSpinner /> : (
        <>
          <p className="text-sm text-gray-500 mb-4">Tìm thấy <strong>{pagination?.total || 0}</strong> công việc</p>
          <div className="space-y-4">
            {jobs.length === 0 && (
              <div className="card text-center py-12 text-gray-400">
                <p className="text-4xl mb-2">🔍</p>
                <p>Không tìm thấy công việc phù hợp</p>
              </div>
            )}
            {jobs.map(job => (
              <Link key={job.id} to={`/jobs/${job.id}`} className="card block hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 hover:text-primary-600">{job.title}</h3>
                      <span className={`badge text-xs ${
                        job.post_type === 'INTERNAL' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {job.post_type === 'INTERNAL' ? 'Dự án nội bộ' : 'Doanh nghiệp'}
                      </span>
                    </div>
                    {job.Company && <p className="text-sm text-gray-500 mb-2">{job.Company.name}</p>}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {job.Skills?.slice(0, 5).map(s => (
                        <span key={s.id} className="badge bg-gray-100 text-gray-600 text-xs">{s.name}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>💰 {formatSalary(job.salary_min, job.salary_max)}</span>
                      {job.work_type && <span>🏠 {WORK_TYPE_LABELS[job.work_type]}</span>}
                      {job.deadline && <span>⏰ HSD: {new Date(job.deadline).toLocaleDateString('vi-VN')}</span>}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
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
        </>
      )}
    </div>
  );
}
