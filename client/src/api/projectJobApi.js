import api from './axiosInstance';

export const projectJobApi = {
  // Public
  getProjectJobs: (params) => api.get('/project-jobs', { params }),
  getProjectJobById: (id) => api.get(`/project-jobs/${id}`),

  // Public — Cổng thông tin & chấm điểm dành cho Người phỏng vấn qua link share
  getInterviewerPortal: (token) => api.get(`/project-jobs/interviewer-portal/${token}`),
  submitInterviewerEvaluation: (token, appId, data) =>
    api.post(`/project-jobs/interviewer-portal/${token}/applications/${appId}/evaluate`, data),

  // Candidate
  applyProjectJob: (id, data) => api.post(`/project-jobs/${id}/apply`, data),
  getMyProjectApplications: () => api.get('/candidates/project-applications'),
  getCandidateInterviewSlots: (id) => api.get(`/candidates/project-applications/${id}/interview-slots`),

  // Admin
  getAdminProjectJobs: (projectId) => api.get(`/admin/projects/${projectId}/jobs`),
  createAdminProjectJob: (projectId, data) => api.post(`/admin/projects/${projectId}/jobs`, data),
  updateAdminProjectJob: (id, data) => api.put(`/admin/project-jobs/${id}`, data),
  updateProjectApplicationStatus: (id, data) => api.put(`/admin/project-applications/${id}/status`, data),
  scheduleInterview: (id, data) => api.post(`/admin/project-applications/${id}/schedule-interview`, data),
  getAdminInterviews: (params) => api.get('/admin/interviews', { params }),
  getInterviewers: () => api.get('/admin/interviewers'),
  createInterviewer: (data) => api.post('/admin/interviewers', data),
  updateInterviewer: (id, data) => api.put(`/admin/interviewers/${id}`, data),
  regenerateInterviewerToken: (id) => api.post(`/admin/interviewers/${id}/regenerate-token`),
  deleteInterviewer: (id) => api.delete(`/admin/interviewers/${id}`),
  respondProjectInterview: (id, data) => api.put(`/candidates/project-applications/${id}/interview-response`, data),
};
