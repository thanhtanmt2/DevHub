import api from './axiosInstance';

export const taskApi = {
  getWorkspaceTasks: (workspaceId) => api.get(`/tasks/workspace/${workspaceId}`),
  createTask: (workspaceId, data) => api.post(`/tasks/workspace/${workspaceId}`, data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  
  submitTask: (id, data) => api.post(`/tasks/${id}/submissions`, data),
  getSubmissions: (id) => api.get(`/tasks/${id}/submissions`),
  reviewSubmission: (id, data) => api.put(`/tasks/submissions/${id}/review`, data),
};
