import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin/posts';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`
  };
};

export const fetchPosts = async (page = 0, size = 10, sortBy = 'createdAt', direction = 'desc', keyword = '', status = '') => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        page,
        size,
        sortBy,
        direction,
        keyword: keyword || undefined,
        status: status || undefined
      },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchPostById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePostStatus = async (id, status) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/status`, { status }, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePost = async (id, formData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deletePost = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPostStatistics = async () => {
  try {
    const response = await axios.get(`${API_URL}/statistics`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};