import axios from 'axios';

import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { apiUrl } from './api';

const api = axios.create({
  baseURL: apiUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
