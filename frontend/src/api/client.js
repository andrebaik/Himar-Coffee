import axios from 'axios';
import { getSession, setSession, clearSession } from '../lib/session.js';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 30000,
});

// Request interceptor: attach auth token for admin routes
client.interceptors.request.use((config) => {
  const session = getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Response interceptor: handle 401 with token refresh
let isRefreshing = false;

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing &&
      originalRequest.url !== '/auth/login' &&
      originalRequest.url !== '/auth/refresh'
    ) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const session = getSession();
        if (!session?.refresh_token) throw new Error('No refresh token');

        const { data } = await client.post('/auth/refresh', {
          refresh_token: session.refresh_token,
        });

        setSession(data.data);
        originalRequest.headers.Authorization = `Bearer ${data.data.access_token}`;
        return client(originalRequest);
      } catch {
        clearSession();
        window.location.href = '/admin/login';
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Normalize errors
export const normalizeError = (error) => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (!error.response) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Tidak bisa terhubung ke server. Periksa koneksi internet kamu.',
    };
  }
  return {
    code: 'UNKNOWN_ERROR',
    message: 'Terjadi kesalahan. Silakan coba lagi.',
  };
};

export default client;
