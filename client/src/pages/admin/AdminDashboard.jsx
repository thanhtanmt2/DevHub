import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats()
  });

  if (isLoading) return <LoadingSpinner />;
  const stats = data?.data?.data;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="card bg-blue-50 border-blue-100">
          <p className="text-blue-600 text-sm font-medium">Tổng người dùng</p>
          <p className="text-3xl font-bold text-blue-900 mt-2">{stats?.total_users || 0}</p>
        </div>
        <div className="card bg-purple-50 border-purple-100">
          <p className="text-purple-600 text-sm font-medium">Tổng tin tuyển dụng</p>
          <p className="text-3xl font-bold text-purple-900 mt-2">{stats?.total_jobs || 0}</p>
        </div>
        <div className="card bg-green-50 border-green-100">
          <p className="text-green-600 text-sm font-medium">Dự án nội bộ</p>
          <p className="text-3xl font-bold text-green-900 mt-2">{stats?.total_projects || 0}</p>
        </div>
        <div className="card bg-yellow-50 border-yellow-100">
          <p className="text-yellow-700 text-sm font-medium">Đã thanh toán (VNĐ)</p>
          <p className="text-2xl font-bold text-yellow-900 mt-2">
            {new Intl.NumberFormat('vi-VN').format(stats?.total_payout || 0)}đ
          </p>
        </div>
      </div>
    </div>
  );
}
