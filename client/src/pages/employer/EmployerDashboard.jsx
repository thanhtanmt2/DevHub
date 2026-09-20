import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { jobApi } from '@/api/jobApi';
import { companyApi } from '@/api/companyApi';

export default function EmployerDashboard() {
  const { user } = useAuth();

  const { data: companyRes } = useQuery({
    queryKey: ['my-company'],
    queryFn: () => companyApi.getMyCompany(),
  });

  const { data: jobsRes } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: () => jobApi.getMyJobs(),
  });

  const company = companyRes?.data?.data;
  const jobs = jobsRes?.data?.data || [];
  const openJobs = jobs.filter(j => j.status === 'OPEN').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Employer Dashboard</h1>
        <p className="text-gray-500">Chào mừng, {user?.full_name}</p>
      </div>

      {!company ? (
        <div className="card border-l-4 border-primary-500 bg-primary-50">
          <p className="font-medium text-primary-800">Chưa có hồ sơ công ty</p>
          <p className="text-sm text-primary-700 mt-1">Tạo hồ sơ công ty để bắt đầu đăng tin tuyển dụng</p>
          <Link to="/employer/company" className="btn-primary mt-3 inline-block text-sm">Tạo hồ sơ công ty</Link>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-lg font-bold text-gray-600">
              {company.name?.[0]}
            </div>
            <div>
              <p className="font-semibold">{company.name}</p>
              <span className={`badge text-xs ${
                company.verification_status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                company.verification_status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {company.verification_status === 'VERIFIED' ? '✓ Đã xác thực' : company.verification_status === 'REJECTED' ? 'Từ chối' : 'Chờ xác thực'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card"><p className="text-gray-500 text-sm">Tổng tin đăng</p><p className="text-3xl font-bold text-primary-600 mt-1">{jobs.length}</p></div>
        <div className="card"><p className="text-gray-500 text-sm">Đang tuyển</p><p className="text-3xl font-bold text-green-600 mt-1">{openJobs}</p></div>
        <div className="card"><p className="text-gray-500 text-sm">Đã đóng</p><p className="text-3xl font-bold text-gray-500 mt-1">{jobs.length - openJobs}</p></div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Tin tuyển dụng gần đây</h2>
          <Link to="/employer/jobs" className="text-sm text-primary-600 hover:underline">Quản lý tất cả</Link>
        </div>
        {jobs.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Chưa có tin tuyển dụng nào</p>
        ) : (
          <div className="space-y-2">
            {jobs.slice(0, 5).map(job => (
              <div key={job.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <p className="text-sm font-medium">{job.title}</p>
                <span className={`badge text-xs ${ job.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600' }`}>{job.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
