import bcrypt from "bcryptjs";
import User   from "../../shared/models/User.js";
import { redis } from "../../shared/config/redis.js";

// ─────────────────────────────────────────────────────────────────────────────
// Phase 3 — Redis cache TTLs
// ─────────────────────────────────────────────────────────────────────────────
const USER_CACHE_TTL  = 300;   // 5 min  — single user profile
const LIST_CACHE_TTL  = 60;    // 60 sec — paginated list

const userCacheKey = (id)   => `user:${id}`;
const listCacheKey = (page) => `user:list:${page}`;

// ─────────────────────────────────────────────────────────────────────────────
// GET /user/:id  — single user with Redis cache
// ─────────────────────────────────────────────────────────────────────────────
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = userCacheKey(id);

    // 1. Cache hit?
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`[cache] HIT  ${cacheKey}`);
      return res.status(200).json({ success: true, data: JSON.parse(cached), fromCache: true });
    }

    // 2. Cache miss — query DB
    console.log(`[cache] MISS ${cacheKey}`);
    const user = await User.findById(id).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 3. Write to cache
    await redis.set(cacheKey, JSON.stringify(user), 'EX', USER_CACHE_TTL);

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(`[getUserById]`, err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /user/getBulkUser  — paginated list with Redis cache
// ─────────────────────────────────────────────────────────────────────────────
const getBulkUser = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;
    const cacheKey = listCacheKey(page);

    // 1. Cache hit?
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`[cache] HIT  ${cacheKey}`);
      return res.status(200).json({ ...JSON.parse(cached), fromCache: true });
    }

    // 2. Cache miss
    console.log(`[cache] MISS ${cacheKey}`);
    const [users, totalCount] = await Promise.all([
      User.find({}).skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const payload = {
      success: true,
      message: "Users fetched successfully",
      data: users,
      pagination: { page, limit, totalCount, totalPages, hasNextPage: page < totalPages },
    };

    await redis.set(cacheKey, JSON.stringify(payload), 'EX', LIST_CACHE_TTL);

    return res.status(200).json(payload);
  } catch (err) {
    console.error(`[getBulkUser]`, err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /user/add  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const addUser = async (req, res) => {
  try {
    const { display_name, email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = await User.create({
      display_name: display_name?.trim() || email.split("@")[0],
      email:        email.toLowerCase().trim(),
      password_hash,
      role:         role || "viewer",
    });

    // Invalidate list cache (new user changes page counts)
    await invalidateListCache();

    return res.status(201).json({ success: true, message: "User added successfully", data: user });
  } catch (err) {
    console.error(`[addUser]`, err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /user/:id  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Invalidate caches
    await redis.del(userCacheKey(id));
    await invalidateListCache();

    return res.status(200).json({ success: true, message: "User deleted successfully", data: deletedUser });
  } catch (err) {
    console.error(`[deleteUser]`, err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /user/:id  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { email, password, password_hash, ...safeFields } = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, safeFields, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Invalidate caches
    await redis.del(userCacheKey(id));
    await invalidateListCache();

    return res.status(200).json({ success: true, message: "User updated successfully", data: updatedUser });
  } catch (err) {
    console.error(`[updateUser]`, err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /user/:id/status  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const toggleStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    const allowedStatus = ["active", "blocked", "inactive"];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatus.join(", ")}`,
      });
    }

    const updatedUser = await User.findByIdAndUpdate(id, { status }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Invalidate caches
    await redis.del(userCacheKey(id));
    await invalidateListCache();

    return res.status(200).json({ success: true, message: "Status updated", data: updatedUser });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Helper — delete all paginated list cache keys (pages 1-20)
// ─────────────────────────────────────────────────────────────────────────────
async function invalidateListCache() {
  const keys = Array.from({ length: 20 }, (_, i) => listCacheKey(i + 1));
  await redis.del(...keys);
}

export { getUserById, addUser, deleteUser, updateUser, toggleStatus, getBulkUser };
