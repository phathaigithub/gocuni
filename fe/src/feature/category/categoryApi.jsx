import api from '../../service/api';

const categoryAPI = {
  /**
   * Lấy danh sách tất cả danh mục
   */
  getAllCategories: async () => {
    try {
      console.log("API call: GET /categories");
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error("API error:", error);
      throw error;
    }
  },
  
  /**
   * Lấy chi tiết một danh mục theo ID
   * @param {number|string} id - ID của danh mục
   */
  getCategoryById: async (id) => {
    try {
      console.log(`categoryApi - getCategoryById called with ID: ${id}`);
      const response = await api.get(`/categories/${id}`);
      console.log(`categoryApi - getCategoryById response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`categoryApi - getCategoryById error:`, error);
      throw error;
    }
  },
  
  /**
   * Lấy danh sách bài viết theo danh mục
   * @param {number|string} categoryId - ID của danh mục
   * @param {Object} params - Tham số phân trang và sắp xếp
   */
  getPostsByCategory: async (categoryId, params = {}) => {
    try {
      console.log(`API call: GET /categories/${categoryId}/posts`, params);
      const response = await api.get(`/categories/${categoryId}/posts`, { params });
      return response.data;
    } catch (error) {
      console.error("API error:", error);
      throw error;
    }
  }
};

export default categoryAPI;