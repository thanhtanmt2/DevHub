import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { candidateApi } from '@/api/candidateApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

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
  const [activeTab, setActiveTab] = useState('projects');
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const qc = useQueryClient();

  const { data: projectAppsRes, isLoading: loadingProjects } = useQuery({
    queryKey: ['my-project-applications'],
    queryFn: () => candidateApi.getMyProjectApplications(),
  });

  const { data: companyAppsRes, isLoading: loadingCompany } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => candidateApi.getMyApplications(),
  });

  const { data: detailRes, isLoading: loadingDetail } = useQuery({
    queryKey: ['application-detail', selectedAppId],
    queryFn: () => candidateApi.getApplicationDetail(selectedAppId),
    enabled: !!selectedAppId,
  });

  // Rút đơn ứng tuyển (chỉ áp dụng cho Company Job - status PENDING)
  const withdrawMutation = useMutation({
    mutationFn: (id) => candidateApi.withdrawApplication(id),
    onSuccess: () => {
      toast.success('Đã rút đơn ứng tuyển thành công');
      qc.invalidateQueries({ queryKey: ['my-applications'] });
      setSelectedAppId(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Không thể rút đơn'),
  });

  const handleWithdraw = (e, appId) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc muốn rút đơn ứng tuyển này không?')) {
      withdrawMutation.mutate(appId);
    }
  };

  const projectApps = projectAppsRes?.data?.data || [];
  const companyApps = companyAppsRes?.data?.data || [];
  const appDetail = detailRes?.data?.data;

  const isLoading = loadingProjects || loadingCompany;
  if (isLoading) return <LoadingSpinner />;

  // Tính stats cho tab hiện tại
  const currentApps = activeTab === 'projects' ? projectApps : companyApps;
  const statuses = ['PENDING', 'REVIEWING', 'VIEWED', 'INTERVIEW', 'HIRED', 'ACCEPTED', 'REJECTED'];
  const stats = statuses.reduce((acc, s) => {
    acc[s] = currentApps.filter((a) => a.status === s).length;
    return acc;
  }, {});

  // Filter theo status ('' = tất cả)
  const filteredApps = statusFilter
    ? currentApps.filter((a) => a.status === statusFilter)
    : currentApps;

  return (
    <div className="space-y-6">
      {/* Tab + Stats Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => { setActiveTab('projects'); setStatusFilter(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'projects' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Dự án thời vụ ({projectApps.length})
            </button>
            <button
              onClick={() => { setActiveTab('companies'); setStatusFilter(''); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'companies' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Việc làm doanh nghiệp ({companyApps.length})
            </button>
          </div>

          {/* Filter theo status */}
          <select
            className="input-field text-sm w-full sm:w-52"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">-- Tất cả trạng thái --</option>
            {statuses.filter((s) => stats[s] > 0).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s] || s} ({stats[s]})
              </option>
            ))}
          </select>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(stats).filter(([, count]) => count > 0).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all ${
                statusFilter === status
                  ? `${STATUS_COLORS[status]} border-current shadow-sm ring-2 ring-offset-1 ring-current/30`
                  : `${STATUS_COLORS[status]} border-transparent opacity-80 hover:opacity-100`
              }`}
            >
              {STATUS_LABELS[status] || status}: {count}
            </button>
          ))}
          {currentApps.length === 0 && (
            <span className="text-xs text-gray-400">Chưa có đơn ứng tuyển nào</span>
          )}
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
              <Link to="/projects" className="btn-primary mt-4 inline-block">Khám phá dự án ngay</Link>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="card text-center py-8 text-gray-400">
              <p>Không có đơn nào ở trạng thái này</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApps.map((app) => (
                <div key={app.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-gray-900">{app.ProjectJob?.title}</h3>
                        <span className="badge bg-purple-100 text-purple-700 text-xs">Dự án thời vụ</span>
                      </div>
                      <p className="text-sm font-medium text-primary-700 mb-2">📁 Dự án: {app.ProjectJob?.Project?.name}</p>
                      {app.cover_letter && (
                        <p className="text-xs text-gray-500 italic line-clamp-2 mb-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          "{app.cover_letter}"
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="font-semibold text-green-700 text-sm">💰 Thù lao: {formatSalary(app.ProjectJob?.budget)}</span>
                        <span>📅 Ngày nộp: {new Date(app.applied_at).toLocaleDateString('vi-VN')}</span>
                        {app.cv_url && (
                          <a href={app.cv_url} target="_blank" rel="noopener noreferrer"
                            className="font-medium text-primary-600 hover:underline flex items-center gap-1">
                            📄 Xem CV đã nộp
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 min-w-fit">
                      <span className={`badge text-xs px-3 py-1 font-semibold ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[app.status] || app.status}
                      </span>
                      {app.status === 'ACCEPTED' && (
                        <p className="text-xs text-emerald-600 font-medium mt-1">✓ Bạn đã được thêm vào Không gian làm việc</p>
                      )}
                      {/* [Critical] Hiển thị thông tin phỏng vấn khi status = INTERVIEW */}
                      {app.status === 'INTERVIEW' && (
                        <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1.5 text-left min-w-[220px]">
                          <p className="font-bold text-purple-700 text-sm">📅 Thông tin phỏng vấn</p>
                          {app.interview_time && (
                            <p className="text-purple-800">
                              <span className="font-semibold">⏰ Thời gian:</span>{' '}
                              {new Date(app.interview_time).toLocaleString('vi-VN')}
                            </p>
                          )}
                          {app.meet_url && (
                            <p>
                              <span className="font-semibold text-purple-800">🔗 Link phỏng vấn:</span>{' '}
                              <a href={app.meet_url} target="_blank" rel="noopener noreferrer"
                                className="text-purple-600 hover:underline font-medium break-all">
                                Tham gia phỏng vấn
                              </a>
                            </p>
                          )}
                          {app.interview_note && (
                            <p className="text-gray-700 italic">
                              <span className="font-semibold not-italic text-purple-800">📝 Ghi chú:</span>{' '}{app.interview_note}
                            </p>
                          )}
                          {!app.interview_time && !app.meet_url && !app.interview_note && (
                            <p className="text-purple-600">Nhà tuyển dụng sẽ liên hệ sớm với bạn.</p>
                          )}
                        </div>
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
              <Link to="/jobs" className="btn-primary mt-4 inline-block">Tìm việc công ty ngay</Link>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="card text-center py-8 text-gray-400">
              <p>Không có đơn nào ở trạng thái này</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="card hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedAppId(selectedAppId === app.id ? null : app.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Link
                        to={`/jobs/${app.job_post_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-lg text-gray-900 hover:text-primary-600"
                      >
                        {app.JobPost?.title}
                      </Link>
                      {app.JobPost?.Company && (
                        <p className="text-sm text-gray-500 mt-0.5">{app.JobPost.Company.name}</p>
                      )}
                      {app.cover_letter && (
                        <p className="text-xs text-gray-500 italic line-clamp-2 mt-2 mb-1 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          "{app.cover_letter}"
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-gray-400">📅 Ngày nộp: {new Date(app.applied_at).toLocaleDateString('vi-VN')}</p>
                        {app.cv_url && (
                          <a href={app.cv_url} target="_blank" rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-medium text-primary-600 hover:underline flex items-center gap-1">
                            📄 Xem CV đã nộp
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`badge text-xs px-3 py-1 font-semibold ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-700'}`}>
                        {STATUS_LABELS[app.status] || app.status}
                      </span>
                      <p className="text-xs text-gray-400">👁️ Xem lịch sử</p>
                      {/* Nút rút đơn — chỉ hiện khi PENDING */}
                      {app.status === 'PENDING' && (
                        <button
                          onClick={(e) => handleWithdraw(e, app.id)}
                          disabled={withdrawMutation.isPending}
                          className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium mt-1 disabled:opacity-50"
                        >
                          {withdrawMutation.isPending ? 'Đang rút...' : '✕ Rút đơn'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline detail: ApplicationStatusHistory timeline */}
                  {selectedAppId === app.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {loadingDetail ? (
                        <p className="text-xs text-gray-400 text-center py-2">Đang tải lịch sử...</p>
                      ) : appDetail?.ApplicationStatusHistories?.length > 0 ? (
                        <div>
                          <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wide">📜 Lịch sử trạng thái hồ sơ</p>
                          <div className="space-y-2">
                            {appDetail.ApplicationStatusHistories.map((h, idx) => (
                              <div key={h.id || idx} className="flex items-start gap-3 text-xs">
                                <div className="flex flex-col items-center">
                                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500 mt-0.5 flex-shrink-0" />
                                  {idx < appDetail.ApplicationStatusHistories.length - 1 && (
                                    <div className="w-px h-5 bg-gray-200 mt-1" />
                                  )}
                                </div>
                                <div className="flex-1 pb-1">
                                  <div className="flex items-center gap-2">
                                    <span className={`badge text-xs px-2 py-0.5 font-semibold ${STATUS_COLORS[h.status] || 'bg-gray-100 text-gray-700'}`}>
                                      {STATUS_LABELS[h.status] || h.status}
                                    </span>
                                    <span className="text-gray-400">{new Date(h.changed_at).toLocaleString('vi-VN')}</span>
                                  </div>
                                  {h.note && <p className="text-gray-500 mt-0.5 italic">{h.note}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-2">Chưa có lịch sử cập nhật</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
