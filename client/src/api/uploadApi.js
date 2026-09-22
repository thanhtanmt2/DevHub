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
};
