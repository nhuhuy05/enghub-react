import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { EngHubLogo } from '../../../components/brand/EngHubLogo';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({ email, password });
    if (result.success) {
      navigate('/');
    }
  };

  const inputClassName =
    'h-12 w-full rounded-lg border border-transparent bg-[#f3f3fe] px-4 text-base font-normal outline-none transition-all placeholder:text-gray-400 focus:border-[#004ac6] focus:bg-white focus:ring-2 focus:ring-[#004ac6]/20';

  return (
    <div className="w-full">
      <div className="mx-auto mb-5 w-[92%] text-center lg:text-left">
        <div className="mb-4 flex justify-center lg:hidden">
          <EngHubLogo markClassName="h-8 w-11" textClassName="text-2xl" />
        </div>
        <h2 className="mb-1 text-[28px] font-semibold text-[#191b23]">Chào mừng trở lại</h2>
        <p className="text-sm font-medium text-[#505f76] opacity-80">Nhập thông tin tài khoản để tiếp tục học.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div className="mx-auto w-[92%]">
          <label className="mb-2 block text-sm font-medium text-[#434655]" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className={inputClassName}
            placeholder="enghub@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mx-auto w-[92%]">
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium text-[#434655]" htmlFor="password">
              Mật khẩu
            </label>
            <button
              type="button"
              className="cursor-not-allowed text-sm font-normal text-[#94a3b8]"
              disabled
              title="Chức năng đặt lại mật khẩu chưa khả dụng"
            >
              Quên mật khẩu?
            </button>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`${inputClassName} pr-12`}
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[#94a3b8] transition hover:bg-white/70 hover:text-[#004ac6]"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="mx-auto flex w-[92%] items-center gap-2">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 cursor-pointer rounded border-[#c3c6d7] text-[#004ac6] focus:ring-[#004ac6]"
          />
          <label htmlFor="remember" className="cursor-pointer select-none text-sm font-medium text-[#505f76]">
            Ghi nhớ đăng nhập trong 30 ngày
          </label>
        </div>

        {error && <div className="rounded-md border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <button
          type="submit"
          className="mx-auto mt-2 flex h-12 w-[92%] items-center justify-center gap-2 rounded-lg bg-[#004ac6] px-6 text-base font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Đăng nhập'}
        </button>

        <div className="relative mx-auto my-3 flex w-[92%] items-center justify-center">
          <div className="flex-grow border-t border-[#c3c6d7]"></div>
          <span className="mx-4 flex-shrink text-xs font-bold uppercase tracking-wider text-[#505f76]">hoặc</span>
          <div className="flex-grow border-t border-[#c3c6d7]"></div>
        </div>

        <button
          type="button"
          className="mx-auto flex h-12 w-[92%] cursor-not-allowed items-center justify-center gap-3 rounded-lg border border-[#c3c6d7] bg-transparent px-6 text-sm font-medium text-[#94a3b8] opacity-70"
          disabled
          title="Đăng nhập bằng Google chưa khả dụng"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
              fill="#EA4335"
            />
          </svg>
          Đăng nhập với Google
        </button>
      </form>

      <div className="mx-auto mt-5 w-[92%] text-center">
        <p className="text-sm font-medium text-[#505f76]">
          Chưa có tài khoản?
          <Link to="/register" className="ml-1 font-bold text-[#004ac6] hover:underline">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
};
