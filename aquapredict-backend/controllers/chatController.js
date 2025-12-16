import { getAIResponse } from "../services/openaiService.js";
import { getWeather } from "../services/weatherService.js";
import { getFishingInsights } from "../services/fishingService.js";
import { formatResponse } from "../utils/formatResponse.js";

export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message required" });

    // Detect intent
    let reply = "";
    if (message.toLowerCase().includes("weather")) {
      const weather = await getWeather("Chennai");
      reply = `🌤️ Current sea weather near Chennai: ${weather}`;
    } else if (message.toLowerCase().includes("fish")) {
      reply = getFishingInsights();
    } else {
      reply = await getAIResponse(message);
    }

    res.json(formatResponse(reply));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
