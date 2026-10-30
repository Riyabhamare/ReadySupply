import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './components/common/Toast.jsx';
import { AppLayout } from './layouts/AppLayout.jsx';
import { ProtectedRoute } from './components/common/ProtectedRoute.jsx';

// Route-level code splitting via React.lazy
const LandingPage = lazy(() => import('./pages/LandingPage.jsx').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx').then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx').then(m => ({ default: m.DashboardPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx').then(m => ({ default: m.ProfilePage })));
const EvidenceVaultPage = lazy(() => import('./pages/EvidenceVaultPage.jsx').then(m => ({ default: m.EvidenceVaultPage })));
const GapMatrixPage = lazy(() => import('./pages/GapMatrixPage.jsx').then(m => ({ default: m.GapMatrixPage })));
const ActionsPage = lazy(() => import('./pages/ActionsPage.jsx').then(m => ({ default: m.ActionsPage })));
const EvidencePackPage = lazy(() => import('./pages/EvidencePackPage.jsx').then(m => ({ default: m.EvidencePackPage })));
const SharedPackViewPage = lazy(() => import('./pages/SharedPackViewPage.jsx').then(m => ({ default: m.SharedPackViewPage })));
const AdminReviewPage = lazy(() => import('./pages/AdminReviewPage.jsx').then(m => ({ default: m.AdminReviewPage })));
const DesignSystemPage = lazy(() => import('./pages/DesignSystemPage.jsx').then(m => ({ default: m.DesignSystemPage })));

const RouteLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteLoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/shared/:token" element={<SharedPackViewPage />} />

                {/* Protected App Layout Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<AppLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/vault" element={<EvidenceVaultPage />} />
                    <Route path="/gap-matrix" element={<GapMatrixPage />} />
                    <Route path="/actions" element={<ActionsPage />} />
                    <Route path="/pack" element={<EvidencePackPage />} />
                    <Route path="/design-system" element={<DesignSystemPage />} />

                    {/* Admin Protected Route */}
                    <Route element={<ProtectedRoute requireAdmin={true} />}>
                      <Route path="/admin" element={<AdminReviewPage />} />
                    </Route>
                  </Route>
                </Route>

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
