import { AVATAR_COLORS } from "./userConstants";

export function getInitials(name, email) {
  if (name && name.trim())
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return email ? email[0].toUpperCase() : "?";
}

/**
 * Normalise a raw MongoDB user document to the shape the UI expects.
 * Backend: _id, display_name, role (lowercase), status (lowercase)
 * UI:      id,  name,         role,             status
 */
export function normalizeUser(u, index) {
  return {
    id:       u._id,
    name:     u.display_name || u.email?.split("@")[0] || "Unknown",
    email:    u.email,
    role:     u.role,    // 'admin' | 'viewer'
    status:   u.status,  // 'active' | 'blocked'
    initials: getInitials(u.display_name, u.email),
    color:    AVATAR_COLORS[index % AVATAR_COLORS.length],
  };
}
