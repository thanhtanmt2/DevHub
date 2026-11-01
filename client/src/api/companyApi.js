import api from './axiosInstance';

export const companyApi = {
  getMyCompany: () => api.get('/employer/company'),
  createCompany: (data) => api.post('/employer/company', data),
  updateCompany: (data) => api.put('/employer/company', data),
  sendVerifyEmail: (email) => api.post('/employer/company/send-verify-email', { email }),
  verifyEmail: (otp) => api.post('/employer/company/verify-email', { otp }),
  getEmployerStats: () => api.get('/employer/stats'),
  // Candidate search (Employer)
  searchCandidates: (params) => api.get('/employer/candidates', { params }),
  getCandidateProfile: (id) => api.get(`/employer/candidates/${id}`),
  toggleSaveCandidate: (id) => api.post(`/employer/candidates/${id}/save`),
  // Admin
  getAllCompanies: (params) => api.get('/admin/companies', { params }),
  verifyCompany: (id, data) => api.put(`/admin/companies/${id}/verify`, data),
};
