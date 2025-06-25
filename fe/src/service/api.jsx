import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Lưu refreshToken đang trong quá trình xử lý để tránh gọi nhiều lần
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Interceptor để thêm token vào header của mỗi request
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

// Interceptor để xử lý response và refresh token khi cần
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu response là 401 (Unauthorized) và chưa thử refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Đánh dấu request này đã thử refresh
      originalRequest._retry = true;
      
      // Kiểm tra refresh token có tồn tại không
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        // Không có refresh token, đăng xuất
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Chuyển hướng đến trang đăng nhập nếu không phải đang ở các trang public
        const currentPath = window.location.pathname;
        if (!['/login', '/register', '/forgot-password', '/reset-password'].includes(currentPath)) {
          window.location.href = '/login?session_expired=true';
        }
        
        return Promise.reject(error);
      }
      
      // Nếu đang refresh token, thêm request vào hàng đợi
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      isRefreshing = true;
      
      try {
        // Gọi API refresh token
        const response = await axios.post(
          'http://localhost:8080/api/auth/refresh-token',
          { refreshToken },
          { baseURL: 'http://localhost:8080/api' }
        );
        
        // Nếu refresh token thành công, cập nhật token mới
        if (response.data.status === 200) {
          const newToken = response.data.data.token;
          localStorage.setItem('token', newToken);
          
          // Cập nhật Authorization header cho request ban đầu
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          
          // Thực thi tất cả các request trong hàng đợi
          processQueue(null, newToken);
          
          // Trả về request ban đầu với token mới
          return api(originalRequest);
        } else {
          processQueue(error, null);
          // Refresh token không thành công, đăng xuất
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          
          if (!['/login', '/register', '/forgot-password', '/reset-password'].includes(window.location.pathname)) {
            window.location.href = '/login?session_expired=true';
          }
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Xử lý lỗi khi refresh token
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        if (!['/login', '/register', '/forgot-password', '/reset-password'].includes(window.location.pathname)) {
          window.location.href = '/login?session_expired=true';
        }
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;