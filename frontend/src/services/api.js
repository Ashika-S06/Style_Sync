import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export { BASE_URL };

export const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/300x400?text=No+Image';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  return `${BASE_URL}${path}`;
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
