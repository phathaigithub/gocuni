import { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRefreshToken } from '../hooks/useRefreshToken';
import { logout } from '../feature/auth/authSlice';

const AuthContext = createContext({});

// Thời gian tính bằng mili giây trước khi token hết hạn mà cần refresh
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 phút

// Hàm kiểm tra token hết hạn
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decode JWT token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const { exp } = JSON.parse(jsonPayload);
    
    // Kiểm tra thời gian hết hạn
    const currentTime = Date.now() / 1000;
    return exp < currentTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true; // Coi như token hết hạn nếu có lỗi
  }
};

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, token, refreshToken } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const refresh = useRefreshToken();
  
  useEffect(() => {
    // Kiểm tra token tự động khi khởi động app
    const verifyToken = async () => {
      try {
        if (token && refreshToken) {
          if (isTokenExpired(token)) {
            // Token đã hết hạn, thử refresh
            const result = await refresh();
            if (!result.success) {
              // Nếu refresh thất bại, đăng xuất
              dispatch(logout());
            }
          }
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        dispatch(logout());
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyToken();
  }, []);

  // Thiết lập timer để tự động refresh token trước khi hết hạn
  useEffect(() => {
    let refreshInterval;
    
    if (isAuthenticated && token && refreshToken) {
      try {
        // Decode token để lấy thời gian hết hạn
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        const expTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        
        // Tính thời gian còn lại trước khi token hết hạn (trừ threshold)
        const timeUntilRefresh = Math.max(0, expTime - currentTime - TOKEN_REFRESH_THRESHOLD);
        
        // Đặt timer để refresh token trước khi hết hạn
        refreshInterval = setTimeout(async () => {
          console.log('Auto refreshing token...');
          await refresh();
        }, timeUntilRefresh);
      } catch (error) {
        console.error('Error setting up token refresh timer:', error);
      }
    }
    
    return () => {
      if (refreshInterval) clearTimeout(refreshInterval);
    };
  }, [isAuthenticated, token, refreshToken]);
  
  const contextValue = {
    isLoading,
    isAuthenticated,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {isLoading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;