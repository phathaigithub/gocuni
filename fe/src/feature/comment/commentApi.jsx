import api from '../../service/api';

const commentApi = {
  getCommentsByPost: async (postId, page = 0, size = 10) => {
    return await api.get(`/comments/post/${postId}?page=${page}&size=${size}`);
  },
  
  createComment: async (commentData) => {
    return await api.post('/comments', commentData);
  },
  
  likeComment: async (commentId) => {
    return await api.post(`/comments/${commentId}/like`);
  },
  
  deleteComment: async (commentId) => {
    return await api.delete(`/comments/${commentId}`);
  }
};

export default commentApi;