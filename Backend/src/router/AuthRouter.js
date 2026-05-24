import express from "express";
import { signup, login } from "../controller/AuthController.js";

const router = express.Router();

// Public routes — no auth middleware
router.post("/signup", signup);
router.post("/login",  login);

export default router;
