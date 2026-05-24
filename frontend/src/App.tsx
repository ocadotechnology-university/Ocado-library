import type { ReactElement } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AppChromeProvider, useAppChrome } from "./context/AppChromeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NotificationPanel from "./components/UI/NotificationPanel";
import Account from "./pages/Account";
import Home from "./pages/Home";
import AuthCallback from "./pages/AuthCallback";
import Login from "./pages/Login";

function RequireAuth({ children }: { children: ReactElement }) {
  const { isAuthenticated, authLoading } = useAuth();
  const location = useLocation();
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6fb]">
        <p className="text-[#43485e]">Loading…</p>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

function PublicOnly({ children }: { children: ReactElement }) {
  const { isAuthenticated, authLoading } = useAuth();
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6fb]">
        <p className="text-[#43485e]">Loading…</p>
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

export function AppRoutes() {
  const { notificationsOpen, setNotificationsOpen } = useAppChrome();
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/login"
          element={
            <PublicOnly>
              <Login />
            </PublicOnly>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          }
        />
        <Route
          path="/account"
          element={
            <RequireAuth>
              <Account />
            </RequireAuth>
          }
        />
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
        />
      </Routes>
      <NotificationPanel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppChromeProvider>
          <AppRoutes />
        </AppChromeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
