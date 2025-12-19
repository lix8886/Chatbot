import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const streamGeminiResponse = async (
  prompt: string,
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  modelId: string = 'gemini-3-flash-preview'
): Promise<AsyncGenerator<string, void, unknown>> => {
  try {
    const chat = ai.chats.create({
      model: modelId,
      history: history,
    });

    const result = await chat.sendMessageStream({
      message: prompt,
    });

    // Create a generator to yield text chunks
    async function* generator() {
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
          yield c.text;
        }
      }
    }

    return generator();
  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw error;
  }
};

export const generateChatTitle = async (firstUserMessage: string, modelId: string = 'gemini-3-flash-preview'): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Generate a very short, concise title (max 4-6 words) for a chat that starts with this message: "${firstUserMessage}". Do not use quotes. Return only the title text.`,
    });
    return response.text || "New Chat";
  } catch (error) {
    console.error("Error generating title:", error);
    return "New Chat";
  }
};