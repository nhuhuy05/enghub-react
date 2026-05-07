import { Navigate, Route, Routes, Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { MainLayout } from '../components/layout/MainLayout';
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { LoginVisual } from '../features/auth/components/LoginVisual';
import { RegisterVisual } from '../features/auth/components/RegisterVisual';
import { DashboardPage } from '../features/dashboard/components/DashboardPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      <Route
        path="/login"
        element={
          <AuthLayout visualContent={<LoginVisual />}>
            <LoginForm />
            <div className="mt-8 text-center lg:hidden">
              <Link to="/register" className="text-sm font-bold text-primary hover:underline">
                Don't have an account? Sign Up
              </Link>
            </div>
          </AuthLayout>
        }
      />

      <Route
        path="/register"
        element={
          <AuthLayout reverse visualContent={<RegisterVisual />}>
            <RegisterForm />
            <div className="mt-8 text-center lg:hidden">
              <Link to="/login" className="text-sm font-bold text-primary hover:underline">
                Already have an account? Sign In
              </Link>
            </div>
          </AuthLayout>
        }
      />
    </Routes>
  );
};
