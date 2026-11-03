import api from './axiosInstance';

// Diễn đàn: chung (theo chuyên mục) + riêng của từng workspace (workspace_id)
export const forumApi = {
  getOverview: () => api.get('/forum/overview'),
  getMember: (id) => api.get(`/forum/members/${id}`),
  getThreads: (params) => api.get('/forum/threads', { params }),
  getThread: (id, params) => api.get(`/forum/threads/${id}`, { params }),
  createThread: (data) => api.post('/forum/threads', data),
  updateThread: (id, data) => api.put(`/forum/threads/${id}`, data),
  pinThread: (id, value) => api.put(`/forum/threads/${id}/pin`, { value }),
  lockThread: (id, value) => api.put(`/forum/threads/${id}/lock`, { value }),
  moveThread: (id, category_id) => api.put(`/forum/threads/${id}/move`, { category_id }),
  createPost: (threadId, data) => api.post(`/forum/threads/${threadId}/posts`, data),
  updatePost: (id, content) => api.put(`/forum/posts/${id}`, { content }),
  deletePost: (id) => api.delete(`/forum/posts/${id}`),
  toggleLike: (id) => api.post(`/forum/posts/${id}/like`),
  toggleDislike: (id) => api.post(`/forum/posts/${id}/dislike`),
  // Theo dõi / bỏ qua thành viên
  toggleFollow: (memberId) => api.post(`/forum/members/${memberId}/follow`),
  toggleIgnore: (memberId) => api.post(`/forum/members/${memberId}/ignore`),
  // Lưu bài viết, báo cáo vi phạm
  toggleBookmark: (postId) => api.post(`/forum/posts/${postId}/bookmark`),
  getBookmarks: (params) => api.get('/forum/bookmarks', { params }),
  reportPost: (postId, data) => api.post(`/forum/posts/${postId}/report`, data),
  // Admin: hàng đợi báo cáo
  getReports: (params) => api.get('/forum/reports', { params }),
  handleReport: (id, status) => api.put(`/forum/reports/${id}`, { status }),
  // Tin nhắn riêng
  getConversations: () => api.get('/forum/messages/conversations'),
  getConversation: (userId) => api.get(`/forum/messages/with/${userId}`),
  sendMessage: (userId, content) => api.post(`/forum/messages/with/${userId}`, { content }),
  // Admin: quản lý chuyên mục
  createCategory: (data) => api.post('/forum/categories', data),
  updateCategory: (id, data) => api.put(`/forum/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/forum/categories/${id}`),
};
