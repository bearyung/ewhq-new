import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Auth0ProviderWithHistory } from './components/Auth0ProviderWithHistory'
import { Auth0ContextProvider, useAuth } from './contexts/Auth0Context'
import { LoginPage } from './pages/LoginPage'
import { DashboardLayout } from './layouts/DashboardLayout'
import { DashboardPage } from './pages/DashboardPage'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth0();
  const { user, loading: userLoading } = useAuth();

  // Show loading while Auth0 or user profile is loading
  if (authLoading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Wait for user profile to be loaded
  if (isAuthenticated && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Both auth and user profile are ready
  return <>{children}</>;
}

// Callback Component for Auth0
function CallbackPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth0();
  const { user, loading: userLoading } = useAuth();

  useEffect(() => {
    // Wait for both Auth0 authentication and user profile sync
    if (!isLoading && !userLoading) {
      if (isAuthenticated && user) {
        // Both auth and user profile are ready, navigate to dashboard
        navigate('/', { replace: true });
      } else if (!isAuthenticated && !isLoading) {
        // Authentication failed, go back to login
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, user, userLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}

// App Content with Auth0 hooks available
function AppContent() {
  const { isAuthenticated } = useAuth0();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Auth0ProviderWithHistory>
        <Auth0ContextProvider>
          <AppContent />
        </Auth0ContextProvider>
      </Auth0ProviderWithHistory>
    </BrowserRouter>
  )
}

export default App