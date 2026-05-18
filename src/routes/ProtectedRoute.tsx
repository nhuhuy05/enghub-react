import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isSessionChecked } = useAuth();

  if (!isSessionChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f7fc] text-sm font-semibold text-[#505f76]">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};
