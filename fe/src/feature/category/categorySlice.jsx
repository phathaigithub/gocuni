import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryAPI from './categoryApi';

// Thunk action để lấy danh sách tất cả danh mục
export const fetchAllCategories = createAsyncThunk(
  'category/fetchAllCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await categoryAPI.getAllCategories();
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể lấy danh sách danh mục'
      );
    }
  }
);

// Thunk action để lấy chi tiết danh mục theo ID
export const fetchCategoryById = createAsyncThunk(
  'category/fetchCategoryById',
  async (id, { rejectWithValue }) => {
    try {
      console.log("categorySlice - fetchCategoryById called with ID:", id);
      const response = await categoryAPI.getCategoryById(id);
      console.log("categorySlice - fetchCategoryById response:", response);
      return response;
    } catch (error) {
      console.error("categorySlice - fetchCategoryById error:", error);
      return rejectWithValue(
        error.response?.data?.message || 'Không thể lấy thông tin danh mục'
      );
    }
  }
);

// Thunk action để lấy bài viết theo danh mục
export const fetchPostsByCategory = createAsyncThunk(
  'category/fetchPostsByCategory',
  async ({ categoryId, params }, { rejectWithValue }) => {
    try {
      const response = await categoryAPI.getPostsByCategory(categoryId, params);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể lấy danh sách bài viết theo danh mục'
      );
    }
  }
);

const initialState = {
  categories: [],
  currentCategory: null,
  posts: [],
  pagination: {
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: 10
  },
  loading: false,
  error: null
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearCategoryError: (state) => {
      state.error = null;
    },
    resetCategoryState: (state) => {
      state.currentCategory = null;
      state.posts = [];
      state.pagination = {
        totalPages: 0,
        totalElements: 0,
        number: 0,
        size: 10
      };
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchAllCategories
      .addCase(fetchAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.data || [];
      })
      .addCase(fetchAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.categories = [];
      })
      
      // Xử lý fetchCategoryById
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCategory = action.payload.data;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentCategory = null;
      })
      
      // Xử lý fetchPostsByCategory
      .addCase(fetchPostsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        
        // Lấy thông tin bài viết và phân trang từ response
        const data = action.payload.data;
        
        if (data) {
          state.posts = data.content || [];
          state.pagination = {
            totalPages: data.totalPages || 0,
            totalElements: data.totalElements || 0,
            number: data.number || 0,
            size: data.size || 10
          };
        } else {
          state.posts = [];
          state.pagination = {
            totalPages: 0,
            totalElements: 0,
            number: 0,
            size: 10
          };
        }
      })
      .addCase(fetchPostsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.posts = [];
      });
  }
});

export const { clearCategoryError, resetCategoryState } = categorySlice.actions;

export default categorySlice.reducer;