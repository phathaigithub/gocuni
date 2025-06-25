import api from '../../service/api';

const userAPI = {
  /**
   * Lấy thông tin người dùng hiện tại
   */
  getUserProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Cập nhật thông tin người dùng
   * @param {FormData} userData - FormData chứa thông tin cần cập nhật
   */
  updateUserProfile: async (userData) => {
    try {
      const response = await api.put('/users/edit', userData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default userAPI;