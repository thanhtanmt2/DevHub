import api from './axiosInstance';

export const uploadApi = {
  uploadCV: (file) => {
    const formData = new FormData();
    formData.append('cv', file);
    return api.post('/upload/cv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  // File sản phẩm nộp cho task (tối đa 20MB); onProgress nhận % đã tải
  uploadTaskFile: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/task-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
  },
};
