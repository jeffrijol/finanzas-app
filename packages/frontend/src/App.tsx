import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardPage } from '@/pages/DashboardPage';
import { MaintenancePage } from '@/pages/MaintenancePage';
import { ReportsPage } from '@/pages/ReportsPage';
import { ExcelsPage } from '@/pages/ExcelsPage';
import { AuthPage } from '@/pages/AuthPage';
import { AuthCallback } from '@/pages/AuthCallback';
import { AuthProvider } from '@/providers/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Root wrapper to handle redirection logic */}
          <Route path="/" element={
            <ProtectedRoute>
              {/* If authenticated, ProtectedRoute renders children (DashboardPage), 
                  but we want to redirect / to /dashboard explicitly or just render Dashboard here.
                  Let's make / redirect to /dashboard if auth, or /auth if not.
                  Actually ProtectedRoute redirects to /login (now /auth) if not auth.
               */}
               <DashboardPage /> 
            </ProtectedRoute>
          } />
          
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
          <Route path="/register" element={<Navigate to="/auth?mode=register" replace />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/mantenimiento" element={
            <ProtectedRoute>
              <MaintenancePage />
            </ProtectedRoute>
          } />
          <Route path="/reportes" element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          } />
          <Route path="/excels" element={
            <ProtectedRoute>
              <ExcelsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
