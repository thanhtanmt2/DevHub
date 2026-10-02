import api from './axiosInstance';

export const adminApi = {
  // Stats
  getStats: () => api.get('/admin/stats'),
  
  // Users
  getUsers: () => api.get('/admin/users'),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`),
  
  // Payments
  getPayments: () => api.get('/admin/payments'),
  createPayment: (data) => api.post('/admin/payments', data),
  processPayment: (id, data) => api.put(`/admin/payments/${id}/process`, data),
  
  // Evaluation
  evaluateCandidate: (workspaceId, memberId, data) => api.post(`/admin/workspaces/${workspaceId}/members/${memberId}/evaluate`, data),
  
  // Jobs moderation
  getJobs: (params) => api.get('/admin/jobs', { params }),
  approveJob: (id) => api.put(`/admin/jobs/${id}/approve`),
  rejectJob: (id, data) => api.put(`/admin/jobs/${id}/reject`, data),

  // Company verification
  getCompanies: (params) => api.get('/admin/companies', { params }),
  verifyCompany: (id, data) => api.put(`/admin/companies/${id}/verify`, data),
};
