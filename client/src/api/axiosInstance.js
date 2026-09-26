// file cấu hình axios: tự đính kèm token và tự động gia hạn 
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  // cho phép đính kèm cookie gửi lên backend 
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// tự động đính kèm token trong mỗi req gửi lên backend 
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  // nếu có access token nó sẽ được dán vào phần header Authorization dưới chuẩn Bearer
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor – auto-refresh on 401
// khi có lỗi 401, access token hết hạn
let isRefreshing = false; // đảm bảo chỉ có 1 req làm nhiệm vụ gia hạn
let failedQueue = [];// hàng đợi lưu các req bị lỗi chờ được gia hạn xong thì xử lý tiếp

// hàm này giúp giải phóng các Request đang bị xếp hàng
// Nếu xin thẻ mới thành công, nó phát thẻ cho mọi người qua cổng. Nếu xin thất bại, nó báo lỗi cho tất cả.
const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

// Interceptor bắt lỗi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry &&
      !originalRequest.url.includes('/auth/')) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
