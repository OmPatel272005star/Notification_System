import bcrypt from "bcryptjs";
import User   from "../shared/models/User.js";
import { redis } from "../shared/config/redis.js";
import { createLogger } from "../shared/utils/logger.js";

const logger = createLogger('user-service');

const USER_CACHE_TTL = 300;
const LIST_CACHE_TTL = 60;
const userCacheKey = (id)   => `user:${id}`;
const listCacheKey = (page) => `user:list:${page}`;

async function invalidateListCache() {
  const keys = Array.from({ length: 20 }, (_, i) => listCacheKey(i + 1));
  await redis.del(...keys);
}

export const getUserById = async (req, res) => {
  try {
    const cacheKey = userCacheKey(req.params.id);
    const cached   = await redis.get(cacheKey);
    if (cached) return res.status(200).json({ success: true, data: JSON.parse(cached), fromCache: true });
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    await redis.set(cacheKey, JSON.stringify(user), 'EX', USER_CACHE_TTL);
    return res.status(200).json({ success: true, data: user });
  } catch (err) { logger.error('getUserById error', { userId: req.params.id, error: err.message }); return res.status(500).json({ success: false, message: "Internal Server Error" }); }
};

export const getBulkUser = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;
    const cacheKey = listCacheKey(page);
    const cached   = await redis.get(cacheKey);
    if (cached) return res.status(200).json({ ...JSON.parse(cached), fromCache: true });
    const [users, totalCount] = await Promise.all([User.find({}).skip(skip).limit(limit).lean(), User.countDocuments()]);
    const totalPages = Math.ceil(totalCount / limit);
    const payload = { success: true, message: "Users fetched successfully", data: users,
      pagination: { page, limit, totalCount, totalPages, hasNextPage: page < totalPages } };
    await redis.set(cacheKey, JSON.stringify(payload), 'EX', LIST_CACHE_TTL);
    return res.status(200).json(payload);
  } catch (err) { logger.error('getBulkUser error', { error: err.message }); return res.status(500).json({ success: false, message: "Internal Server Error" }); }
};

export const addUser = async (req, res) => {
  try {
    const { display_name, email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ success: false, message: "An account with this email already exists" });
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const user = await User.create({ display_name: display_name?.trim() || email.split("@")[0], email: email.toLowerCase().trim(), password_hash, role: role || "viewer" });
    await invalidateListCache();
    logger.info('user created by admin', { newUserId: user._id, email: user.email, byUserId: req.user?.id });
    return res.status(201).json({ success: true, message: "User added successfully", data: user });
  } catch (err) { logger.error('addUser error', { error: err.message }); return res.status(500).json({ success: false, message: "Internal Server Error" }); }
};

export const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ success: false, message: "User not found" });
    await redis.del(userCacheKey(id));
    await invalidateListCache();
    logger.info('user deleted', { deletedUserId: id, byUserId: req.user?.id });
    return res.status(200).json({ success: true, message: "User deleted successfully", data: deletedUser });
  } catch (err) { logger.error('deleteUser error', { userId: req.params.id, error: err.message }); return res.status(500).json({ success: false, message: "Internal Server Error" }); }
};

export const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { email, password, password_hash, ...safeFields } = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, safeFields, { new: true });
    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });
    await redis.del(userCacheKey(id));
    await invalidateListCache();
    logger.info('user updated', { userId: id, byUserId: req.user?.id });
    return res.status(200).json({ success: true, message: "User updated successfully", data: updatedUser });
  } catch (err) { logger.error('updateUser error', { userId: req.params.id, error: err.message }); return res.status(500).json({ success: false, message: "Internal Server Error" }); }
};

export const toggleStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const allowed = ["active", "blocked", "inactive"];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowed.join(", ")}` });
    const updatedUser = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!updatedUser) return res.status(404).json({ success: false, message: "User not found" });
    await redis.del(userCacheKey(id));
    await invalidateListCache();
    logger.info('user status toggled', { userId: id, status, byUserId: req.user?.id });
    return res.status(200).json({ success: true, message: "Status updated", data: updatedUser });
  } catch (err) { logger.error('toggleStatus error', { userId: req.params.id, error: err.message }); return res.status(500).json({ success: false, message: err.message }); }
};
