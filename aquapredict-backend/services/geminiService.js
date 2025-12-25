import axios from "axios";

export const getGeminiResponse = async (prompt) => {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
SYSTEM (MANDATORY RULES — MUST FOLLOW):

You are AquaBot, an AI assistant.

STRICT RESPONSE FORMAT:
- Respond ONLY in plain text paragraphs.
- DO NOT use tables.
- DO NOT use headings, titles, or section labels.
- DO NOT use checklists or step-by-step formatting.
- DO NOT use bullet points unless the user explicitly asks.
- Keep responses conversational and human, like ChatGPT.
- Max 6–8 sentences unless asked for more.
- Summarize first; expand only if requested.

STYLE RULES:
- Natural, calm, confident.
- No textbook language.
- No info dumping.
- Match the user's tone.

If these rules are violated, the response is incorrect.

USER MESSAGE:
${prompt}
`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 300
      }
    }
  );

  return response.data.candidates[0].content.parts[0].text;
};
