import { Bell, SunMedium } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';

const navItems = [
  { label: 'Ngữ pháp', href: '/grammar' },
  { label: 'Từ vựng', href: '/vocabulary' },
  { label: 'Nghe', href: '/listening' },
  { label: 'Đọc', href: '/reading' },
  { label: 'Đề thi', href: '/exam' },
];

export const TopMenu = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-[#d8dced] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="text-3xl font-extrabold tracking-tight" aria-label="EngHub dashboard">
          <span className="text-[#004ac6]">Eng</span>
          <span className="text-[#18bd84]">Hub</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `pb-1 text-sm font-medium transition ${
                  isActive
                    ? 'border-b-2 border-[#004ac6] text-[#004ac6]'
                    : 'border-b-2 border-transparent text-[#505f76] hover:border-[#cfd7f2] hover:text-[#004ac6]'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-[#434655]">
          <button className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#ededf9] active:scale-95" type="button" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#ededf9] active:scale-95" type="button" aria-label="Toggle theme">
            <SunMedium className="h-5 w-5" />
          </button>
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="hidden max-w-[180px] flex-col items-end leading-tight sm:flex">
                <span className="truncate text-sm font-bold text-[#191b23]">
                  {user?.fullName || user?.email || 'User'}
                </span>
                {user?.email && (
                  <span className="truncate text-xs text-[#667085]">{user.email}</span>
                )}
              </Link>
              <Link to="/profile" aria-label="Profile">
                <img
                  src={
                    user?.avatarUrl ||
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80'
                  }
                  alt="User avatar"
                  className="h-8 w-8 rounded-full object-cover ring-1 ring-transparent transition hover:ring-[#004ac6]"
                />
              </Link>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-[#004ac6] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#003896]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
