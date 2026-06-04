import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TemplateProvider } from "../context/TemplateContext";
import { AudienceProvider } from "../context/AudienceContext";
import { CampaignProvider } from "../context/CampaignContext";

/**
 * ProtectedRoute — wraps private routes.
 * If the user is NOT authenticated → redirect to /login.
 * If authenticated → mount TemplateProvider + AudienceProvider and render
 * nested routes via <Outlet />.
 *
 * KEY: By mounting the data-fetching providers here (inside the auth gate),
 * their useEffect calls to the backend are guaranteed to only run when a
 * valid token already exists — eliminating the 401 flood on the login page.
 */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <TemplateProvider>
      <AudienceProvider>
        <CampaignProvider>
          <Outlet />
        </CampaignProvider>
      </AudienceProvider>
    </TemplateProvider>
  );
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
