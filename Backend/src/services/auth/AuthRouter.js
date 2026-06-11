import express from "express";
import { signup, login, logout } from "./AuthController.js";
import { authMiddleware } from "../../shared/middleware/authMiddleware.js";

const router = express.Router();

// Public routes — no auth middleware
router.post("/signup", signup);
router.post("/login",  login);

// Phase 3: logout — requires valid JWT so we can blocklist it in Redis
router.post("/logout", authMiddleware, logout);

export default router;
