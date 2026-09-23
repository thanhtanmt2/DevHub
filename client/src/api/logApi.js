import api from './axiosInstance';

export const logApi = {
  // Lấy danh sách log toàn hệ thống (Admin)
  getSystemLogs: (params) => {
    return api.get('/admin/logs', { params });
  },

  // Lấy log của một workspace cụ thể
  getWorkspaceLogs: (workspaceId, params) => {
    return api.get(`/workspaces/${workspaceId}/logs`, { params });
  },
};
