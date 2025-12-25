import express from "express";
import { generateHarvestPlan } from "../controllers/predictorController.js";

const router = express.Router();

router.post("/plan", generateHarvestPlan);

export default router;
