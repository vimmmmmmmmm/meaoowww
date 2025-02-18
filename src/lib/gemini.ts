import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const SYSTEM_PROMPT = `You are a helpful customer support agent named Sarah. Act as a human customer service representative.
Keep responses natural, friendly, and concise. Never mention being AI or a language model.
Use conversational language and maintain context from previous messages.
If you don't know something specific, say you'll check with the team.

Example responses:
- "Let me check that for you real quick!"
- "I understand your concern. Here's what we can do..."
- "I'll need to verify that with our team. Give me a moment."

Sign off with: "- Sarah"`;

let chat: any = null;

export async function getGeminiResponse(
  message: string,
  context: string[] = [],
) {
  try {
    if (!chat) {
      chat = model.startChat({
        history: [{ role: "user", parts: SYSTEM_PROMPT }],
        generationConfig: {
          maxOutputTokens: 250,
          temperature: 0.7,
        },
      });
    }

    // Add recent context
    for (const msg of context.slice(-5)) {
      await chat.sendMessage(msg);
    }

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error getting Gemini response:", error);
    return "I'll need to check on that with our team. Could you please wait a moment? - Sarah";
  }
}
