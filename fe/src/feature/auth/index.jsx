import authReducer, {
  authRequest,
  loginSuccess,
  registerSuccess,
  authFailure,
  logout,
  clearError,
  clearSuccess,
  updateToken
} from './authSlice';
import authAPI from './authApi';

// Thunk actions cho các thao tác xác thực
export const loginUser = (credentials) => async (dispatch) => {
  try {
    // Sử dụng action creator thay vì dispatch trực tiếp với type string
    dispatch(authRequest());
    
    // Gọi API đăng nhập
    const response = await authAPI.login(credentials);
    
    if (response.data && response.data.status === 200) {
      // Sử dụng action creator loginSuccess
      dispatch(loginSuccess(response.data));
      return { success: true };
    } else {
      // Xử lý lỗi với action creator
      dispatch(authFailure(response.data?.message || 'Đăng nhập thất bại'));
      return { success: false };
    }
  } catch (error) {
    console.error('Login error:', error);
    
    // Xử lý lỗi với action creator
    const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
    dispatch(authFailure(errorMessage));
    
    return { success: false };
  }
};

export const registerUser = (userData) => async (dispatch) => {
  try {
    dispatch(authRequest());
    const response = await authAPI.register(userData);
    
    
    // API trả về { data: { status: 200, message: "Đăng ký thành công!", data: "email@example.com" } }
    if (response.data && response.data.status === 200) {
      // Đây là điểm quan trọng - đảm bảo action được dispatch
      dispatch(registerSuccess());
      
      // Kiểm tra state sau khi dispatch
      return { success: true };
    } else {
      dispatch(authFailure(response.data?.message || 'Đăng ký thất bại'));
      return { success: false };
    }
  } catch (error) {
    console.error('Register error:', error);
    
    let errorMessage = 'Đăng ký thất bại';
    if (error.response && error.response.data) {
      errorMessage = error.response.data.message || errorMessage;
    }
    
    dispatch(authFailure(errorMessage));
    return { success: false };
  }
};

// Cập nhật action forgotPassword
export const forgotPassword = (email) => async (dispatch) => {
  try {
    dispatch(authRequest());
    const response = await authAPI.forgotPassword(email);
    
    if (response.data && response.data.status === 200) {
      dispatch(clearError());
      return { success: true, message: response.data.message };
    } else {
      dispatch(authFailure(response.data?.message || 'Yêu cầu không thành công'));
      return { success: false };
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    
    const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
    dispatch(authFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    // Gọi API đăng xuất
    await authAPI.logout();
    
    // Dispatch action logout để xóa trạng thái từ Redux store
    dispatch(logout());
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    // Kể cả khi có lỗi, vẫn đảm bảo xóa thông tin đăng nhập ở client
    dispatch(logout());
    return { success: true };
  }
};

export const changePassword = (passwordData) => async (dispatch) => {
  try {
    dispatch(authRequest());
    const response = await authAPI.changePassword(passwordData);
    
    if (response.data && response.data.status === 200) {
      // Đổi mật khẩu thành công, nhưng không đăng xuất
      dispatch({ type: 'auth/changePasswordSuccess' });
      
      // Cập nhật token mới nếu có
      if (response.data.data && response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
        
        // Cập nhật token trong redux store nếu cần
        dispatch({
          type: 'auth/updateToken',
          payload: response.data.data.token
        });
      }
      
      return { success: true, message: response.data.message || 'Đổi mật khẩu thành công!' };
    } else {
      dispatch(authFailure(response.data?.message || 'Đổi mật khẩu thất bại'));
      return { success: false };
    }
  } catch (error) {
    console.error('Change password error:', error);
    
    // Xử lý trường hợp server trả về 401 nhưng không muốn đăng xuất
    if (error.response && error.response.status === 401) {
      const errorMessage = error.response.data?.message || 'Mật khẩu hiện tại không đúng';
      dispatch(authFailure(errorMessage));
      return { success: false, error: errorMessage };
    }
    
    // Xử lý các lỗi khác
    let errorMessage = 'Đổi mật khẩu thất bại';
    if (error.response) {
      if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      errorMessage = 'Không thể kết nối đến server';
    }
    
    dispatch(authFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Thêm action resetPassword
export const resetPassword = (resetData) => async (dispatch) => {
  try {
    dispatch(authRequest());
    const response = await authAPI.resetPassword(resetData);
    
    if (response.data && response.data.status === 200) {
      dispatch({ type: 'auth/resetPasswordSuccess' });
      return { success: true };
    } else {
      dispatch(authFailure(response.data?.message || 'Đặt lại mật khẩu thất bại'));
      return { success: false };
    }
  } catch (error) {
    console.error('Reset password error:', error);
    
    const errorMessage = error.response?.data?.message || 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
    dispatch(authFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

// Thêm action refreshToken
export const refreshTokenAction = (refreshToken) => async (dispatch) => {
  try {
    dispatch(authRequest());
    const response = await authAPI.refreshToken(refreshToken);
    
    if (response.data && response.data.status === 200) {
      const newToken = response.data.data.token;
      
      // Cập nhật token mới trong Redux store
      dispatch(updateToken(newToken));
      
      return { success: true, token: newToken };
    } else {
      // Nếu refresh thất bại, đăng xuất
      dispatch(logout());
      return { success: false };
    }
  } catch (error) {
    console.error('Refresh token error:', error);
    
    // Đăng xuất khi refresh token thất bại
    dispatch(logout());
    return { success: false };
  }
};

// Export các components
export { default as Login } from './component/LoginPage';
export { default as Register } from './component/Register';
export { default as ForgotPassword } from './component/ForgotPassword';
export { default as ChangePassword } from './component/ChangePassword';
// Export thêm component ResetPassword
export { default as ResetPassword } from './component/ResetPassword';

// Export utility functions và action creators
export {
  clearError,
  clearSuccess,
  authFailure
};

// Export reducer as default
export default authReducer;