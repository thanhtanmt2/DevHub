import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { candidateApi } from '@/api/candidateApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const STATUS_LABELS = { PENDING: 'Chờ xem xét', VIEWED: 'Đã xem', INTERVIEW: 'Phỏng vấn', HIRED: 'Trúng tuyển', REJECTED: 'Không phù hợp' };
const STATUS_COLORS = { PENDING: 'bg-yellow-100 text-yellow-700', VIEWED: 'bg-blue-100 text-blue-700', INTERVIEW: 'bg-purple-100 text-purple-700', HIRED: 'bg-green-100 text-green-700', REJECTED: 'bg-red-100 text-red-700' };

export default function CandidateDashboard() {
  const { user } = useAuth();

  const { data: profileRes } = useQuery({
    queryKey: ['candidate-profile'],
    queryFn: () => candidateApi.getProfile(),
  });

  const { data: appsRes, isLoading } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => candidateApi.getMyApplications(),
  });

  const profile = profileRes?.data?.data;
  const applications = appsRes?.data?.data || [];

  const stats = [
    { label: 'Hồ sơ ứng tuyển', value: applications.length, color: 'text-blue-600' },
    { label: 'Đang phỏng vấn', value: applications.filter(a => a.status === 'INTERVIEW').length, color: 'text-purple-600' },
    { label: 'Trúng tuyển', value: applications.filter(a => a.status === 'HIRED').length, color: 'text-green-600' },
    { label: 'Điểm năng lực', value: parseFloat(profile?.competency_score || 0).toFixed(1), color: 'text-primary-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Xin chào, {user?.full_name}! 👋</h1>
        <p className="text-gray-500">{profile?.professional_title || 'Hoàn thiện hồ sơ để tăng cơ hội ứng tuyển'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="card">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Profile completion hint */}
      {!profile?.professional_title && (
        <div className="card border-l-4 border-yellow-400 bg-yellow-50">
          <p className="text-sm font-medium text-yellow-800">Hồ sơ của bạn chưa đầy đủ</p>
          <p className="text-xs text-yellow-700 mt-1">Hoàn thiện hồ sơ để nhà tuyển dụng dễ tìm thấy bạn hơn</p>
          <Link to="/candidate/profile" className="text-xs text-yellow-800 underline mt-2 inline-block">Cập nhật ngay →</Link>
        </div>
      )}

      {/* Recent Applications */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Hồ sơ ứng tuyển gần đây</h2>
          <Link to="/candidate/applications" className="text-sm text-primary-600 hover:underline">Xem tất cả</Link>
        </div>
        {isLoading ? <LoadingSpinner size="sm" /> : (
          applications.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p>Chưa có hồ sơ nào. <Link to="/jobs" className="text-primary-600 underline">Tìm việc ngay</Link></p>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map(app => (
                <div key={app.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-sm">{app.JobPost?.title}</p>
                    <p className="text-xs text-gray-400">{app.JobPost?.Company?.name}</p>
                  </div>
                  <span className={`badge text-xs ${STATUS_COLORS[app.status]}`}>{STATUS_LABELS[app.status]}</span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
