import api from './axiosInstance';

export const skillApi = {
  getPublicSkills: () => api.get('/skills'),
  // Admin
  getAllSkills: () => api.get('/admin/skills'),
  createSkill: (data) => api.post('/admin/skills', data),
  updateSkill: (id, data) => api.put(`/admin/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/admin/skills/${id}`),
};
