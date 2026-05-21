import { Route, Routes } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { StudentLayout } from '../components/layout/StudentLayout';
import { TeacherLayout } from '../components/layout/TeacherLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { RootRedirect } from './RootRedirect';
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { LoginVisual } from '../features/auth/components/LoginVisual';
import { RegisterVisual } from '../features/auth/components/RegisterVisual';
import { StudentDashboardPage } from '../features/student/dashboard/components/StudentDashboardPage';
import { VocabularyPage } from '../features/vocabulary/components/VocabularyPage';
import { VocabularyDetail } from '../features/vocabulary/components/VocabularyDetail';
import { GrammarPage } from '../features/grammar/components/GrammarPage';
import { GrammarDetail } from '../features/grammar/components/GrammarDetail';
import { ExamPage } from '../features/exam/components/ExamPage';
import { ExamInterface } from '../features/exam/components/ExamInterface';
import { ListeningPage } from '../features/listening/components/ListeningPage';
import { ListeningPracticePage } from '../features/listening/components/ListeningPracticePage';
import { ReadingPage } from '../features/reading/components/ReadingPage';
import { ReadingPracticePage } from '../features/reading/components/ReadingPracticePage';
import { ProfilePage } from '../features/profile/components/ProfilePage';
import { TeacherDashboardPage } from '../features/teacher/dashboard/components/TeacherDashboardPage';
import { TeacherClassesPage } from '../features/teacher/classes/components/TeacherClassesPage';
import { TeacherAssignmentsPage } from '../features/teacher/assignments/components/TeacherAssignmentsPage';
import { TestListPage } from '../features/teacher/tests/components/TestListPage';
import { CreateTestPage } from '../features/teacher/tests/components/CreateTestPage';
import { AdminDashboardPage } from '../features/admin/dashboard/components/AdminDashboardPage';
import { AdminUsersPage } from '../features/admin/users/components/AdminUsersPage';
import { AdminRolesPage } from '../features/admin/roles/components/AdminRolesPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />

        <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
          <Route element={<StudentLayout />}>
            <Route path="/dashboard" element={<StudentDashboardPage />} />
            <Route path="/vocabulary" element={<VocabularyPage />} />
            <Route path="/vocabulary/:id" element={<VocabularyDetail />} />
            <Route path="/grammar" element={<GrammarPage />} />
            <Route path="/grammar/:id" element={<GrammarDetail />} />
            <Route path="/exam" element={<ExamPage />} />
            <Route path="/listening" element={<ListeningPage />} />
            <Route path="/listening/:testId/:partId" element={<ListeningPracticePage />} />
            <Route path="/reading" element={<ReadingPage />} />
            <Route path="/reading/:passageId" element={<ReadingPracticePage />} />
          </Route>
          <Route path="/exam/take" element={<ExamInterface />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={['TEACHER']} />}>
          <Route element={<TeacherLayout />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
            <Route path="/teacher/classes" element={<TeacherClassesPage />} />
            <Route path="/teacher/assignments" element={<TeacherAssignmentsPage />} />
            <Route path="/teacher/tests" element={<TestListPage />} />
            <Route path="/teacher/tests/create" element={<CreateTestPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/roles" element={<AdminRolesPage />} />
          </Route>
        </Route>
      </Route>

      <Route
        path="/login"
        element={
          <AuthLayout visualContent={<LoginVisual />}>
            <LoginForm />
          </AuthLayout>
        }
      />

      <Route
        path="/register"
        element={
          <AuthLayout reverse visualContent={<RegisterVisual />}>
            <RegisterForm />
          </AuthLayout>
        }
      />
    </Routes>
  );
};
