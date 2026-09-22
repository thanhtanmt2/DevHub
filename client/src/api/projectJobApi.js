import api from './axiosInstance';

export const projectJobApi = {
  // Public
  getProjectJobs: (params) => api.get('/project-jobs', { params }),
  getProjectJobById: (id) => api.get(`/project-jobs/${id}`),

  // Candidate
  applyProjectJob: (id, data) => api.post(`/project-jobs/${id}/apply`, data),
  getMyProjectApplications: () => api.get('/candidates/project-applications'),

  // Admin
  getAdminProjectJobs: (projectId) => api.get(`/admin/projects/${projectId}/jobs`),
  createAdminProjectJob: (projectId, data) => api.post(`/admin/projects/${projectId}/jobs`, data),
  updateProjectApplicationStatus: (id, data) => api.put(`/admin/project-applications/${id}/status`, data),
  scheduleInterview: (id, data) => api.post(`/admin/project-applications/${id}/schedule-interview`, data),
};
