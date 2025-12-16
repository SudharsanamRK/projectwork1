import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: "You are AquaBot, a friendly AI assistant for fishermen." },
          { role: "user", content: message }
        ],
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const botReply = response.data.choices[0].message.content;
    res.json({ bot: "AquaBot", message: botReply, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Groq API error:", error.response?.data || error.message);
    res.json({
      bot: "AquaBot",
      message: "I’m AquaBot (Groq offline mode) — please try again later.",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
