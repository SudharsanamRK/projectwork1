import axios from "axios";

export const getGroqResponse = async (message) => {
  try {
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "openai/gpt-oss-20b",
        messages: [
            {
                role: "system",
                content: `
                You are AquaBot.

                STRICT RESPONSE RULES (MANDATORY):
                - Respond ONLY in plain text paragraphs.
                - DO NOT use tables.
                - DO NOT use headings, titles, or section labels.
                - DO NOT use bullet points unless the user explicitly asks.
                - DO NOT format responses like guides, manuals, or checklists.
                - Keep answers conversational and human, like ChatGPT.
                - Max 6–8 sentences unless the user asks for detail.
                - If a question sounds complex, summarize first and ask if more detail is needed.

                If you break these rules, the response is considered incorrect.

                Tone rules:
                - Calm, practical, human.
                - No over-explaining.
                - No info dumping.
                `
            },
            { role: "user", content: message }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(
      "Groq API error:",
      error.response?.data || error.message
    );
    throw new Error("Groq service failed");
  }
};
