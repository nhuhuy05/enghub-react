import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/enghub', // Cập nhật port nếu backend của bạn chạy ở port khác
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm Token vào Header
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor để xử lý lỗi 401 (Hết hạn token)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
