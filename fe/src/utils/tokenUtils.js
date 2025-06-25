// Hàm kiểm tra token hết hạn
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decode JWT token (không cần library vì chỉ cần kiểm tra exp)
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

// Thời gian tính bằng mili giây trước khi token hết hạn mà cần refresh
export const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 phút