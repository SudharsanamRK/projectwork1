// controllers/chatController.js
import { getGeminiResponse } from "../services/geminiService.js";
import { getGroqResponse } from "../services/groqService.js";
import { getWeather } from "../services/weatherService.js";
import {
  getFishMarketTrend,
  getFishingInsights
} from "../services/fishingService.js";
import { normalizeDashboard } from "../utils/normalize.js";

/* =========================
   CHATBOT HANDLER
========================= */
export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    let reply = "";

    try {
      reply = await getGeminiResponse(message);
    } catch {
      reply = await getGroqResponse(message);
    }

    res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

/* =========================
   DASHBOARD HANDLER
========================= */
export const getDashboard = async (req, res) => {
  try {
    const region = "Chennai Coast";
    const month = new Date().toLocaleString("default", { month: "long" });

    const weather = await getWeather("Chennai");

    const environment = {
      region,
      month,
      temperature: weather.temperature,
      salinity: weather.salinity,
      waveHeight: weather.waveHeight,
      windSpeed: parseFloat(weather.wind) || 8
    };

    const insights = await getFishingInsights(true, environment);
    const marketTrend = getFishMarketTrend();

    const rawResponse = {
      timestamp: Date.now(),
      environment: {
        temperature: environment.temperature,
        salinity: environment.salinity,
        waveHeight: environment.waveHeight
      },
      insights: {
        topSpecies: insights?.fishRecommendation?.species || "—",
        sustainabilityScore: insights?.sustainabilityScore
      },
      marketTrend,
      alerts:
        insights?.safetyStatus === "Unsafe"
          ? ["Unsafe sea conditions detected"]
          : []
    };

    const safeResponse = normalizeDashboard(rawResponse);
    res.json(safeResponse);
  } catch (err) {
    console.error("Dashboard Error:", err);

    res.json(
      normalizeDashboard({
        timestamp: Date.now(),
        environment: {},
        insights: {},
        marketTrend: [],
        alerts: ["Dashboard running in fallback mode"]
      })
    );
  }
};
