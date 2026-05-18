import { Outlet } from 'react-router-dom';
import { StudentTopMenu } from '@/features/student/dashboard/components/StudentTopMenu';

export const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-[#f6f7fc] text-[#191b23]">
      <StudentTopMenu />
      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  );
};
