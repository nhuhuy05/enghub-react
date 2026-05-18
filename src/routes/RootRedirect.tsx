import { Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getDefaultDashboardPath } from '@/features/auth/utils/roleUtils';

export const RootRedirect = () => {
  const { isAuthenticated, isSessionChecked, user } = useAuth();

  if (!isSessionChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fc] text-sm font-semibold text-[#505f76]">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getDefaultDashboardPath(user)} replace />;
};
