import api from './axiosInstance';

export const candidateApi = {
  // Profile
  getProfile: () => api.get('/candidates/profile'),
  updateProfile: (data) => api.put('/candidates/profile', data),
  
  // Skills
  getSkills: () => api.get('/candidates/skills'),
  addSkill: (data) => api.post('/candidates/skills', data),
  updateSkill: (skillId, data) => api.put(`/candidates/skills/${skillId}`, data),
  removeSkill: (skillId) => api.delete(`/candidates/skills/${skillId}`),
  
  // Experiences
  getExperiences: () => api.get('/candidates/experiences'),
  addExperience: (data) => api.post('/candidates/experiences', data),
  updateExperience: (id, data) => api.put(`/candidates/experiences/${id}`, data),
  deleteExperience: (id) => api.delete(`/candidates/experiences/${id}`),
  
  // Payment info
  getPaymentInfo: () => api.get('/candidates/payment-info'),
  upsertPaymentInfo: (data) => api.post('/candidates/payment-info', data),
  
  // CV Management (Multiple CVs)
  getMyCvs: () => api.get('/candidates/cvs'),
  addCv: (data) => api.post('/candidates/cvs', data),
  setDefaultCv: (id) => api.put(`/candidates/cvs/${id}/default`),
  deleteCv: (id) => api.delete(`/candidates/cvs/${id}`),
  
  // Workspaces & payments
  getMyWorkspaces: () => api.get('/candidates/workspaces'),
  getMyPayments: () => api.get('/candidates/payments'),
  getMyApplications: () => api.get('/applications/mine'),
  getMyProjectApplications: () => api.get('/candidates/project-applications'),
  getApplicationDetail: (id) => api.get(`/applications/${id}`),
};
