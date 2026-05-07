import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({ email, password });
    if (result.success) {
      navigate('/');
    }
  };

  const inputClassName =
    'w-full rounded-lg border border-transparent bg-[#f3f3fe] px-4 py-3 text-base font-normal outline-none transition-all placeholder:text-gray-400 focus:border-[#004ac6] focus:bg-white focus:ring-2 focus:ring-[#004ac6]/20';

  return (
    <div className="w-full">
      <div className="mb-6 text-center lg:text-left">
        <div className="mb-4 flex justify-center lg:hidden">
          <h2 className="text-2xl font-bold text-[#004ac6]">EngHub</h2>
        </div>
        <h2 className="mb-1 text-[28px] font-semibold text-[#191b23]">Welcome Back</h2>
        <p className="text-sm font-medium text-[#505f76] opacity-80">Please enter your details to sign in.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#434655]" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            className={inputClassName}
            placeholder="name@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-[#434655]" htmlFor="password">Password</label>
            <a href="#" className="text-sm font-bold text-[#004ac6] hover:underline">Forgot password?</a>
          </div>
          <input
            id="password"
            type="password"
            className={inputClassName}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6]"
          />
          <label htmlFor="remember" className="cursor-pointer select-none text-sm font-medium text-[#505f76]">
            Remember me for 30 days
          </label>
        </div>

        {error && (
          <div className="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-6 py-3 text-base font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
        </button>

        <div className="relative my-4 flex items-center justify-center">
          <div className="flex-grow border-t border-[#c3c6d7]"></div>
          <span className="mx-4 flex-shrink text-xs font-bold uppercase tracking-wider text-[#505f76]">or</span>
          <div className="flex-grow border-t border-[#c3c6d7]"></div>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-[#c3c6d7] bg-transparent px-6 py-2.5 text-sm font-medium text-[#191b23] transition-all duration-200 hover:bg-[#ededf9]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm font-medium text-[#505f76]">
          Don't have an account? 
          <Link 
            to="/register"
            className="ml-1 font-bold text-[#004ac6] hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>

      
    </div>
  );
};
