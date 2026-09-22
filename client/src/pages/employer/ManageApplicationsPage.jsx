import { useState, useEffect } from 'react';
import { jobApi } from '@/api/jobApi';
import { toast } from 'react-hot-toast';

const STATUS_LABELS = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  VIEWED: { label: 'Đã xem', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  INTERVIEW: { label: 'Phỏng vấn', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  HIRED: { label: 'Đã tuyển', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  REJECTED: { label: 'Từ chối', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Quản lý hồ sơ ứng tuyển</h1>
          <p className="text-gray-400 text-sm mt-1">
            Xem và xử lý hồ sơ, CV của các ứng viên nộp vào tin tuyển dụng công ty
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-wrap gap-4 items-center bg-gray-900/60 border border-gray-800 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tin tuyển dụng:</label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="input text-sm py-1.5 px-3 bg-gray-800 border-gray-700 rounded-lg text-white"
          >
            <option value="">Tất cả vị trí ({jobs.length})</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trạng thái:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input text-sm py-1.5 px-3 bg-gray-800 border-gray-700 rounded-lg text-white"
          >
            <option value="">Tất cả trạng thái</option>
            {Object.entries(STATUS_LABELS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-sm text-gray-400">
          Tổng cộng: <strong className="text-white">{applications.length}</strong> hồ sơ
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="card text-center py-16 text-gray-400">Đang tải danh sách hồ sơ...</div>
      ) : applications.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">📂</div>
          <h3 className="text-lg font-bold text-white mb-1">Chưa có hồ sơ ứng tuyển nào</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
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
                className="card bg-gray-900/60 border border-gray-800 hover:border-gray-700 transition p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-bold text-white">{candidateName}</h3>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                    {app.JobPost && (
                      <span className="text-xs bg-gray-800 text-primary-400 border border-gray-700 px-2.5 py-0.5 rounded-full font-medium">
                        Vị trí: {app.JobPost.title}
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-400 flex flex-wrap items-center gap-y-1 gap-x-4">
                    {candidateEmail && (
                      <span>📧 <a href={`mailto:${candidateEmail}`} className="text-gray-300 hover:underline">{candidateEmail}</a></span>
                    )}
                    {app.CandidateProfile?.professional_title && (
                      <span>💼 {app.CandidateProfile.professional_title}</span>
                    )}
                    <span>🕒 Nộp lúc: {new Date(app.applied_at).toLocaleDateString('vi-VN')}</span>
                  </div>

                  {/* Skills */}
                  {app.CandidateProfile?.Skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {app.CandidateProfile.Skills.map((s, idx) => (
                        <span key={idx} className="text-xs bg-gray-800/80 text-gray-300 px-2 py-0.5 rounded border border-gray-700/50">
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Cover letter */}
                  {app.cover_letter && (
                    <div className="text-xs text-gray-400 bg-gray-800/40 p-2.5 rounded-lg border border-gray-800 mt-2">
                      <strong className="text-gray-300 block mb-1">Thư giới thiệu:</strong>
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
                      className="btn btn-primary text-xs py-2 px-4 flex items-center gap-1.5 shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20"
                    >
                      <span>📄</span> Xem CV đính kèm ↗
                    </a>
                  ) : (
                    <span className="text-xs text-gray-500 italic bg-gray-800/50 px-3 py-1.5 rounded-lg border border-gray-800">
                      Chưa đính kèm CV
                    </span>
                  )}

                  {/* Status dropdown */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Trạng thái:</span>
                    <select
                      value={app.status}
                      disabled={updatingId === app.id}
                      onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                      className="input text-xs py-1 px-2.5 bg-gray-800 border-gray-700 rounded-lg text-white font-medium"
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
