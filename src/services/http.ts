import axios from 'axios';
import { feedback } from './feedback';
import { useAuthStore } from '../store/auth-store';

export const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined;
    const serverMessage = error.response?.data?.message as string | undefined;

    if (status === 401) {
      useAuthStore.getState().logout();
      feedback.error(serverMessage ?? '登录状态已失效，请重新登录。');
      window.location.href = '/login?expired=1';
      return Promise.reject(error);
    }

    if (serverMessage) {
      feedback.error(serverMessage);
    }

    return Promise.reject(error);
  },
);
