import api from '../../service/api';

const authAPI = {
  /**
   * Đăng nhập
   * @param {Object} credentials - Thông tin đăng nhập (email, password)
   * @returns {Promise} - Promise chứa kết quả đăng nhập
   */
  login: async (credentials) => {
    return await api.post('/auth/signin', credentials);
  },
  
  /**
   * Đăng ký
   * @param {Object} userData - Thông tin đăng ký (email, password)
   * @returns {Promise} - Promise chứa kết quả đăng ký
   */
  register: async (userData) => {
    return await api.post('/auth/signup', userData);
  },
  
  /**
   * Quên mật khẩu
   * @param {string} email - Email cần khôi phục mật khẩu
   * @returns {Promise} - Promise chứa kết quả gửi email khôi phục
   */
  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },
  
  /**
   * Đổi mật khẩu
   * @param {Object} passwordData - Thông tin mật khẩu mới
   * @returns {Promise} - Promise chứa kết quả đổi mật khẩu
   */
  changePassword: async (passwordData) => {
    return await api.post('/auth/change-password', passwordData);
  },
  
  /**
   * Đăng xuất
   * @returns {Promise} - Promise chứa kết quả đăng xuất
   */
  logout: async () => {
    return await api.post('/auth/signout');
  },

  /**
   * Đặt lại mật khẩu
   * @param {Object} resetData - Thông tin cần thiết để đặt lại mật khẩu
   * @returns {Promise} - Promise chứa kết quả đặt lại mật khẩu
   */
  resetPassword: async (resetData) => {
    return await api.post('/auth/reset-password', resetData);
  },

  /**
   * Refresh token để lấy token mới
   * @param {string} refreshToken - Refresh token
   * @returns {Promise} - Promise chứa kết quả refresh token
   */
  refreshToken: async (refreshToken) => {
    return await api.post('/auth/refresh-token', { refreshToken });
  },
};

export default authAPI;