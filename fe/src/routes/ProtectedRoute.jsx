import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Component bảo vệ các route yêu cầu đăng nhập
 * @param {Object} props
 * @param {JSX.Element} props.children - Component cần bảo vệ
 * @param {string} [props.requiredRole] - Vai trò yêu cầu (nếu có)
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // Kiểm tra đã đăng nhập chưa
  if (!isAuthenticated) {
    // Chuyển hướng đến trang đăng nhập, lưu đường dẫn hiện tại để redirect sau
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Nếu yêu cầu role cụ thể, kiểm tra quyền
  if (requiredRole && user.role !== requiredRole) {
    // Không đủ quyền, chuyển về trang chủ
    return <Navigate to="/" replace />;
  }
  
  // Đã đăng nhập và có đủ quyền
  return children;
};

export default ProtectedRoute;