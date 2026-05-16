import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthLayout } from '../components/layout/AuthLayout';
import { MainLayout } from '../components/layout/MainLayout';
import { LoginForm } from '../features/auth/components/LoginForm';
import { RegisterForm } from '../features/auth/components/RegisterForm';
import { LoginVisual } from '../features/auth/components/LoginVisual';
import { RegisterVisual } from '../features/auth/components/RegisterVisual';
import { DashboardPage } from '../features/dashboard/components/DashboardPage';
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

export const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/vocabulary" element={<VocabularyPage />} />
        <Route path="/vocabulary/:id" element={<VocabularyDetail />} />
        <Route path="/grammar" element={<GrammarPage />} />
        <Route path="/grammar/:id" element={<GrammarDetail />} />
        <Route path="/exam" element={<ExamPage />} />
        <Route path="/listening" element={<ListeningPage />} />
        <Route path="/listening/:testId/:partId" element={<ListeningPracticePage />} />
        <Route path="/reading" element={<ReadingPage />} />
        <Route path="/reading/:passageId" element={<ReadingPracticePage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      <Route path="/exam/take" element={<ExamInterface />} />

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
