import express from "express";
import { handleChat, getDashboard } from "../controllers/chatController.js";

const router = express.Router();

/**
 * =========================
 * CHATBOT (AquaBot)
 * POST /api/chat
 * =========================
 */
router.post("/", handleChat);

/**
 * =========================
 * DASHBOARD DATA API
 * GET /api/chat/dashboard
 * =========================
 */
router.get("/dashboard", getDashboard);

export default router;
