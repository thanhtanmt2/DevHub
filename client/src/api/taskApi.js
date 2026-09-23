import api from './axiosInstance';

export const taskApi = {
  // Workspace tasks
  getWorkspaceTasks: (workspaceId, params) => api.get(`/tasks/workspace/${workspaceId}`, { params }),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (workspaceId, data) => api.post(`/tasks/workspace/${workspaceId}`, data),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  reviewTask: (id, data) => api.put(`/tasks/${id}/review`, data),
  reorderTasks: (workspaceId, tasks) => api.put(`/tasks/workspace/${workspaceId}/reorder`, { tasks }),

  // Sub-tasks
  addSubTask: (taskId, title) => api.post(`/tasks/${taskId}/subtasks`, { title }),
  updateSubTask: (taskId, subId, data) => api.put(`/tasks/${taskId}/subtasks/${subId}`, data),
  deleteSubTask: (taskId, subId) => api.delete(`/tasks/${taskId}/subtasks/${subId}`),

  // Comments
  addComment: (taskId, content) => api.post(`/tasks/${taskId}/comments`, { content }),
  deleteComment: (taskId, commentId) => api.delete(`/tasks/${taskId}/comments/${commentId}`),
};
