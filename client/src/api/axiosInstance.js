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

// Các endpoint xác thực mà 401 là kết quả thật (sai mật khẩu, phiên đã hết hạn...): không thử gia hạn token.
// /auth/me thì khác: mở lại trang sau >15 phút thì access token đã hết hạn nhưng refresh token (7 ngày) vẫn còn,
// nên phải được gia hạn rồi gọi lại, nếu không người dùng bị đăng xuất mỗi lần F5.
const NO_REFRESH_URLS = [
  '/auth/login', '/auth/google', '/auth/register', '/auth/refresh', '/auth/logout',
  '/auth/forgot-password', '/auth/reset-password', '/auth/verify-email', '/auth/resend-verification',
];
const skipRefresh = (url = '') => NO_REFRESH_URLS.some((p) => url.includes(p));

// Interceptor bắt lỗi 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !skipRefresh(originalRequest.url)) {
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
        // Khôi phục phiên lúc vừa mở trang (/auth/me) thất bại thì chỉ coi là khách, không ép chuyển trang
        if (!originalRequest.url.includes('/auth/me')) window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
