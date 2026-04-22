import { lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/queryClient';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/features/auth/useAuth';
import { useBootstrap } from '@/features/auth/mutations';

const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('@/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);
const IssuesPage = lazy(() =>
  import('@/pages/IssuesPage').then((m) => ({ default: m.IssuesPage })),
);
const IssueDetailPage = lazy(() =>
  import('@/pages/IssueDetailPage').then((m) => ({
    default: m.IssueDetailPage,
  })),
);
const NewIssuePage = lazy(() =>
  import('@/pages/NewIssuePage').then((m) => ({ default: m.NewIssuePage })),
);
const EditIssuePage = lazy(() =>
  import('@/pages/EditIssuePage').then((m) => ({ default: m.EditIssuePage })),
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const AnalyticsPage = lazy(() =>
  import('@/pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
    </div>
  );
}

function BootstrapGate({ children }: { children: React.ReactNode }) {
  useBootstrap();
  const { isBootstrapped } = useAuth();
  if (!isBootstrapped) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/20 border-t-foreground" />
      </div>
    );
  }
  return <>{children}</>;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/issues" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <BootstrapGate>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route
                path="/login"
                element={
                  <RedirectIfAuthed>
                    <LoginPage />
                  </RedirectIfAuthed>
                }
              />
              <Route
                path="/register"
                element={
                  <RedirectIfAuthed>
                    <RegisterPage />
                  </RedirectIfAuthed>
                }
              />
              <Route
                element={
                  <RequireAuth>
                    <AppShell />
                  </RequireAuth>
                }
              >
                <Route path="/" element={<Navigate to="/issues" replace />} />
                <Route path="/issues" element={<IssuesPage />} />
                <Route path="/issues/new" element={<NewIssuePage />} />
                <Route path="/issues/:id" element={<IssueDetailPage />} />
                <Route path="/issues/:id/edit" element={<EditIssuePage />} />

                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BootstrapGate>
      </BrowserRouter>
      <Toaster
        position="top-right"
        closeButton
        richColors
        toastOptions={{ duration: 3500 }}
      />
    </QueryClientProvider>
  );
}
