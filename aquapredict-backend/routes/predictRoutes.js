import express from "express";
import { predictFish } from "../controllers/predictorController.js";

const router = express.Router();

/**
 * ML-powered fish harvest prediction
 */
router.post("/fish", predictFish);

export default router;
