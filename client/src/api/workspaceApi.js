import api from './axiosInstance';

export const workspaceApi = {
  // Projects
  getProjects: () => api.get('/admin/projects'),
  getProjectById: (id) => api.get(`/admin/projects/${id}`),
  createProject: (data) => api.post('/admin/projects', data),
  updateProject: (id, data) => api.put(`/admin/projects/${id}`, data),
  updateProjectManager: (id, data) => api.put(`/admin/projects/${id}/manager`, data),
  searchCandidates: (query) => api.get('/admin/candidates/search', { params: query }),
  
  // Workspace & Members
  getWorkspaceDetail: (id) => api.get(`/workspaces/${id}`),
  addMember: (workspaceId, data) => api.post(`/admin/workspaces/${workspaceId}/members`, data),
  removeMember: (workspaceId, memberId) => api.delete(`/admin/workspaces/${workspaceId}/members/${memberId}`),
};
