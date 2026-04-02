import axios from 'axios';

// Base URL Laravel
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${baseURL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: false,
});

let isLoggingOut = false;

// ==================== REQUEST INTERCEPTOR ====================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        fullURL: `${config.baseURL}${config.url}`,
        hasToken: !!token,
      });
    }

    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// ==================== RESPONSE INTERCEPTOR ====================
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const message = error.message;
    const responseData = error.response?.data;

    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        status,
        url,
        message,
        response: responseData,
      });
    }

    // ⏱️ Timeout
    if (error.code === 'ECONNABORTED' || message?.includes('timeout')) {
      return Promise.reject({
        ...error,
        isTimeout: true,
        message: 'Request timeout. Silakan coba lagi.',
      });
    }

    // 🌐 Network error
    if (!error.response && message === 'Network Error') {
      return Promise.reject({
        ...error,
        isNetworkError: true,
        message: 'Network error. Backend mungkin tidak aktif.',
      });
    }

    // 🔍 404 — endpoint tidak ditemukan
    if (status === 404) {
      console.warn('🔍 Endpoint not found:', url);
      return Promise.reject(error);
    }

    // 🔥 500 — server error
    if (status === 500) {
      console.error('🔥 Server Error - periksa backend');
      return Promise.reject(error);
    }

    // 🚫 403 — forbidden
    if (status === 403) {
      console.warn('🚫 403 Forbidden - akses ditolak');
      return Promise.reject(error);
    }

    // 🔐 401 — logout hanya jika benar-benar auth error
    if (status === 401) {
      const errorMessage = responseData?.message?.toLowerCase() || '';
      const isAuthError =
        errorMessage.includes('unauthenticated') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('token') ||
        responseData?.error === 'Unauthenticated';

      if (isAuthError && !isLoggingOut) {
        console.log('🚪 Auth error valid — logout');

        isLoggingOut = true;
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        const currentPath = window.location.pathname;
        if (
          currentPath !== '/login' &&
          !currentPath.startsWith('/auth') &&
          !currentPath.startsWith('/status')
        ) {
          setTimeout(() => {
            isLoggingOut = false;
            window.location.href = '/login';
          }, 100);
        } else {
          isLoggingOut = false;
        }
      } else {
        console.warn('⚠️ 401 tapi bukan auth error — kemungkinan endpoint salah');
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;