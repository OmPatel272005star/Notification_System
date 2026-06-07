import express from "express";
import { authMiddleware } from "../../shared/middleware/authMiddleware.js";
import { adminOnly }      from "../../shared/middleware/roleMiddleware.js";

import {
  addUser,
  deleteUser,
  updateUser,
  toggleStatus,
  getBulkUser,
} from "./UserController.js";

const router = express.Router();

// ── Any authenticated user ─────────────────────────────────────────────────
router.get("/getBulkUser", authMiddleware, getBulkUser);

// ── Admin-only (role is read from the JWT by adminOnly, not hardcoded here) ─
router.post(  "/add",        authMiddleware, adminOnly, addUser);
router.put(   "/:id",        authMiddleware, adminOnly, updateUser);
router.delete("/:id",        authMiddleware, adminOnly, deleteUser);
router.patch( "/:id/status", authMiddleware, adminOnly, toggleStatus);

export default router;
