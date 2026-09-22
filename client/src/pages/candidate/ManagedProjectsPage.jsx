import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { managerApi } from '@/api/managerApi';
import { skillApi } from '@/api/skillApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const formatCurrency = (amount) => {
  if (!amount) return '0đ';
  return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
};

const STATUS_LABELS = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-700' },
  REVIEWING: { label: 'Đang xét duyệt', color: 'bg-blue-100 text-blue-700' },
  INTERVIEW: { label: 'Mời phỏng vấn', color: 'bg-purple-100 text-purple-700' },
  ACCEPTED: { label: 'Trúng tuyển ✅', color: 'bg-green-100 text-green-700' },
  REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-700' },
};

// ─── Candidate Detail Panel ─────────────────────────────────────────────────
function CandidateDetailPanel({ app, onClose }) {
  const profile = app.CandidateProfile;
  const user = profile?.User;
  const skills = profile?.Skills || [];
  const members = profile?.WorkspaceMembers || [];
  const scoredMembers = members.filter(m => m.CandidateEvaluation);
  const avgScore = scoredMembers.length > 0
    ? (scoredMembers.reduce((s, m) => s + parseFloat(m.CandidateEvaluation.score), 0) / scoredMembers.length).toFixed(1)
    : null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{user?.full_name}</h3>
            <p className="text-sm text-gray-500">{user?.email} · {profile?.professional_title || 'Chưa cập nhật chức danh'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* CV & Links */}
          <div className="flex flex-wrap gap-2">
            {app.cv_url && (
              <a href={app.cv_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium border border-blue-200 transition-colors">
                📄 Xem CV đính kèm
              </a>
            )}
            {profile?.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                🐙 GitHub
              </a>
            )}
            {profile?.portfolio_url && (
              <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                🌐 Portfolio
              </a>
            )}
          </div>

          {/* Score & Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-indigo-700">{profile?.competency_score ?? '—'}</p>
              <p className="text-xs text-indigo-500 mt-0.5">Điểm năng lực</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-amber-600">{avgScore ?? '—'}</p>
              <p className="text-xs text-amber-500 mt-0.5">Điểm đánh giá TB</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-emerald-700">{members.length}</p>
              <p className="text-xs text-emerald-500 mt-0.5">Dự án đã tham gia</p>
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">🛠️ Kỹ năng</h4>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span key={skill.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {skill.name}
                    {skill.CandidateSkill?.level && (
                      <span className="text-gray-400">· {skill.CandidateSkill.level}</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Cover Letter */}
          {app.cover_letter && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">📝 Thư xin việc</h4>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 italic leading-relaxed border border-gray-200">
                "{app.cover_letter}"
              </div>
            </div>
          )}

          {/* Project History */}
          {members.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">🏗️ Lịch sử dự án trên DevHub</h4>
              <div className="space-y-2">
                {members.map(member => (
                  <div key={member.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {member.Workspace?.Project?.name || 'Dự án không tên'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Tham gia: {member.joined_at ? new Date(member.joined_at).toLocaleDateString('vi-VN') : '—'} · Trạng thái: {member.status}
                      </p>
                    </div>
                    {member.CandidateEvaluation ? (
                      <div className="text-right flex-shrink-0">
                        <span className="text-lg font-bold text-indigo-700">{parseFloat(member.CandidateEvaluation.score).toFixed(1)}</span>
                        <span className="text-xs text-gray-400">/10</span>
                        {member.CandidateEvaluation.comment && (
                          <p className="text-xs text-gray-500 max-w-[160px] text-right line-clamp-1">{member.CandidateEvaluation.comment}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Chưa đánh giá</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interview info (if scheduled) */}
          {app.interview_time && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <h4 className="text-sm font-semibold text-purple-800 mb-1">📅 Lịch phỏng vấn đã đặt</h4>
              <p className="text-sm text-purple-700">
                {new Date(app.interview_time).toLocaleString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              {app.meet_url && (
                <a href={app.meet_url} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-sm text-purple-600 hover:text-purple-800 underline">
                  🎥 {app.meet_url}
                </a>
              )}
              {app.interview_note && (
                <p className="text-xs text-purple-600 mt-1 italic">{app.interview_note}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Schedule Interview Modal ────────────────────────────────────────────────
function ScheduleInterviewModal({ app, onClose, onSuccess }) {
  const [form, setForm] = useState({
    interview_date: '',
    interview_time: '',
    meet_url: '',
    interview_note: ''
  });
  const [sending, setSending] = useState(false);

  const profile = app.CandidateProfile;
  const user = profile?.User;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.interview_date || !form.interview_time || !form.meet_url) {
      toast.error('Vui lòng điền đầy đủ ngày giờ và link Google Meet');
      return;
    }
    const interview_time = new Date(`${form.interview_date}T${form.interview_time}:00`).toISOString();
    setSending(true);
    try {
      await managerApi.scheduleInterview(app.id, {
        interview_time,
        meet_url: form.meet_url,
        interview_note: form.interview_note || undefined
      });
      toast.success('Đã gửi lịch phỏng vấn qua email thành công!');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi gửi lịch phỏng vấn');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl p-5 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold">📅 Đặt lịch phỏng vấn</h3>
              <p className="text-indigo-200 text-sm mt-0.5">Lịch sẽ được gửi qua email đến ứng viên</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-xl font-bold leading-none">✕</button>
          </div>
          <div className="mt-3 bg-white/10 rounded-lg p-2.5 text-sm">
            <p className="font-medium">{user?.full_name}</p>
            <p className="text-indigo-200 text-xs">{user?.email}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày phỏng vấn *</label>
              <input
                type="date"
                className="input-field"
                min={new Date().toISOString().split('T')[0]}
                value={form.interview_date}
                onChange={e => setForm({ ...form, interview_date: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ phỏng vấn *</label>
              <input
                type="time"
                className="input-field"
                value={form.interview_time}
                onChange={e => setForm({ ...form, interview_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link Google Meet *
              <a href="https://meet.google.com/new" target="_blank" rel="noopener noreferrer"
                className="ml-2 text-indigo-600 hover:text-indigo-800 text-xs underline">
                Tạo phòng Meet mới ↗
              </a>
            </label>
            <input
              type="url"
              className="input-field"
              placeholder="https://meet.google.com/xxx-yyyy-zzz"
              value={form.meet_url}
              onChange={e => setForm({ ...form, meet_url: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm cho ứng viên (tùy chọn)</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="VD: Vui lòng chuẩn bị giới thiệu bản thân và portfolio trong 5 phút đầu..."
              value={form.interview_note}
              onChange={e => setForm({ ...form, interview_note: e.target.value })}
            />
          </div>

          {/* Preview */}
          {form.interview_date && form.interview_time && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-blue-800 mb-1">📬 Preview email sẽ gửi:</p>
              <p className="text-blue-700">
                Kính gửi <strong>{user?.full_name}</strong>, bạn được mời phỏng vấn vào lúc{' '}
                <strong>{form.interview_time}</strong> ngày{' '}
                <strong>{new Date(form.interview_date).toLocaleDateString('vi-VN')}</strong> qua Google Meet.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Hủy</button>
            <button
              type="submit"
              disabled={sending}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang gửi...
                </>
              ) : (
                '📧 Gửi lịch phỏng vấn'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Assign Manager Modal ───────────────────────────────────────────────────
function AssignManagerModal({ project, onClose, onAssign }) {
  const [email, setEmail] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  const searchCandidates = async () => {
    if (!email) return;
    setSearching(true);
    try {
      const res = await managerApi.searchCandidates({ email });
      setCandidates(res.data?.data || []);
      setSelectedCandidate(null);
    } catch (err) {
      toast.error('Lỗi khi tìm kiếm');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl p-6">
        <h3 className="text-lg font-bold mb-2">Cấp quyền Quản lý Dự án</h3>
        <p className="text-sm text-gray-500 mb-4">Dự án: <span className="font-semibold text-gray-800">{project.name}</span></p>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Nhập email ứng viên (VD: dev@gmail.com)" 
              className="input-field flex-1"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && searchCandidates()}
            />
            <button type="button" onClick={searchCandidates} disabled={searching} className="btn-secondary whitespace-nowrap">
              Tìm kiếm
            </button>
          </div>
          
          <div className="min-h-[150px] max-h-[300px] overflow-y-auto border rounded-lg p-2 bg-gray-50">
            {candidates.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">Chưa có kết quả tìm kiếm.</p>
            ) : (
              <div className="space-y-2">
                {candidates.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => setSelectedCandidate(c)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedCandidate?.id === c.id ? 'bg-indigo-50 border-indigo-500' : 'bg-white hover:bg-gray-50 border-gray-200'}`}
                  >
                    <p className="font-medium">{c.User?.full_name}</p>
                    <p className="text-xs text-gray-500">{c.User?.email} · {c.professional_title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 justify-end mt-4">
            {project.Manager && (
              <button 
                type="button"
                onClick={() => onAssign(null)} 
                className="btn-secondary text-red-600 border-red-200 hover:bg-red-50 mr-auto"
              >
                Gỡ quyền quản lý hiện tại
              </button>
            )}
            <button type="button" onClick={onClose} className="btn-secondary">Hủy</button>
            <button 
              type="button"
              onClick={() => onAssign(selectedCandidate.id)} 
              disabled={!selectedCandidate} 
              className="btn-primary"
            >
              Lưu & Cấp quyền
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ManagedProjectsPage() {
  const qc = useQueryClient();
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', budget: '', expected_end_date: '' });

  // Add Job Modal State
  const [activeProjectForJob, setActiveProjectForJob] = useState(null);
  const [jobForm, setJobForm] = useState({ title: '', description: '', budget: '', deadline: '', skill_ids: [] });

  // View Applications Modal State
  const [viewJobsProject, setViewJobsProject] = useState(null);

  // Assign Manager Modal State
  const [assignManagerProject, setAssignManagerProject] = useState(null);

  // Candidate detail & interview
  const [detailApp, setDetailApp] = useState(null);
  const [interviewApp, setInterviewApp] = useState(null);

  const { data: projectsRes, isLoading } = useQuery({
    queryKey: ['managed-projects'],
    queryFn: () => managerApi.getManagedProjects(),
  });

  const { data: skillsRes } = useQuery({
    queryKey: ['public-skills'],
    queryFn: () => skillApi.getPublicSkills(),
  });

  const { data: projectJobsRes, isLoading: jobsLoading } = useQuery({
    queryKey: ['managed-project-jobs', viewJobsProject?.id],
    queryFn: () => managerApi.getProjectJobs(viewJobsProject.id),
    enabled: !!viewJobsProject,
  });

  // Create Project
  const createProjectMutation = useMutation({
    mutationFn: (data) => managerApi.createProject({ ...data, budget: parseFloat(data.budget) || 0 }),
    onSuccess: () => {
      qc.invalidateQueries(['managed-projects']);
      setShowAddProject(false);
      setProjectForm({ name: '', description: '', budget: '', expected_end_date: '' });
      toast.success('Đã tạo dự án & Workspace!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi tạo dự án'),
  });

  // Assign Manager
  const assignManagerMutation = useMutation({
    mutationFn: ({ projectId, manager_id }) => managerApi.updateProjectManager(projectId, { manager_id }),
    onSuccess: () => {
      qc.invalidateQueries(['managed-projects']);
      setAssignManagerProject(null);
      toast.success('Đã cập nhật quyền quản lý dự án!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi cập nhật quyền quản lý'),
  });

  // Create Project Job
  const createJobMutation = useMutation({
    mutationFn: ({ projectId, data }) => managerApi.createProjectJob(projectId, {
      ...data,
      budget: parseFloat(data.budget) || 0
    }),
    onSuccess: () => {
      qc.invalidateQueries(['managed-projects']);
      if (viewJobsProject) qc.invalidateQueries(['managed-project-jobs', viewJobsProject.id]);
      setActiveProjectForJob(null);
      setJobForm({ title: '', description: '', budget: '', deadline: '', skill_ids: [] });
      toast.success('Đã thêm vị trí công việc vào dự án!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi thêm vị trí'),
  });

  // Review Application (status update)
  const reviewAppMutation = useMutation({
    mutationFn: ({ appId, status }) => managerApi.updateApplicationStatus(appId, { status }),
    onSuccess: (res) => {
      if (viewJobsProject) qc.invalidateQueries(['managed-project-jobs', viewJobsProject.id]);
      qc.invalidateQueries(['managed-projects']);
      toast.success(res.data?.message || 'Đã cập nhật hồ sơ');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi duyệt hồ sơ'),
  });

  const projects = projectsRes?.data?.data || [];
  const skills = skillsRes?.data?.data || [];
  const projectJobs = projectJobsRes?.data?.data || [];

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dự án Quản lý</h1>
          <p className="text-sm text-gray-500">Quản lý các dự án bạn được chỉ định</p>
        </div>
        
      </div>



      {/* Danh sách các dự án */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.length === 0 && (
          <div className="card md:col-span-2 text-center py-10 text-gray-400">
            Chưa có dự án nào được tạo. Nhấn nút tạo dự án ở trên để bắt đầu.
          </div>
        )}

        {projects.map((project) => (
          <div key={project.id} className="card hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-900">{project.name}</h3>
                <span className="badge bg-blue-100 text-blue-700 text-xs font-semibold">
                  {project.status}
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1 text-gray-600 mb-4 border border-gray-100">
                <p>💰 <strong>Ngân sách:</strong> {formatCurrency(project.budget)}</p>
                <p>🎯 <strong>Vị trí tuyển dụng:</strong> {project.ProjectJobs?.length || 0} vị trí</p>
                <p>📈 <strong>Tiến độ hoàn thành:</strong> {project.completion_rate}%</p>
                <div className="flex items-center gap-1 pt-1 mt-1 border-t border-gray-200">
                  <p>👤 <strong>Quản lý bởi:</strong> {project.Manager ? project.Manager.User?.full_name : 'Admin (Hệ thống)'}</p>
                  
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewJobsProject(project)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-medium"
                >
                  Xem vị trí & Ứng viên ({project.ProjectJobs?.length || 0})
                </button>
                <button
                  onClick={() => setActiveProjectForJob(project)}
                  className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-medium"
                >
                  + Thêm Vị Trí
                </button>
              </div>

              {project.Workspace && (
                <Link
                  to={`/candidate/workspaces/${project.Workspace.id}`}
                  className="btn-primary text-xs py-1.5 px-3"
                >
                  Vào Workspace →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Thêm Vị Trí (ProjectJob) */}
      {activeProjectForJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl animate-fade-in">
            <h2 className="text-xl font-bold mb-1">Thêm Vị Trí Tuyển Dụng</h2>
            <p className="text-xs text-primary-600 font-medium mb-4">Dự án: {activeProjectForJob.name}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên vị trí công việc</label>
                <input
                  className="input-field"
                  placeholder="VD: Frontend React Developer"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thù lao vị trí (VNĐ)</label>
                <input
                  type="number"
                  className="input-field"
                  placeholder="10000000"
                  value={jobForm.budget}
                  onChange={(e) => setJobForm({ ...jobForm, budget: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hạn nộp hồ sơ</label>
                <input
                  type="date"
                  className="input-field"
                  value={jobForm.deadline}
                  onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả yêu cầu</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Mô tả công việc và yêu cầu kỹ năng..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kỹ năng yêu cầu</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                  {skills.map(skill => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => {
                        const ids = jobForm.skill_ids.includes(skill.id)
                          ? jobForm.skill_ids.filter(id => id !== skill.id)
                          : [...jobForm.skill_ids, skill.id];
                        setJobForm({ ...jobForm, skill_ids: ids });
                      }}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                        jobForm.skill_ids.includes(skill.id)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={() => setActiveProjectForJob(null)} className="btn-secondary">
                Hủy
              </button>
              <button
                type="button"
                onClick={() => createJobMutation.mutate({ projectId: activeProjectForJob.id, data: jobForm })}
                disabled={!jobForm.title || createJobMutation.isPending}
                className="btn-primary"
              >
                {createJobMutation.isPending ? 'Đang tạo...' : 'Tạo Vị Trí Tuyển Dụng'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem Vị Trí & Hồ Sơ Ứng Tuyển */}
      {viewJobsProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 shadow-xl max-h-[90vh] flex flex-col animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <div>
                <h2 className="text-xl font-bold">Vị trí & Ứng viên Dự án</h2>
                <p className="text-xs text-primary-600">{viewJobsProject.name}</p>
              </div>
              <button
                onClick={() => setViewJobsProject(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              {jobsLoading ? (
                <LoadingSpinner />
              ) : projectJobs.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  Dự án này chưa có vị trí công việc nào. Hãy thêm vị trí để ứng viên ứng tuyển.
                </div>
              ) : (
                projectJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 bg-gray-50/50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-base text-gray-900">{job.title}</h3>
                        <p className="text-xs text-green-700 font-semibold">
                          Thù lao: {formatCurrency(job.budget)} · Trạng thái: {job.status}
                        </p>
                        {job.Skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {job.Skills.map(s => (
                              <span key={s.id} className="px-1.5 py-0.5 bg-white border border-gray-200 text-gray-600 rounded text-[10px]">{s.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="badge bg-purple-100 text-purple-700 text-xs">
                        {job.ProjectApplications?.length || 0} ứng viên nộp
                      </span>
                    </div>

                    {/* Danh sách ứng viên */}
                    <div className="bg-white rounded border border-gray-200 overflow-hidden">
                      <div className="px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-600 border-b">
                        Hồ sơ ứng tuyển ({job.ProjectApplications?.length || 0})
                      </div>

                      {job.ProjectApplications?.length === 0 ? (
                        <p className="p-3 text-xs text-gray-400 italic">Chưa có ứng viên nào nộp hồ sơ.</p>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {job.ProjectApplications?.map((app) => {
                            const profile = app.CandidateProfile;
                            const user = profile?.User;
                            const skills = profile?.Skills || [];
                            const members = profile?.WorkspaceMembers || [];
                            const scoredMembers = members.filter(m => m.CandidateEvaluation);
                            const avgScore = scoredMembers.length > 0
                              ? (scoredMembers.reduce((s, m) => s + parseFloat(m.CandidateEvaluation.score), 0) / scoredMembers.length).toFixed(1)
                              : null;
                            const statusInfo = STATUS_LABELS[app.status] || STATUS_LABELS.PENDING;

                            return (
                              <div key={app.id} className="p-3">
                                {/* Row 1: Name + Status */}
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900">{user?.full_name}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                    {profile?.professional_title && (
                                      <p className="text-xs text-indigo-600">{profile.professional_title}</p>
                                    )}
                                  </div>
                                  <span className={`badge text-xs flex-shrink-0 ${statusInfo.color}`}>
                                    {statusInfo.label}
                                  </span>
                                </div>

                                {/* Row 2: Stats */}
                                <div className="flex items-center gap-3 mb-2">
                                  {profile?.competency_score != null && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                                      ⭐ Điểm NL: <strong>{profile.competency_score}</strong>
                                    </span>
                                  )}
                                  {avgScore && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                      🏅 Đánh giá TB: <strong>{avgScore}/10</strong>
                                    </span>
                                  )}
                                  {members.length > 0 && (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                      🏗️ {members.length} dự án
                                    </span>
                                  )}
                                </div>

                                {/* Row 3: Skills */}
                                {skills.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {skills.slice(0, 5).map(s => (
                                      <span key={s.id} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">{s.name}</span>
                                    ))}
                                    {skills.length > 5 && (
                                      <span className="px-1.5 py-0.5 text-gray-400 text-[10px]">+{skills.length - 5}</span>
                                    )}
                                  </div>
                                )}

                                {/* Interview badge */}
                                {app.interview_time && (
                                  <div className="mb-2 text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded px-2 py-1 flex items-center gap-1">
                                    📅 Phỏng vấn: {new Date(app.interview_time).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    {app.meet_url && (
                                      <a href={app.meet_url} target="_blank" rel="noopener noreferrer" className="ml-1 underline hover:text-purple-900">· Meet ↗</a>
                                    )}
                                  </div>
                                )}

                                {/* Row 4: Actions */}
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                  {/* View Profile */}
                                  <button
                                    onClick={() => setDetailApp(app)}
                                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-xs font-medium border border-indigo-100"
                                  >
                                    👤 Xem hồ sơ đầy đủ
                                  </button>

                                  {/* CV Link */}
                                  {app.cv_url && (
                                    <a
                                      href={app.cv_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium border border-blue-100"
                                    >
                                      📄 CV
                                    </a>
                                  )}

                                  {/* Schedule Interview */}
                                  {app.status !== 'ACCEPTED' && app.status !== 'REJECTED' && (
                                    <button
                                      onClick={() => setInterviewApp(app)}
                                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded text-xs font-medium border border-purple-100"
                                    >
                                      📅 Đặt lịch phỏng vấn
                                    </button>
                                  )}

                                  {/* Status Dropdown */}
                                  <select
                                    value={app.status}
                                    onChange={(e) => reviewAppMutation.mutate({ appId: app.id, status: e.target.value })}
                                    disabled={reviewAppMutation.isPending}
                                    className="ml-auto text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary-400 cursor-pointer"
                                  >
                                    <option value="PENDING">Chờ duyệt</option>
                                    <option value="REVIEWING">Đang xét duyệt</option>
                                    <option value="INTERVIEW">Mời phỏng vấn</option>
                                    <option value="ACCEPTED">Duyệt vào WS ✅</option>
                                    <option value="REJECTED">Từ chối</option>
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setViewJobsProject(null)}
                className="btn-secondary"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Detail Panel */}
      {detailApp && (
        <CandidateDetailPanel
          app={detailApp}
          onClose={() => setDetailApp(null)}
        />
      )}

      {/* Schedule Interview Modal */}
      {interviewApp && (
        <ScheduleInterviewModal
          app={interviewApp}
          onClose={() => setInterviewApp(null)}
          onSuccess={() => {
            setInterviewApp(null);
            if (viewJobsProject) qc.invalidateQueries(['managed-project-jobs', viewJobsProject.id]);
          }}
        />
      )}

      {/* Assign Manager Modal */}
      
    </div>
  );
}
