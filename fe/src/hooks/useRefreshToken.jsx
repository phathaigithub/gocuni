import { useDispatch, useSelector } from 'react-redux';
import { refreshTokenAction } from '../feature/auth';

export const useRefreshToken = () => {
  const dispatch = useDispatch();
  const refreshToken = useSelector(state => state.auth.refreshToken);
  
  const refresh = async () => {
    if (!refreshToken) {
      return { success: false, message: 'No refresh token available' };
    }
    
    try {
      const result = await dispatch(refreshTokenAction(refreshToken));
      return result;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return { success: false, message: 'Failed to refresh token' };
    }
  };
  
  return refresh;
};

export default useRefreshToken;