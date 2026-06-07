/**
 * requireRole("admin")  — flexible, accepts one or more roles as arguments.
 *
 * ⚠️  Role comes from the JWT (set by authMiddleware as req.user.role).
 *    If you change a user's role in MongoDB, they must log out + log back in
 *    so a fresh token with the new role is issued.
 *
 * Usage:
 *   router.post("/add", authMiddleware, requireRole("admin"), addUser);
 *   router.get("/all",  authMiddleware, requireRole("admin", "viewer"), getAll);
 */
export const requireRole = (...allowed) => (req, res, next) => {
  const role = req.user?.role;
  if (allowed.includes(role)) return next();
  return res.status(403).json({
    success: false,
    message: `Access denied. Required: ${allowed.join(" or ")}. Your role: ${role ?? "none"}`,
  });
};

/**
 * adminOnly — pre-built guard that reads req.user.role from the JWT.
 * No hardcoded string argument needed at the route level.
 *
 * Equivalent to requireRole("admin") but cleaner to read in routers.
 *
 * Usage:
 *   router.post("/add",   authMiddleware, adminOnly, addUser);
 *   router.delete("/:id", authMiddleware, adminOnly, deleteUser);
 */
export const adminOnly = (req, res, next) => {
  const role = req.user?.role;   // comes from the JWT decoded by authMiddleware
  if (role === "admin") return next();
  return res.status(403).json({
    success: false,
    message: `Admin access required. Your current role: ${role ?? "none"}`,
  });
};
