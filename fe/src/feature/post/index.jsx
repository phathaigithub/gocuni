import postReducer, {
  fetchPosts,
  fetchPostDetail,
  fetchUserPosts,
  createComment,
  likePost,
  likeComment,
  clearPostError
} from './postSlice';
import postAPI from './postApi';

// Export components
export { default as PostDetail } from './component/PostDetail';

// Export actions
export {
  fetchPosts,
  fetchPostDetail,
  fetchUserPosts,
  createComment,
  likePost,
  likeComment,
  clearPostError
};

// Export API
export { postAPI };

// Export reducer as default
export default postReducer;