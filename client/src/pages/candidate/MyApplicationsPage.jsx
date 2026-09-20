import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { candidateApi } from '@/api/candidateApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const STATUS_LABELS = { PENDING: 'Chờ xem xét', VIEWED: 'Đã xem', INTERVIEW: 'Phỏng vấn', HIRED: 'Trúng tuyển', REJECTED: 'Không phù hợp' };
const STATUS_COLORS = { PENDING: 'bg-yellow-100 text-yellow-700', VIEWED: 'bg-blue-100 text-blue-700', INTERVIEW: 'bg-purple-100 text-purple-700', HIRED: 'bg-green-100 text-green-700', REJECTED: 'bg-red-100 text-red-700' };

export default function MyApplicationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => candidateApi.getMyApplications(),
  });

  const applications = data?.data?.data || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Hồ sơ ứng tuyển ({applications.length})</h1>
      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-4xl mb-2">📋</p>
          <p className="text-gray-500">Chưa có hồ sơ ứng tuyển nào</p>
          <Link to="/jobs" className="btn-primary mt-4 inline-block">Tìm việc ngay</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map(app => (
            <div key={app.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <Link to={`/jobs/${app.job_post_id}`} className="font-semibold text-gray-900 hover:text-primary-600">
                    {app.JobPost?.title}
                  </Link>
                  {app.JobPost?.Company && <p className="text-sm text-gray-500">{app.JobPost.Company.name}</p>}
                  <p className="text-xs text-gray-400 mt-1">Ngày nộp: {new Date(app.applied_at).toLocaleDateString('vi-VN')}</p>
                </div>
                <span className={`badge ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'}`}>
                  {STATUS_LABELS[app.status] || app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
