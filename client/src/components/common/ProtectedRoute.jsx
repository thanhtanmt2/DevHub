import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

// file này để bảo vệ route không cho phép ai vào nếu không có quyền 
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, loading, getUserRoles } = useAuth();
  const location = useLocation();
  // nếu loading thì hiển thị loading spinner 
  if (loading) return <LoadingSpinner fullScreen />;
  // nếu chưa đăng nhập thì chuyển đến trang login 
  if (!user) return <Navigate to="/?auth=login" state={{ from: location }} replace />;
  // lấy userRoles 
  const userRoles = getUserRoles();
  // kiểm tra user có quyền truy cập hay không 
  const hasAccess = allowedRoles.length === 0 || allowedRoles.some(r => userRoles.includes(r));
  // không có quyền thì về trang chủ
  if (!hasAccess) return <Navigate to="/" replace />;
  // có quyền thì cho qua
  return <Outlet />;
}

