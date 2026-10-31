import api from './axiosInstance';

export const homeApi = {
  // Số liệu, lĩnh vực và doanh nghiệp tiêu biểu (công khai)
  getOverview: () => api.get('/home/overview'),
  // Việc làm đề xuất: cá nhân hóa theo kỹ năng nếu là ứng viên đã đăng nhập, ngược lại là việc làm nổi bật
  getRecommendedJobs: (params) => api.get('/home/recommended-jobs', { params }),
};
