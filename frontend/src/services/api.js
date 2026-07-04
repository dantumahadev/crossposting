import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fl_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('fl_access_token', res.data.access_token);
      localStorage.setItem('fl_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('fl_access_token');
    localStorage.removeItem('fl_user');
  }
};

export const accountsService = {
  list: async () => {
    const res = await api.get('/accounts');
    return res.data;
  },
  disconnect: async (id) => {
    const res = await api.delete(`/accounts/${id}`);
    return res.data;
  },
  startOAuth: async (platform, simulate = false) => {
    const res = await api.post(`/oauth/${platform}/start?simulate=${simulate}`);
    return res.data;
  }
};

export const mediaService = {
  upload: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    return res.data;
  }
};

export const postsService = {
  generateAICaptions: async (data) => {
    const res = await api.post('/ai/captions', data);
    return res.data;
  },
  createDraft: async (data) => {
    const res = await api.post('/posts/draft', data);
    return res.data;
  },
  updateTarget: async (targetId, data) => {
    const res = await api.patch(`/posts/targets/${targetId}`, data);
    return res.data;
  },
  publish: async (draftId) => {
    const res = await api.post(`/posts/${draftId}/publish`);
    return res.data;
  },
  getStatus: async (draftId) => {
    const res = await api.get(`/posts/${draftId}/status`);
    return res.data;
  },
  list: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.platform) params.append('platform', filters.platform);
    if (filters.status) params.append('status', filters.status);
    const res = await api.get(`/posts?${params.toString()}`);
    return res.data;
  },
  retryJob: async (jobId) => {
    const res = await api.post(`/jobs/${jobId}/retry`);
    return res.data;
  }
};

export default api;
