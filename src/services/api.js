import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Lưu thông tin đăng nhập
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  localStorage.setItem('token', token);
};

export const getAuthToken = () => {
  return authToken || localStorage.getItem('token');
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('token');
};

// Interceptor để thêm token
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    console.log("🪪 Token gửi kèm:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Interceptor xử lý response
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc chưa đăng nhập
      clearAuthToken();
      console.warn('⚠️ Chưa đăng nhập hoặc token hết hạn');
      
      // Có thể redirect đến trang login ở đây
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;