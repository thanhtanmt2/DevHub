import { useState, useEffect } from 'react';
import { jobApi } from '@/api/jobApi';
import { toast } from 'react-hot-toast';
import Icon from '@/components/common/Icon';

const STATUS_LABELS = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  VIEWED: { label: 'Đã xem', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  INTERVIEW: { label: 'Phỏng vấn', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  HIRED: { label: 'Đã tuyển', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Từ chối', color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

export default function ManageApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [selectedJobId, selectedStatus]);

  const fetchJobs = async () => {
    try {
      const res = await jobApi.getMyJobs();
      setJobs(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedJobId) params.job_id = selectedJobId;
      if (selectedStatus) params.status = selectedStatus;
      const res = await jobApi.getAllEmployerApplications(params);
      setApplications(res.data.data || []);
    } catch (err) {
      toast.error('Không thể tải danh sách ứng viên');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      await jobApi.updateApplicationStatus(appId, { status: newStatus });
      toast.success('Đã cập nhật trạng thái ứng viên');
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể cập nhật trạng thái');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Quản lý hồ sơ ứng tuyển</h1>
        <p className="page-subtitle">
          Xem và xử lý hồ sơ, CV của các ứng viên nộp vào tin tuyển dụng công ty
        </p>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-x-6 gap-y-3 items-center !p-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tin tuyển dụng</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="input-field flex-1 min-w-0 sm:flex-none sm:w-auto text-sm !py-1.5"
          >
            <option value="">Tất cả vị trí ({jobs.length})</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input-field flex-1 min-w-0 sm:flex-none sm:w-auto text-sm !py-1.5"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABELS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:ml-auto text-sm text-slate-500">
          Tổng cộng: <strong className="text-slate-900">{applications.length}</strong> hồ sơ
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="card text-center py-16 text-slate-400">Đang tải danh sách hồ sơ...</div>
      ) : applications.length === 0 ? (
        <div className="card text-center py-16">
          <span className="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
            <Icon name="inbox" className="w-7 h-7" />
          </span>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Chưa có hồ sơ ứng tuyển nào</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Khi ứng viên nộp hồ sơ vào các vị trí tuyển dụng của bạn, thông tin và file CV sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const cvFileUrl = app.cv_url || app.CandidateProfile?.cv_url;
            const candidateName = app.CandidateProfile?.User?.full_name || 'Ứng viên';
            const candidateEmail = app.CandidateProfile?.User?.email || '';
            const statusConfig = STATUS_LABELS[app.status] || STATUS_LABELS.PENDING;

            return (
              <div
                key={app.id}
                className="card hover:shadow-lift transition-shadow !p-5 flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{candidateName}</h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                    {app.JobPost && (
                      <span className="text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2.5 py-0.5 rounded-full font-medium">
                        Vị trí: {app.JobPost.title}
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-slate-500 flex flex-wrap items-center gap-y-1 gap-x-4">
                    {candidateEmail && (
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="mail" className="w-4 h-4 text-slate-400" />
                        <a href={`mailto:${candidateEmail}`} className="text-slate-700 hover:text-primary-600 hover:underline">{candidateEmail}</a>
                      </span>
                    )}
                    {app.CandidateProfile?.professional_title && (
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="briefcase" className="w-4 h-4 text-slate-400" />
                        {app.CandidateProfile.professional_title}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="clock" className="w-4 h-4 text-slate-400" />
                      Nộp lúc: {new Date(app.applied_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  {/* Skills */}
                  {app.CandidateProfile?.Skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {app.CandidateProfile.Skills.map((s, idx) => (
                        <span key={idx} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Cover letter */}
                  {app.cover_letter && (
                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                      <strong className="text-slate-700 block mb-1">Thư giới thiệu:</strong>
                      <p className="whitespace-pre-line line-clamp-3">{app.cover_letter}</p>
                    </div>
                  )}
                </div>

                {/* Actions & CV viewing */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
                  {cvFileUrl ? (
                    <a
                      href={cvFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs !py-2 !px-4"
                    >
                      <Icon name="document" className="w-4 h-4" /> Xem CV đính kèm
                      <Icon name="external" className="w-3.5 h-3.5 opacity-80" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500 italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      Chưa đính kèm CV
                    </span>
                  )}

                  {/* Status dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Trạng thái:</span>
                    <select
                      value={app.status}
                      disabled={updatingId === app.id}
                      onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                      className="input-field w-auto text-xs !py-1 !px-2.5 font-medium"
                    >
                      <option value="PENDING">Chờ duyệt</option>
                      <option value="VIEWED">Đã xem</option>
                      <option value="INTERVIEW">Phỏng vấn</option>
                      <option value="HIRED">Đã tuyển</option>
                      <option value="REJECTED">Từ chối</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
