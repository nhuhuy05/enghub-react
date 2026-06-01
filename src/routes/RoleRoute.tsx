import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features-user/auth/hooks/useAuth';
import { getDefaultDashboardPath, hasRole, type AppRole } from '@/features-user/auth/utils/roleUtils';

interface RoleRouteProps {
  allowedRoles: AppRole[];
}

export const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
  const { user } = useAuth();

  if (!hasRole(user, allowedRoles)) {
    return <Navigate to={getDefaultDashboardPath(user)} replace />;
  }

  return <Outlet />;
};
