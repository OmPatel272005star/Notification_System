import bcrypt from "bcryptjs";
import jwt    from "jsonwebtoken";
import User   from "../shared/models/User.js";
import { generateToken } from "../shared/config/jwt.js";
import { redis }         from "../shared/config/redis.js";
import { createLogger }  from "../shared/utils/logger.js";

const logger = createLogger('auth-service');

export const signup = async (req, res) => {
  try {
    const { display_name, email, password, role } = req.body;
    if (!display_name || !email || !password)
      return res.status(400).json({ success: false, message: "display_name, email, and password are required" });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing)
      return res.status(409).json({ success: false, message: "An account with this email already exists" });

    const salt          = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const user          = await User.create({ display_name: display_name.trim(), email: email.toLowerCase().trim(), password_hash, role: role || "viewer" });
    const token         = generateToken(user);

    logger.info('user signed up', { userId: user._id, email: user.email, role: user.role });
    return res.status(201).json({ success: true, message: "Account created successfully",
      data: { token, user: { id: user._id, display_name: user.display_name, email: user.email, role: user.role, status: user.status } } });
  } catch (err) {
    logger.error('signup error', { error: err.message });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid email or password" });
    if (user.status === "blocked") return res.status(403).json({ success: false, message: "Your account has been blocked." });

    await User.findByIdAndUpdate(user._id, { last_login_at: new Date() });
    const token = generateToken(user);

    logger.info('user logged in', { userId: user._id, email: user.email, role: user.role });
    return res.status(200).json({ success: true, message: "Login successful",
      data: { token, user: { id: user._id, display_name: user.display_name, email: user.email, role: user.role, status: user.status } } });
  } catch (err) {
    logger.error('login error', { error: err.message });
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    const token = req.token;
    if (!token) return res.status(400).json({ success: false, message: 'No token to invalidate.' });

    let ttl = 86400;
    try { const d = jwt.decode(token); if (d?.exp) ttl = Math.max(1, d.exp - Math.floor(Date.now() / 1000)); } catch {}

    await redis.set(`blocked:${token}`, '1', 'EX', ttl);
    logger.info('user logged out', { userId: req.user?.id });
    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    logger.error('logout error', { error: err.message });
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
