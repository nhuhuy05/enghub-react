import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { AdminLayout } from '../components/layout/AdminLayout';
import { StudentLayout } from '../components/layout/StudentLayout';
import { TeacherLayout } from '../components/layout/TeacherLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { RootRedirect } from './RootRedirect';
import { LoginForm } from '../features-user/auth/components/LoginForm';
import { RegisterForm } from '../features-user/auth/components/RegisterForm';
import { LoginVisual } from '../features-user/auth/components/LoginVisual';
import { RegisterVisual } from '../features-user/auth/components/RegisterVisual';
import { StudentDashboardPage } from '../features-user/student/dashboard/components/StudentDashboardPage';
import { VocabularyPage } from '../features-user/vocabulary/components/VocabularyPage';
import { VocabularyDetail } from '../features-user/vocabulary/components/VocabularyDetail';
import { VocabularyReviewPage } from '../features-user/vocabulary/components/VocabularyReviewPage';
import { AdminVocabularyTopicsPage } from '../features-user/vocabulary/components/AdminVocabularyTopicsPage';
import { AdminVocabularyWordsPage } from '../features-user/vocabulary/components/AdminVocabularyWordsPage';
import { GrammarPage } from '../features-user/grammar/components/GrammarPage';
import { GrammarDetail } from '../features-user/grammar/components/GrammarDetail';
import { ListeningPage } from '../features-user/listening/components/ListeningPage';
import { ListeningPracticePage } from '../features-user/listening/components/ListeningPracticePage';
import { ReadingPage } from '../features-user/reading/components/ReadingPage';
import { ReadingPracticePage } from '../features-user/reading/components/ReadingPracticePage';
import { ProfilePage } from '../features-user/profile/components/ProfilePage';
import { TestCatalogPage } from '../features-user/test-attempt/components/TestCatalogPage';
import { AttemptHistoryPage } from '../features-user/test-attempt/components/AttemptHistoryPage';
import { AttemptRunnerPage } from '../features-user/test-attempt/components/AttemptRunnerPage';
import { AttemptResultPage } from '../features-user/test-attempt/components/AttemptResultPage';
import { TeacherDashboardPage } from '../features-teacher/dashboard/components/TeacherDashboardPage';
import { TeacherClassesPage } from '../features-teacher/classes/components/TeacherClassesPage';
import { TeacherAssignmentsPage } from '../features-teacher/assignments/components/TeacherAssignmentsPage';
import { TestListPage } from '../features-teacher/tests/components/TestListPage';
import { CreateTestPage } from '../features-teacher/tests/components/CreateTestPage';
import { AdminListeningPage } from '../features-teacher/listening/components/AdminListeningPage';
import { AdminDashboardPage } from '../features-admin/dashboard/components/AdminDashboardPage';
import { AdminUsersPage } from '../features-admin/users/components/AdminUsersPage';
import { AdminRolesPage } from '../features-admin/roles/components/AdminRolesPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route element={<StudentLayout />}>
        <Route path="/tests" element={<TestCatalogPage />} />
        <Route path="/tests/:testId" element={<Navigate to="/tests" replace />} />
        <Route path="/exam" element={<Navigate to="/tests" replace />} />
      </Route>
      <Route path="/exam/take" element={<Navigate to="/tests" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />

        <Route element={<RoleRoute allowedRoles={['STUDENT']} />}>
          <Route element={<StudentLayout />}>
            <Route path="/dashboard" element={<StudentDashboardPage />} />
            <Route path="/vocabulary" element={<VocabularyPage />} />
            <Route path="/vocabulary/review" element={<VocabularyReviewPage />} />
            <Route path="/vocabulary/topics/:topicId" element={<VocabularyDetail />} />
            <Route path="/vocabulary/:id" element={<Navigate to="/vocabulary" replace />} />
            <Route path="/grammar" element={<GrammarPage />} />
            <Route path="/grammar/:id" element={<GrammarDetail />} />
            <Route path="/attempts" element={<AttemptHistoryPage />} />
            <Route path="/listening" element={<ListeningPage />} />
            <Route path="/listening/:testId/:partId" element={<ListeningPracticePage />} />
            <Route path="/reading" element={<ReadingPage />} />
            <Route path="/reading/:passageId" element={<ReadingPracticePage />} />
          </Route>
          <Route path="/attempts/:attemptId" element={<AttemptRunnerPage />} />
          <Route path="/attempts/:attemptId/result" element={<AttemptResultPage />} />
        </Route>

        <Route element={<RoleRoute allowedRoles={['TEACHER']} />}>
          <Route element={<TeacherLayout />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboardPage />} />
            <Route path="/teacher/classes" element={<TeacherClassesPage />} />
            <Route path="/teacher/assignments" element={<TeacherAssignmentsPage />} />
            <Route path="/teacher/tests" element={<TestListPage />} />
            <Route path="/teacher/tests/create" element={<CreateTestPage />} />
            <Route path="/teacher/listening" element={<AdminListeningPage />} />
            <Route path="/admin/vocabulary" element={<AdminVocabularyTopicsPage />} />
            <Route path="/admin/vocabulary/topics" element={<Navigate to="/admin/vocabulary" replace />} />
            <Route path="/admin/vocabulary/topics/:topicId" element={<AdminVocabularyWordsPage />} />
          </Route>
        </Route>

        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/teacher/tests" element={<TestListPage />} />
            <Route path="/teacher/tests/create" element={<CreateTestPage />} />
            <Route path="/admin/listening" element={<AdminListeningPage />} />
            <Route path="/admin/vocabulary" element={<AdminVocabularyTopicsPage />} />
            <Route path="/admin/vocabulary/topics" element={<Navigate to="/admin/vocabulary" replace />} />
            <Route path="/admin/vocabulary/topics/:topicId" element={<AdminVocabularyWordsPage />} />
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
