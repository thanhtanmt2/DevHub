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
};
