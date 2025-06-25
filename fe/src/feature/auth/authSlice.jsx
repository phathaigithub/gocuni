import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refresh_token') || null, 
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  success: false,
  roleName: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).roleName : null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Bắt đầu quá trình login/register
    authRequest: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    
    // Đăng nhập thành công
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.data;
      state.token = action.payload.data.token;
      state.refreshToken = action.payload.data.refreshToken; 
      state.roleName = action.payload.data.roleName;
      state.error = null;
      
      // Lưu vào localStorage
      localStorage.setItem('token', action.payload.data.token);
      localStorage.setItem('refresh_token', action.payload.data.refreshToken); // Thêm dòng này
      localStorage.setItem('user', JSON.stringify(action.payload.data));
    },
    
    // Đăng ký thành công
    registerSuccess: (state) => {
      state.loading = false;
      state.success = true; // Đảm bảo đặt thành true
      state.error = null;
      console.log("registerSuccess reducer called, setting success to true");
    },
    
    // Thay đổi mật khẩu thành công
    changePasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
      state.success = true; // Đặt success thành true
    },
    
    // Thêm reducer mới
    resetPasswordSuccess: (state) => {
      state.loading = false;
      state.success = true;
      state.error = null;
    },
    
    // Lỗi xác thực
    authFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },
    
    // Đăng xuất
    logout: (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null; // Thêm dòng này
      state.error = null;
      state.success = false;
      
      // Xóa khỏi localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token'); // Thêm dòng này
      localStorage.removeItem('user');
    },
    
    // Xóa thông báo lỗi
    clearError: (state) => {
      state.error = null;
    },
    
    // Xóa thông báo thành công
    clearSuccess: (state) => {
      state.success = false;
    },
    
    // Cập nhật token mới mà không đăng xuất
    updateToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
  }
});

// Export các actions
export const {
  authRequest,
  loginSuccess,
  registerSuccess,
  authFailure,
  logout,
  clearError,
  clearSuccess,
  changePasswordSuccess,
  resetPasswordSuccess,
  updateToken,
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;