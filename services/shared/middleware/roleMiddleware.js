export const requireRole = (...allowed) => (req, res, next) => {
  const role = req.user?.role;
  if (allowed.includes(role)) return next();
  return res.status(403).json({
    success: false,
    message: `Access denied. Required: ${allowed.join(' or ')}. Your role: ${role ?? 'none'}`,
  });
};

export const adminOnly = (req, res, next) => {
  const role = req.user?.role;
  if (role === 'admin') return next();
  return res.status(403).json({
    success: false,
    message: `Admin access required. Your current role: ${role ?? 'none'}`,
  });
};
