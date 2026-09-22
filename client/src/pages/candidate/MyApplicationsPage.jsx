import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { candidateApi } from '@/api/candidateApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const STATUS_LABELS = {
  PENDING: 'Chờ xem xét',
  VIEWED: 'Đã xem',
  INTERVIEW: 'Phỏng vấn',
  HIRED: 'Trúng tuyển',
  REJECTED: 'Không phù hợp',
  REVIEWING: 'Đang xét duyệt',
  ACCEPTED: 'Trúng tuyển dự án'
};

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  VIEWED: 'bg-blue-100 text-blue-700',
  INTERVIEW: 'bg-purple-100 text-purple-700',
  HIRED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
  REVIEWING: 'bg-indigo-100 text-indigo-700',
  ACCEPTED: 'bg-emerald-100 text-emerald-700'
};

const formatSalary = (amount) => {
  if (!amount) return 'Thỏa thuận';
  return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
};

export default function MyApplicationsPage() {
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'companies'

  // 1. Project Applications
  const { data: projectAppsRes, isLoading: loadingProjects } = useQuery({
    queryKey: ['my-project-applications'],
    queryFn: () => candidateApi.getMyProjectApplications(),
  });

  // 2. Company Job Applications
  const { data: companyAppsRes, isLoading: loadingCompany } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => candidateApi.getMyApplications(),
  });

  const projectApps = projectAppsRes?.data?.data || [];
  const companyApps = companyAppsRes?.data?.data || [];

  const isLoading = loadingProjects || loadingCompany;
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
        {/* Tab switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'projects'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dự án thời vụ ({projectApps.length})
          </button>
          <button
            onClick={() => setActiveTab('companies')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'companies'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Việc làm doanh nghiệp ({companyApps.length})
          </button>
        </div>
      </div>

      {/* Tab 1: Project Applications */}
      {activeTab === 'projects' && (
        <div>
          {projectApps.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-4xl mb-2">📁</p>
              <p className="text-gray-500 font-medium">Bạn chưa ứng tuyển vị trí dự án nào</p>
              <p className="text-xs text-gray-400 mt-1">Khám phá các dự án nội bộ đang tìm kiếm nhân sự thời vụ</p>
              <Link to="/projects" className="btn-primary mt-4 inline-block">
                Khám phá dự án ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {projectApps.map((app) => (
                <div key={app.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {app.ProjectJob?.title}
                        </h3>
                        <span className="badge bg-purple-100 text-purple-700 text-xs">
                          Dự án thời vụ
                        </span>
                      </div>

                      <p className="text-sm font-medium text-primary-700 mb-2">
                        📁 Dự án: {app.ProjectJob?.Project?.name}
                      </p>

                      {app.cover_letter && (
                        <p className="text-xs text-gray-500 italic line-clamp-2 mb-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          "{app.cover_letter}"
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="font-semibold text-green-700 text-sm">
                          💰 Thù lao: {formatSalary(app.ProjectJob?.budget)}
                        </span>
                        <span>
                          📅 Ngày nộp: {new Date(app.applied_at).toLocaleDateString('vi-VN')}
                        </span>
                        {app.cv_url && (
                          <a
                            href={app.cv_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary-600 hover:underline flex items-center gap-1"
                          >
                            📄 Xem CV đã nộp
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`badge text-xs px-3 py-1 font-semibold ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[app.status] || app.status}
                      </span>

                      {app.status === 'ACCEPTED' && (
                        <p className="text-xs text-emerald-600 font-medium mt-1">
                          ✓ Bạn đã được thêm vào Không gian làm việc
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Company Job Applications */}
      {activeTab === 'companies' && (
        <div>
          {companyApps.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-4xl mb-2">💼</p>
              <p className="text-gray-500 font-medium">Chưa có hồ sơ ứng tuyển công ty nào</p>
              <p className="text-xs text-gray-400 mt-1">Tìm việc làm toàn thời gian hoặc bán thời gian tại các doanh nghiệp</p>
              <Link to="/jobs" className="btn-primary mt-4 inline-block">
                Tìm việc công ty ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {companyApps.map((app) => (
                <div key={app.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        to={`/jobs/${app.job_post_id}`}
                        className="font-semibold text-lg text-gray-900 hover:text-primary-600"
                      >
                        {app.JobPost?.title}
                      </Link>
                      {app.JobPost?.Company && (
                        <p className="text-sm text-gray-500 mt-0.5">{app.JobPost.Company.name}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-gray-400">
                          📅 Ngày nộp: {new Date(app.applied_at).toLocaleDateString('vi-VN')}
                        </p>
                        {app.cv_url && (
                          <a
                            href={app.cv_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-primary-600 hover:underline flex items-center gap-1"
                          >
                            📄 Xem CV đã nộp
                          </a>
                        )}
                      </div>
                    </div>

                    <span className={`badge text-xs px-3 py-1 font-semibold ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'}`}>
                      {STATUS_LABELS[app.status] || app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
