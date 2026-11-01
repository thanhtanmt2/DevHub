import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { jobApi } from '@/api/jobApi';
import { companyApi } from '@/api/companyApi';
import PageBanner from '@/components/common/PageBanner';
import StatTile from '@/components/common/StatTile';
import CompanyLogo from '@/components/common/CompanyLogo';
import { JOB_STATUS_META } from '@/utils/jobMeta';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: companyRes } = useQuery({
    queryKey: ['my-company'],
    queryFn: () => companyApi.getMyCompany(),
  });

  const { data: jobsRes } = useQuery({
    queryKey: ['employer-jobs'],
    queryFn: () => jobApi.getMyJobs(),
    refetchInterval: 20000,
  });

  const company = companyRes?.data?.data;
  const jobs = jobsRes?.data?.data || [];
  const openJobs = jobs.filter(j => j.status === 'OPEN').length;
  const totalApps = jobs.reduce((n, j) => n + (Number(j.application_count) || 0), 0);
  const pendingApps = jobs.reduce((n, j) => n + (Number(j.pending_count) || 0), 0);

  return (
    <div className="space-y-6">
      <PageBanner
        icon="building"
        title={company?.name || 'Bảng điều khiển nhà tuyển dụng'}
        subtitle={`Chào mừng, ${user?.full_name || ''}`}
      >
        <Link to="/employer/jobs" className="btn-light">Đăng tin tuyển dụng</Link>
        <Link to="/employer/candidates" className="btn-glass">Tìm ứng viên</Link>
      </PageBanner>

      {!company ? (
        <div className="card border-l-4 border-primary-500 bg-primary-50">
          <p className="font-medium text-primary-800">Chưa có hồ sơ công ty</p>
          <p className="text-sm text-primary-700 mt-1">Tạo hồ sơ công ty để bắt đầu đăng tin tuyển dụng</p>
          <Link to="/employer/company" className="btn-primary mt-3 inline-block text-sm">Tạo hồ sơ công ty</Link>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center gap-3">
            <CompanyLogo company={company} className="w-12 h-12 text-lg" />
            <div>
              <p className="font-semibold">{company.name}</p>
              <span className={`badge text-xs ${
                company.verification_status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                company.verification_status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {company.verification_status === 'VERIFIED' ? 'Đã xác thực' : company.verification_status === 'REJECTED' ? 'Từ chối' : 'Chờ xác thực'}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Tin đang tuyển" value={openJobs} icon="briefcase" tone="blue" />
        <StatTile label="Hồ sơ chờ xem" value={pendingApps} icon="inbox" tone="emerald" />
        <StatTile label="Tổng hồ sơ đã nhận" value={totalApps} icon="clipboard" tone="blue" />
        <StatTile label="Tổng tin đã đăng" value={jobs.length} icon="document" tone="blue" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Tin tuyển dụng gần đây</h2>
          <Link to="/employer/jobs" className="text-sm text-primary-700 hover:underline">Quản lý tất cả</Link>
        </div>
        {jobs.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">Chưa có tin tuyển dụng nào</p>
        ) : (
          <div className="space-y-2">
            {jobs.slice(0, 5).map(job => {
              const st = JOB_STATUS_META[job.status] || JOB_STATUS_META.DRAFT;
              const pending = Number(job.pending_count) || 0;
              return (
                <button key={job.id} onClick={() => navigate(`/employer/jobs/${job.id}${pending > 0 ? '?tab=applications' : ''}`)}
                  className="w-full flex items-center justify-between gap-3 py-2.5 px-2 -mx-2 rounded-lg text-left hover:bg-slate-50 border-b border-gray-100 last:border-0 transition-colors">
                  <p className="text-sm font-medium truncate">{job.title}</p>
                  <span className="flex items-center gap-2 flex-shrink-0">
                    {pending > 0 && <span className="text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full">{pending} hồ sơ mới</span>}
                    <span className={`px-2.5 py-0.5 text-xs rounded-full font-semibold ${st.cls}`}>{st.label}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
