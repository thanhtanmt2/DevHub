import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { workspaceApi } from '@/api/workspaceApi';
import { projectJobApi } from '@/api/projectJobApi';
import { skillApi } from '@/api/skillApi';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import toast from 'react-hot-toast';

const formatCurrency = (amount) => {
  if (!amount) return '0đ';
  return `${new Intl.NumberFormat('vi-VN').format(amount)}đ`;
};

export default function InternalProjectsPage() {
  const qc = useQueryClient();
  const [showAddProject, setShowAddProject] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', description: '', budget: '', expected_end_date: '' });

  // Add Job Modal State
  const [activeProjectForJob, setActiveProjectForJob] = useState(null);
  const [jobForm, setJobForm] = useState({ title: '', description: '', budget: '', deadline: '', skill_ids: [] });

  // View Applications Modal State
  const [viewJobsProject, setViewJobsProject] = useState(null);

  const { data: projectsRes, isLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => workspaceApi.getProjects(),
  });

  const { data: skillsRes } = useQuery({
    queryKey: ['public-skills'],
    queryFn: () => skillApi.getPublicSkills(),
  });

  const { data: projectJobsRes, isLoading: jobsLoading } = useQuery({
    queryKey: ['admin-project-jobs', viewJobsProject?.id],
    queryFn: () => projectJobApi.getAdminProjectJobs(viewJobsProject.id),
    enabled: !!viewJobsProject,
  });

  // Create Project
  const createProjectMutation = useMutation({
    mutationFn: (data) => workspaceApi.createProject({ ...data, budget: parseFloat(data.budget) || 0 }),
    onSuccess: () => {
      qc.invalidateQueries(['admin-projects']);
      setShowAddProject(false);
      setProjectForm({ name: '', description: '', budget: '', expected_end_date: '' });
      toast.success('Đã tạo dự án & Workspace!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi tạo dự án'),
  });

  // Create Project Job
  const createJobMutation = useMutation({
    mutationFn: ({ projectId, data }) => projectJobApi.createAdminProjectJob(projectId, {
      ...data,
      budget: parseFloat(data.budget) || 0
    }),
    onSuccess: () => {
      qc.invalidateQueries(['admin-projects']);
      if (viewJobsProject) qc.invalidateQueries(['admin-project-jobs', viewJobsProject.id]);
      setActiveProjectForJob(null);
      setJobForm({ title: '', description: '', budget: '', deadline: '', skill_ids: [] });
      toast.success('Đã thêm vị trí công việc vào dự án!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Lỗi khi thêm vị trí'),
  });

  // Review Application
  const reviewAppMutation = useMutation({
    mutationFn: ({ appId, status }) => projectJobApi.updateProjectApplicationStatus(appId, { status }),
    onSuccess: (res) => {
      if (viewJobsProject) qc.invalidateQueries(['admin-project-jobs', viewJobsProject.id]);
      qc.invalidateQueries(['admin-projects']);
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
          <h1 className="text-2xl font-bold">Quản lý Dự án Thời vụ & Vị trí tuyển dụng</h1>
          <p className="text-sm text-gray-500">Quản lý các dự án nội bộ và vị trí tuyển dụng thời vụ</p>
        </div>
        <button onClick={() => setShowAddProject(!showAddProject)} className="btn-primary">
          + Tạo Dự án Mới
        </button>
      </div>

      {/* Form tạo dự án */}
      {showAddProject && (
        <div className="card border border-primary-100 bg-primary-50/20 animate-fade-in">
          <h2 className="font-semibold text-lg mb-4 text-primary-900">Khởi tạo Dự án Mới</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên dự án</label>
              <input
                className="input-field"
                placeholder="VD: Nền tảng E-commerce B2B"
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tổng ngân sách dự án (VNĐ)</label>
              <input
                type="number"
                className="input-field"
                placeholder="30000000"
                value={projectForm.budget}
                onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hạn hoàn thành dự kiến</label>
              <input
                type="date"
                className="input-field"
                value={projectForm.expected_end_date}
                onChange={(e) => setProjectForm({ ...projectForm, expected_end_date: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả mục tiêu dự án</label>
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder="Mô tả phạm vi, yêu cầu chất lượng..."
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => createProjectMutation.mutate(projectForm)}
              disabled={!projectForm.name || createProjectMutation.isPending}
              className="btn-primary"
            >
              {createProjectMutation.isPending ? 'Đang tạo...' : 'Xác nhận tạo dự án'}
            </button>
            <button onClick={() => setShowAddProject(false)} className="btn-secondary">
              Hủy
            </button>
          </div>
        </div>
      )}

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
                  to={`/admin/workspaces/${project.Workspace.id}`}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Kỹ năng yêu cầu</label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-lg">
                  {skills.map((s) => {
                    const isSelected = jobForm.skill_ids.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          const updated = isSelected
                            ? jobForm.skill_ids.filter((id) => id !== s.id)
                            : [...jobForm.skill_ids, s.id];
                          setJobForm({ ...jobForm, skill_ids: updated });
                        }}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả công việc vị trí</label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Nhiệm vụ cụ thể, tính năng cần làm..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setActiveProjectForJob(null)}
                  className="btn-secondary"
                >
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
        </div>
      )}

      {/* Modal Xem Vị Trí & Hồ Sơ Ứng Tuyển (Project Jobs & Applications) */}
      {viewJobsProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-xl max-h-[90vh] flex flex-col animate-fade-in">
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
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-base text-gray-900">{job.title}</h3>
                        <p className="text-xs text-green-700 font-semibold">
                          Thù lao: {formatCurrency(job.budget)} | Trạng thái: {job.status}
                        </p>
                      </div>
                      <span className="badge bg-purple-100 text-purple-700 text-xs">
                        {job.ProjectApplications?.length || 0} ứng viên nộp
                      </span>
                    </div>

                    {/* Danh sách ứng viên nộp cho vị trí này */}
                    <div className="mt-3 bg-white rounded border border-gray-200 overflow-hidden">
                      <div className="px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-600 border-b">
                        Hồ sơ ứng tuyển ({job.ProjectApplications?.length || 0})
                      </div>

                      {job.ProjectApplications?.length === 0 ? (
                        <p className="p-3 text-xs text-gray-400 italic">Chưa có ứng viên nào nộp hồ sơ.</p>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {job.ProjectApplications?.map((app) => (
                            <div key={app.id} className="p-3 flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-sm text-gray-900">
                                    {app.CandidateProfile?.User?.full_name} ({app.CandidateProfile?.User?.email})
                                  </p>
                                  {app.cv_url && (
                                    <a
                                      href={app.cv_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] flex items-center gap-1 border border-blue-200 transition-colors"
                                    >
                                      📄 Xem CV
                                    </a>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-1 italic mt-0.5">
                                  "{app.cover_letter}"
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`badge text-xs ${
                                  app.status === 'ACCEPTED'
                                    ? 'bg-green-100 text-green-700'
                                    : app.status === 'REJECTED'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {app.status === 'ACCEPTED' ? 'Trúng tuyển (Đã vào WS)' : app.status}
                                </span>

                                {app.status === 'PENDING' && (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => reviewAppMutation.mutate({ appId: app.id, status: 'ACCEPTED' })}
                                      className="px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                                    >
                                      Duyệt & Thêm vào WS
                                    </button>
                                    <button
                                      onClick={() => reviewAppMutation.mutate({ appId: app.id, status: 'REJECTED' })}
                                      className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs"
                                    >
                                      Từ chối
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
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
    </div>
  );
}
