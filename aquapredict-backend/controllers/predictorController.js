import { predictFishHarvest } from "../services/mlPredictService.js";

export const generateHarvestPlan = async (req, res) => {
  const payload = req.body;

  // Validation
  if (!payload || !payload.region || !payload.vessels) {
    return res.status(400).json({
      error: "Invalid input data",
      required: ["region", "vessels", "days", "gear"],
    });
  }

  try {
    const result = await predictFishHarvest(payload);

    if (!result.success) {
      return res.status(503).json({
        error: "Prediction service temporarily unavailable",
      });
    }

    res.json(result.data); // 👈 frontend expects this shape
  } catch (err) {
    console.error("Harvest prediction error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
