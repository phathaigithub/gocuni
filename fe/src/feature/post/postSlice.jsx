import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postAPI from './postApi';
import commentApi from '../comment/commentApi';

// Thêm action để lấy chi tiết bài viết
export const fetchPostDetail = createAsyncThunk(
  'post/fetchPostDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await postAPI.getPostById(id);
      // Lấy thêm comments của bài viết
      const commentsResponse = await commentApi.getCommentsByPost(id);
      
      // Cấu trúc response đúng: {status: 200, message: 'Lấy bài viết thành công', data: {…}}
      // Trả về cả post và comment của API response - sửa lại đúng cấu trúc
      return {
        post: response.data, // Chỉ cần response.data thay vì response.data.data
        comments: commentsResponse.data.data?.content || []
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải bài viết');
    }
  }
);

// Thêm action để lấy danh sách bài viết
export const fetchPosts = createAsyncThunk(
  'post/fetchPosts',
  async ({ page, size }, { rejectWithValue }) => {
    try {
      const response = await postAPI.getPosts(page, size);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể tải danh sách bài viết');
    }
  }
);

// Thêm action để lấy bài viết của người dùng
// Sửa lại action fetchUserPosts để xử lý đúng cấu trúc response
export const fetchUserPosts = createAsyncThunk(
  'post/fetchUserPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await postAPI.getUserPosts();
      
      // Log để debug
      console.log('Response from getUserPosts:', response);
      
      // Kiểm tra cấu trúc dữ liệu trả về để lấy đúng mảng bài viết
      // API trả về {status, message, data} với data là mảng bài viết
      if (response && response.data) {
        return response.data.data || [];
      }
      return [];
    } catch (error) {
      console.error('Error in fetchUserPosts:', error);
      return rejectWithValue(error.response?.data?.message || 'Không thể lấy bài viết của người dùng');
    }
  }
);

// Thêm action để cập nhật bài viết
export const updatePost = createAsyncThunk(
  'post/updatePost',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const response = await postAPI.updatePost(id, formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể cập nhật bài viết');
    }
  }
);

// Thêm action để like bài viết
export const likePost = createAsyncThunk(
  'post/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postAPI.likePost(postId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể thích bài viết');
    }
  }
);

// Cập nhật action createComment để phù hợp với cấu trúc API
export const createComment = createAsyncThunk(
  'post/createComment',
  async (commentData, { rejectWithValue }) => {
    try {
      const response = await commentApi.createComment(commentData);
      console.log("Create comment response:", response);
      
      // Trả về cả comment và postId
      return {
        comment: response.data.data,
        postId: commentData.postId
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể thêm bình luận');
    }
  }
);

// Cập nhật action likeComment
export const likeComment = createAsyncThunk(
  'post/likeComment',
  async ({ commentId, postId }, { rejectWithValue }) => {
    try {
      const response = await commentApi.likeComment(commentId);
      return { 
        commentId, 
        likeCount: response.data.data,
        postId
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Không thể thích bình luận');
    }
  }
);

// Cập nhật initialState 
const initialState = {
  posts: [],
  post: null,
  userPosts: [],
  postComments: {}, // Thêm vào đây để đảm bảo nó luôn tồn tại
  loading: false,
  loadingPosts: false, 
  error: null,
  success: false
};

const postSlice = createSlice({
  name: 'post',
  initialState,
  reducers: {
    clearPostError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // fetchPosts
    builder.addCase(fetchPosts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchPosts.fulfilled, (state, action) => {
      state.loading = false;
      state.posts = action.payload.content || [];
      state.totalPages = action.payload.totalPages || 0;
      state.currentPage = action.payload.number || 0;
    });
    builder.addCase(fetchPosts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // fetchPostDetail
    builder.addCase(fetchPostDetail.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    // Sửa phần xử lý fetchPostDetail.fulfilled
    builder.addCase(fetchPostDetail.fulfilled, (state, action) => {
      state.loading = false;
      
      // Log cấu trúc dữ liệu để debug
      console.log("Post structure:", action.payload.post);
      
      // Xử lý cấu trúc dữ liệu đúng từ API
      state.post = action.payload.post;
      
      // Đảm bảo state.post không undefined
      if (!state.post) {
        console.error("Post data is undefined in API response");
        return;
      }
      
      // Lưu comments vào postComments với key là postId
      const postId = state.post.id;
      if (postId) {
        state.postComments[postId] = action.payload.comments || [];
      } else {
        console.error("Post ID is missing in post data");
      }
    });
    builder.addCase(fetchPostDetail.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // fetchUserPosts
    builder.addCase(fetchUserPosts.pending, (state) => {
      state.loadingPosts = true;
      state.error = null;
    });
    builder.addCase(fetchUserPosts.fulfilled, (state, action) => {
      state.loadingPosts = false;
      // Kiểm tra kiểu dữ liệu và chuyển đổi nếu cần
      state.userPosts = Array.isArray(action.payload) ? action.payload : [];
    });
    builder.addCase(fetchUserPosts.rejected, (state, action) => {
      state.loadingPosts = false;
      state.error = action.payload;
    });

    // updatePost
    builder.addCase(updatePost.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updatePost.fulfilled, (state, action) => {
      state.loading = false;
      state.post = action.payload;
      // Cập nhật bài viết trong danh sách nếu có
      if (state.posts.length > 0) {
        const index = state.posts.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      }
      // Cập nhật trong userPosts nếu có
      if (state.userPosts.length > 0) {
        const index = state.userPosts.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.userPosts[index] = action.payload;
        }
      }
    });
    builder.addCase(updatePost.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // createComment
    builder.addCase(createComment.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createComment.fulfilled, (state, action) => {
      state.loading = false;
      
      // Xử lý dữ liệu trả về từ API
      const { comment, postId } = action.payload;
      
      // Kiểm tra dữ liệu hợp lệ
      if (!comment || !postId) {
        console.error("Invalid data in createComment.fulfilled:", action.payload);
        return;
      }
      
      // Đảm bảo postComments[postId] tồn tại
      if (!state.postComments[postId]) {
        state.postComments[postId] = [];
      }
      
      // Thêm comment mới vào đầu danh sách
      state.postComments[postId].unshift(comment);
      
      // Cập nhật số lượng comment trong post nếu đang xem post này
      if (state.post && state.post.id === parseInt(postId)) {
        state.post.commentCount = (state.post.commentCount || 0) + 1;
      }
    });
    builder.addCase(createComment.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // likeComment
    builder.addCase(likeComment.fulfilled, (state, action) => {
      const { commentId, likeCount, postId } = action.payload;
      
      // Kiểm tra postComments[postId] tồn tại
      if (!state.postComments[postId]) {
        console.error("PostId not found in postComments:", postId);
        return;
      }
      
      // Hàm đệ quy để cập nhật like trong comments
      const updateCommentLikes = (comments) => {
        return comments.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likeCount: likeCount,
              userHasLiked: !comment.userHasLiked
            };
          } else if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateCommentLikes(comment.replies)
            };
          }
          return comment;
        });
      };
      
      state.postComments[postId] = updateCommentLikes(state.postComments[postId]);
    });
  }
});

export const { clearPostError } = postSlice.actions;
export default postSlice.reducer;

// Thêm middleware để debug
// Cách dùng: Thêm vào đoạn cuối file, trước export
const logStateMiddleware = (store) => (next) => (action) => {
  console.log('Dispatching action:', action.type);
  
  const result = next(action);
  
  if (action.type === 'post/fetchPostDetail/fulfilled') {
    console.log('New state after fetchPostDetail:', store.getState().post);
  }
  
  return result;
};