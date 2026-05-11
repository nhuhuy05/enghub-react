import React, { useState } from 'react';
import { BadgeCheck, Book, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const { register, isLoading, error } = useAuth();
  const [success, setSuccess] = useState(false);

  const inputClassName =
    'w-full rounded-lg border border-transparent bg-[#f3f3fe] px-4 py-3 text-base font-normal outline-none transition-all placeholder:text-gray-400 focus:border-[#004ac6] focus:bg-white focus:ring-2 focus:ring-[#004ac6]/20';
  const primaryButtonClassName =
    'flex w-full items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-6 py-3 text-base font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';
  const outlineButtonClassName =
    'flex w-full items-center justify-center gap-3 rounded-lg border border-[#c3c6d7] bg-transparent px-6 py-2.5 text-sm font-medium text-[#191b23] transition-all duration-200 hover:bg-[#ededf9]';

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    const result = await register({
      email: formData.email,
      password: formData.password,
      fullName: '',
    });
    if (result.success) setSuccess(true);
  };

  if (success) {
    return (
      <div className="w-full text-center">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-green-100 bg-green-50">
          <BadgeCheck className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="mb-4 text-3xl font-bold text-[#191b23]">Registration Successful!</h2>
        <p className="mb-10 text-lg text-[#505f76]">
          Your account has been created. You can now sign in to start your journey.
        </p>
        <button className={primaryButtonClassName} onClick={() => navigate('/login')}>
          Proceed to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <div className="mb-1 flex items-center justify-center gap-2">
          <Book className="h-8 w-8 text-[#004ac6]" />
          <span className="text-[26px] font-bold text-[#004ac6]">EngHub</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#505f76]" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className={inputClassName}
            placeholder="name@university.edu"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#505f76]" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={inputClassName}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#505f76]" htmlFor="confirm">
            Confirm Password
          </label>
          <input
            id="confirm"
            type="password"
            className={inputClassName}
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            required
          />
        </div>

        <div className="flex items-center gap-2 py-1">
          <input
            type="checkbox"
            id="terms"
            required
            className="h-4 w-4 shrink-0 cursor-pointer rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6]"
          />
          <label className="text-xs font-medium leading-5 text-[#505f76]" htmlFor="terms">
            I agree to the <a href="#" className="font-bold text-[#004ac6] hover:underline">Terms</a> and{' '}
            <a href="#" className="font-bold text-[#004ac6] hover:underline">Privacy</a>.
          </label>
        </div>

        {error && (
          <div className="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button type="submit" className={primaryButtonClassName} disabled={isLoading}>
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Account'}
        </button>

        <div className="mt-3">
          <button
            type="button"
            className={`${outlineButtonClassName} cursor-not-allowed opacity-70`}
            disabled
            title="Google sign-in is not available yet"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </div>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm font-medium text-[#505f76]">
          Already have an account?{' '}
          <Link to="/login" className="ml-1 font-bold text-[#004ac6] hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
