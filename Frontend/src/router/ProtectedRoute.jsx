import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { TemplateProvider }    from "../context/TemplateContext";
import { AudienceProvider }    from "../context/AudienceContext";
import { CampaignProvider }    from "../context/CampaignContext";
import { ConnectionProvider }  from "../context/ConnectionContext";

/**
 * ProtectedRoute — wraps private routes.
 * If the user is NOT authenticated → redirect to /login.
 * If authenticated → mount all data providers and render nested routes via <Outlet />.
 *
 * KEY: Providers are inside the auth gate so their data-fetching useEffects
 * only run when a valid token exists — no 401 flood on the login page.
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
          <ConnectionProvider>
            <Outlet />
          </ConnectionProvider>
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

