import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const getAIResponse = async (userMessage) => {
  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are AquaBot, a friendly AI sea guide offering ocean tips and weather help." },
      { role: "user", content: userMessage },
    ],
  });
  return completion.choices[0].message.content.trim();
};
