import { useState } from 'react';
import {
  BookOpenCheck,
  BookText,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileSpreadsheet,
  LayoutDashboard,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { EngHubLogo } from '@/components/brand/EngHubLogo';

const navItems = [
  { label: 'Tổng quan', href: '/teacher/dashboard', icon: LayoutDashboard },
  { label: 'Lớp học', href: '/teacher/classes', icon: BookOpenCheck },
  { label: 'Bài giao', href: '/teacher/assignments', icon: ClipboardList },
  { label: 'Đề thi', href: '/teacher/tests', icon: FileSpreadsheet },
  { label: 'Từ vựng', href: '/admin/vocabulary', icon: BookText },
];

export const TeacherLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-[#101828]">
      <aside
        className={`fixed inset-y-0 left-0 hidden border-r border-[#d8dced] bg-white px-4 py-5 transition-all duration-200 lg:block ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <EngHubLogo
            markClassName={isCollapsed ? 'h-8 w-11' : 'h-8 w-11'}
            textClassName={isCollapsed ? 'hidden' : 'text-2xl'}
          />
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="hidden h-8 w-8 items-center justify-center rounded-lg border border-[#d8dced] text-[#505f76] transition hover:bg-[#f3f5fb] hover:text-[#004ac6] lg:flex"
              title="Thu gọn menu"
              aria-label="Thu gọn menu"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {isCollapsed && (
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="mt-5 flex h-8 w-full items-center justify-center rounded-lg border border-[#d8dced] text-[#505f76] transition hover:bg-[#f3f5fb] hover:text-[#004ac6]"
            title="Mở rộng menu"
            aria-label="Mở rộng menu"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.href}
                to={item.href}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center rounded-lg px-3 py-2 text-sm font-bold transition ${
                    isActive ? 'bg-[#eaf0ff] text-[#004ac6]' : 'text-[#505f76] hover:bg-[#f3f5fb] hover:text-[#004ac6]'
                  } ${isCollapsed ? 'justify-center' : 'gap-3'}`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <main className={`min-h-screen transition-all duration-200 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        <div className="border-b border-[#d8dced] bg-white px-4 py-4 lg:hidden">
          <EngHubLogo markClassName="h-8 w-11" textClassName="text-2xl" />
        </div>
        <Outlet />
      </main>
    </div>
  );
};
