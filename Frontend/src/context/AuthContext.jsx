import { createContext, useContext, useState } from "react";
import { loginUser, signupUser } from "../services/authService";

const AuthContext = createContext();

const TOKEN_KEY    = "token";
const AUTH_USER_KEY = "auth_user";

export function AuthProvider({ children }) {
  // ── Initialise from localStorage so state survives page refresh ──────────
  const [authState, setAuthState] = useState(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const user  = JSON.parse(localStorage.getItem(AUTH_USER_KEY) || "null");
      if (token && user) return { token, user };
    } catch {
      // Corrupted storage — start fresh
    }
    return { token: null, user: null };
  });

  const { token, user } = authState;

  /** True when a valid token is stored */
  const isAuthenticated = Boolean(token);

  /** True when the logged-in user has the "admin" role */
  const isAdmin = user?.role === "admin";

  // ── Internal helpers ──────────────────────────────────────────────────────
  const _persist = (token, user) => {
    localStorage.setItem(TOKEN_KEY,    token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    setAuthState({ token, user });
  };

  const _clear = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setAuthState({ token: null, user: null });
  };

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Calls POST /auth/login, persists token + user on success.
   * @returns {{ ok: boolean, error?: string }}
   */
  const login = async (email, password) => {
    try {
      const res = await loginUser({ email, password });
      if (res?.success) {
        _persist(res.data.token, res.data.user);
        return { ok: true };
      }
      return { ok: false, error: res?.message || "Login failed" };
    } catch (err) {
      return { ok: false, error: err.message || "Login failed" };
    }
  };

  /**
   * Calls POST /auth/signup, persists token + user on success.
   * @returns {{ ok: boolean, error?: string }}
   */
  const signup = async (display_name, email, password) => {
    try {
      const res = await signupUser({ display_name, email, password });
      if (res?.success) {
        _persist(res.data.token, res.data.user);
        return { ok: true };
      }
      return { ok: false, error: res?.message || "Signup failed" };
    } catch (err) {
      return { ok: false, error: err.message || "Signup failed" };
    }
  };

  /** Clears all auth state and storage. Component should navigate after calling. */
  const logout = () => _clear();

  /**
   * Merges partial data into the stored user object.
   * Useful if an admin updates their own profile/role.
   */
  const updateUser = (data) => {
    const updated = { ...user, ...data };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
    setAuthState((prev) => ({ ...prev, user: updated }));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, isAdmin, login, signup, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
