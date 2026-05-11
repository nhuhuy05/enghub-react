import { useEffect } from 'react';
import { AppRoutes } from './routes/AppRoutes';
import { useAuth } from './features/auth/hooks/useAuth';

function App() {
  const { initializeAuth } = useAuth();

  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

  return <AppRoutes />;
}

export default App;
