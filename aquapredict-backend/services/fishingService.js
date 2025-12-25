import axios from "axios";

/* =========================
   Market Trend (unchanged)
========================= */
export const getFishMarketTrend = () => ([
  { day: "Mon", price: 338 },
  { day: "Tue", price: 342 },
  { day: "Wed", price: 345 },
  { day: "Thu", price: 347 },
  { day: "Fri", price: 346 },
  { day: "Sat", price: 344 },
  { day: "Sun", price: 343 }
]);

/* =========================
   Rule-Based Fish Fallback
========================= */
function ruleBasedFishFallback(env = {}) {
  const { region = "", month = "" } = env;
  const r = region.toLowerCase();
  const m = month.toLowerCase();

  if (r.includes("goa") && ["november", "december"].includes(m)) {
    return {
      species: "Pomfret",
      confidence: 0.42,
      reason: "Seasonal Pomfret peak in Goa"
    };
  }

  if (r.includes("chennai") && ["july", "august"].includes(m)) {
    return {
      species: "Mackerel",
      confidence: 0.45,
      reason: "Monsoon-driven Mackerel activity"
    };
  }

  return {
    species: "Sardine",
    confidence: 0.35,
    reason: "Safe fallback species"
  };
}

/* =========================
   ML Fish Prediction
========================= */
async function getMLPrediction(env = {}) {
  const payload = {
    region: env.region || "Chennai Coast",
    month: env.month || "January",
    temperature: env.temperature ?? 27,
    salinity: env.salinity ?? 34,
    oxygen: env.oxygen ?? 6.5
  };

  const { data } = await axios.post(
    "http://127.0.0.1:8000/advanced_predict",
    payload,
    { timeout: 3000 }
  );

  return data;
}

/* =========================
   Fishing Insights (UPGRADED)
========================= */
export const getFishingInsights = async (dashboard = false, env = {}) => {
  const {
    waveHeight = 1.0,
    windSpeed = 8,
    temperature = 27
  } = env;

  /* ---------- SAFETY LOGIC ---------- */
  let safetyStatus = "Safe";
  let advice = "Sea conditions are generally safe for fishing.";

  if (waveHeight >= 1.5) {
    safetyStatus = "Caution";
    advice =
      "Wave height is elevated. Fishing is risky for small boats. Use safety gear.";
  }

  if (waveHeight >= 2.0) {
    safetyStatus = "Unsafe";
    advice =
      "Wave height exceeds safe limits. Fishing is not recommended today.";
  }

  /* ---------- SIMPLE MODE ---------- */
  if (!dashboard) {
    return advice;
  }

  /* ---------- ML + RULE FUSION ---------- */
  let fishPrediction = null;
  let predictionSource = "ml";

  try {
    const mlResult = await getMLPrediction(env);

    if (
      !mlResult ||
      !mlResult.species ||
      mlResult.confidence < 0.3
    ) {
      throw new Error("Low ML confidence");
    }

    fishPrediction = {
      species: mlResult.species,
      confidence: mlResult.confidence,
      reason: "ML model prediction"
    };
  } catch (err) {
    predictionSource = "rules";
    fishPrediction = ruleBasedFishFallback(env);
  }

  /* ---------- SAFETY × ML ADJUSTMENT ---------- */
  if (safetyStatus === "Unsafe") {
    fishPrediction.confidence = Math.min(
      fishPrediction.confidence,
      0.4
    );
  }

  /* ---------- FINAL DASHBOARD PAYLOAD ---------- */
  return {
    safetyStatus,
    recommendedAction:
      safetyStatus === "Safe" ? "Go fishing" : "Delay fishing",

    sustainabilityScore:
      safetyStatus === "Unsafe" ? 55 :
      fishPrediction.confidence > 0.6 ? 85 : 75,

    marketSignal:
      fishPrediction.confidence > 0.6 ? "Bullish" : "Stable",

    fishRecommendation: {
      species: fishPrediction.species,
      confidence: fishPrediction.confidence,
      source: predictionSource,
      reason: fishPrediction.reason
    }
  };
};
