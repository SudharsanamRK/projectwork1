import axios from "axios";

const ML_BASE_URL = process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

/**
 * Calls Python ML service
 */
export const predictFishHarvest = async (input) => {
  try {
    const response = await axios.post(`${ML_BASE_URL}/predict`, input, {
      timeout: 8000,
    });

    return {
      success: true,
      model: "fish_predictor_v1",
      data: response.data,
    };
  } catch (err) {
    console.error("ML Service Error:", err.message);

    return {
      success: false,
      error: "ML service unavailable",
    };
  }
};
