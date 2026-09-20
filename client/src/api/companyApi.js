import api from './axiosInstance';

export const companyApi = {
  getMyCompany: () => api.get('/employer/company'),
  createCompany: (data) => api.post('/employer/company', data),
  updateCompany: (data) => api.put('/employer/company', data),
  getEmployerStats: () => api.get('/employer/stats'), // NEW
  // Admin
  getAllCompanies: (params) => api.get('/admin/companies', { params }),
  verifyCompany: (id, data) => api.put(`/admin/companies/${id}/verify`, data),
};
