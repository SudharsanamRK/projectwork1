import { predictFishHarvest } from "../services/mlPredictService.js";

/**
 * Fish / Harvest prediction controller
 */
export const predictFish = async (req, res) => {
  const payload = req.body;

  // Basic validation
  if (!payload || !payload.region || !payload.vessels) {
    return res.status(400).json({
      error: "Invalid input data",
      required: ["region", "vessels", "days", "gear"],
    });
  }

  const result = await predictFishHarvest(payload);

  if (!result.success) {
    return res.status(503).json({
      error: "Prediction service temporarily unavailable",
    });
  }

  res.json({
    timestamp: new Date().toISOString(),
    confidence: result.data.confidence ?? null,
    prediction: result.data,
    model: result.model,
  });
};
