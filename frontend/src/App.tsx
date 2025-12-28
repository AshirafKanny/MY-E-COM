import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Cart } from "./pages/Cart";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Orders } from "./pages/Orders";
import { Products } from "./pages/Products";
import { Register } from "./pages/Register";
import { api } from "./lib/api";
import { useAuthStore, User } from "./store/authStore";

function AuthProvider({ children }: { children: JSX.Element }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [status, setStatus] = useState<"loading" | "ready">("loading");
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (!accessToken) {
        if (!cancelled) setStatus("ready");
        return;
      }

      try {
        const data = await api.get<{ user: User }>("/api/auth/me");
        if (!cancelled) {
          setAuth({ user: data.user, accessToken });
          setSessionError(null);
        }
      } catch (_err) {
        if (!cancelled) {
          setSessionError("Session expired. Please log in again.");
          clearAuth();
        }
      } finally {
        if (!cancelled) setStatus("ready");
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [accessToken, clearAuth, setAuth]);

  if (status !== "ready") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base-200 text-base-content/80">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-base-300 bg-base-100 px-6 py-5 shadow-sm">
          <div className="loading loading-spinner loading-md text-primary"></div>
          <div className="text-sm">Loading session...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {sessionError && (
        <div className="bg-warning/20 text-warning-content border border-warning/40 px-4 py-3 text-sm">
          {sessionError}
        </div>
      )}
      {children}
    </>
  );
}

function RequireAuth({ children, role }: { children: JSX.Element; role?: "admin" }) {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="cart" element={<Cart />} />
          <Route
            path="orders"
            element={
              <RequireAuth>
                <Orders />
              </RequireAuth>
            }
          />
          <Route
            path="admin"
            element={
              <RequireAuth role="admin">
                <AdminDashboard />
              </RequireAuth>
            }
          />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
