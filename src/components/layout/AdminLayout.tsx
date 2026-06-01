import { BookText, FileSpreadsheet, LayoutDashboard, ShieldCheck, Users } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { EngHubLogo } from '@/components/brand/EngHubLogo';

const navItems = [
  { label: 'Tổng quan', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Người dùng', href: '/admin/users', icon: Users },
  { label: 'Đề thi', href: '/teacher/tests', icon: FileSpreadsheet },
  { label: 'Vai trò', href: '/admin/roles', icon: ShieldCheck },
  { label: 'Từ vựng', href: '/admin/vocabulary', icon: BookText },
];

export const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#101828]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#d8dced] bg-white px-4 py-5 lg:block">
        <EngHubLogo markClassName="h-8 w-11" textClassName="text-2xl" />
        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition ${
                    isActive ? 'bg-[#eaf0ff] text-[#004ac6]' : 'text-[#505f76] hover:bg-[#f3f5fb] hover:text-[#004ac6]'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <main className="min-h-screen lg:pl-64">
        <div className="border-b border-[#d8dced] bg-white px-4 py-4 lg:hidden">
          <EngHubLogo markClassName="h-8 w-11" textClassName="text-2xl" />
        </div>
        <Outlet />
      </main>
    </div>
  );
};
