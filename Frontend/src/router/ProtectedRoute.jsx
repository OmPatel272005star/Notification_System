import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute — wraps private routes.
 * If the user is NOT authenticated → redirect to /login.
 * If authenticated → render nested routes via <Outlet />.
 */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

/**
 * PublicRoute — wraps auth pages (login / signup).
 * If the user IS already authenticated → redirect to /home.
 * If not authenticated → render children normally.
 */
export function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/home" replace /> : children;
}
