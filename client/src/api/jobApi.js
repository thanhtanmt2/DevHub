import api from './axiosInstance';

export const jobApi = {
  // Public
  getJobs: (params) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  
  // Candidate
  apply: (data) => api.post('/applications', data),
  
  // Employer
  getMyJobs: () => api.get('/employer/jobs'),
  getMyJob: (id) => api.get(`/employer/jobs/${id}`),
  createJob: (data) => api.post('/employer/jobs', data),
  updateJob: (id, data) => api.put(`/employer/jobs/${id}`, data),
  reopenJob: (id, data) => api.put(`/employer/jobs/${id}/reopen`, data),
  duplicateJob: (id, data) => api.post(`/employer/jobs/${id}/duplicate`, data),
  closeJob: (id) => api.delete(`/employer/jobs/${id}`),
  getAllEmployerApplications: (params) => api.get('/employer/applications', { params }),
  getJobApplications: (jobId) => api.get(`/employer/jobs/${jobId}/applications`),
  updateApplicationStatus: (id, data) => api.put(`/employer/applications/${id}/status`, data),
  
  // Admin
  getAdminJobs: (params) => api.get('/admin/jobs', { params }),
  createAdminJob: (data) => api.post('/admin/jobs', data),
  getAdminJobApplications: (jobId) => api.get(`/admin/jobs/${jobId}/applications`),
};
