import axios from 'axios';

const API_URL = 'http://localhost:8080/api/admin/users';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`
  };
};

export const fetchUsers = async (page = 0, size = 10, sortBy = 'id', direction = 'desc', keyword = '') => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        page,
        size,
        sortBy,
        direction,
        keyword: keyword || undefined
      },
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchUserById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (id, formData) => {
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

export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const changeUserStatus = async (id, enable) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/status?enable=${enable}`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchRoles = async () => {
  try {
    const response = await axios.get(`${API_URL}/roles`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};