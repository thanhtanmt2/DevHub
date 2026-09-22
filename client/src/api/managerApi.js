import api from './axiosInstance';

export const managerApi = {
  getManagedProjects: () => api.get('/candidates/managed-projects'),
  getProjectJobs: (projectId) => api.get(`/candidates/managed-projects/${projectId}/jobs`),
  createProjectJob: (projectId, data) => api.post(`/candidates/managed-projects/${projectId}/jobs`, data),
  updateApplicationStatus: (id, data) => api.put(`/candidates/managed-projects/applications/${id}/status`, data),
  scheduleInterview: (id, data) => api.post(`/candidates/managed-projects/applications/${id}/schedule-interview`, data),
  createTask: (workspaceId, data) => api.post(`/candidates/managed-projects/workspaces/${workspaceId}/tasks`, data),
  reviewTask: (taskId, data) => api.put(`/candidates/managed-projects/tasks/${taskId}/review`, data),
  evaluateMember: (workspaceId, memberId, data) => api.post(`/candidates/managed-projects/workspaces/${workspaceId}/members/${memberId}/evaluate`, data)
};
