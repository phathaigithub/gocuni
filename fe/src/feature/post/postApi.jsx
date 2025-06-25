import api from '../../service/api';

const postAPI = {
  /**
   * Lấy danh sách bài viết
   * @param {Object} params - Tham số phân trang và sắp xếp
   */
  getPosts: async (params = {}) => {
    try {
      const response = await api.get('/posts', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Lấy chi tiết bài viết
   * @param {string} id - ID của bài viết
   */
  getPostById: async (id) => {
    try {
      const response = await api.get(`/posts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Tạo bài viết mới
   * @param {Object} postData - Dữ liệu bài viết
   */
  createPost: async (postData) => {
    try {
      const response = await api.post('/posts', postData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Cập nhật bài viết
   * @param {string} id - ID của bài viết
   * @param {Object} postData - Dữ liệu bài viết mới
   */
  updatePost: async (id, postData) => {
    try {
      const response = await api.put(`/posts/${id}`, postData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Xóa bài viết
   * @param {string} id - ID của bài viết
   */
  deletePost: async (id) => {
    try {
      const response = await api.delete(`/posts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Lấy bài viết theo danh mục
   * @param {string} categoryId - ID của danh mục
   * @param {Object} params - Tham số phân trang và sắp xếp
   */
  getPostsByCategory: async (categoryId, params = {}) => {
    try {
      const response = await api.get(`/posts/category/${categoryId}`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Lấy bài viết phổ biến
   */
  getPopularPosts: async () => {
    try {
      const response = await api.get('/posts/popular');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Thích bài viết
   * @param {string} postId - ID của bài viết
   */
  likePost: async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Lấy bài viết của người dùng đang đăng nhập
   */
  getUserPosts: async () => {
    try {
      const response = await api.get('/posts/user');
      console.log('API response from getUserPosts:', response);
      return response;
    } catch (error) {
      console.error('Error in getUserPosts API call:', error);
      throw error;
    }
  },
  
  /**
   * Thêm bình luận
   * @param {string} postId - ID của bài viết
   * @param {string} content - Nội dung bình luận
   */
  addComment: async (postId, content) => {
    return await api.post(`/posts/${postId}/comments`, { content });
  }
};

export default postAPI;