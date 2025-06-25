import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useRefreshToken } from '../../hooks/useRefreshToken';
import { Spinner } from 'react-bootstrap';
import { isTokenExpired } from '../../utils/tokenUtils';

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { token, refreshToken } = useSelector(state => state.auth);
  
  useEffect(() => {
    let isMounted = true;
    
    const verifyRefreshToken = async () => {
      try {
        // Chỉ refresh khi có refreshToken và token sắp hết hạn
        if (refreshToken && (!token || isTokenExpired(token))) {
          await refresh();
        }
      } catch (error) {
        console.error('Failed to refresh token:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    // Nếu không có token nhưng có refreshToken, thử refresh
    if (!token && refreshToken) {
      verifyRefreshToken();
    } else {
      // Nếu không cần refresh, set loading = false
      setIsLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Hiển thị spinner trong khi đang loading
  return (
    <>
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </Spinner>
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default PersistLogin;