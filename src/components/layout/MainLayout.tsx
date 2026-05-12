import { Outlet } from 'react-router-dom';
import { TopMenu } from '../../features/dashboard/components/TopMenu';

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#f6f7fc] text-[#191b23]">
      <TopMenu />
      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  );
};
