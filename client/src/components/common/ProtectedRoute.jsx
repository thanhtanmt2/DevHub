import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ allowedRoles = [] }) {
  const { user, loading, getUserRoles } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullScreen />;
  if (!user) return <Navigate to="/?auth=login" state={{ from: location }} replace />;
  const userRoles = getUserRoles();
  const hasAccess = allowedRoles.length === 0 || allowedRoles.some(r => userRoles.includes(r));
  if (!hasAccess) return <Navigate to="/" replace />;
  return <Outlet />;
}

