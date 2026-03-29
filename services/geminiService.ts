
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const geminiService = {
  // Use gemini-3-pro-preview for complex chatbot queries
  askAI: async (message: string, context?: string) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `${context ? `Context: ${context}\n\n` : ''}User Question: ${message}`,
        config: {
          systemInstruction: "You are an AI assistant for the Campus SkillSwap platform. You help students find learning resources, explain complex academic concepts, and provide tips for peer tutoring. Keep answers concise and academic-focused.",
          thinkingConfig: { thinkingBudget: 2000 }
        },
      });
      return response.text;
    } catch (error) {
      console.error("Gemini AI error:", error);
      return "I'm having trouble connecting right now. Please try again later.";
    }
  },

  // Use gemini-3-flash-preview for vision and OCR tasks
  analyzeCertificate: async (base64Data: string, mimeType: string) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          {
            text: "Extract certificate information. Return JSON with: skill_name (primary skill), domain (one word category), level (BEGINNER, INTERMEDIATE, or ADVANCED), issuer (org name), and year (integer).",
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              skill_name: { type: Type.STRING },
              domain: { type: Type.STRING },
              level: { type: Type.STRING },
              issuer: { type: Type.STRING },
              year: { type: Type.INTEGER },
            },
            required: ["skill_name", "domain", "level", "issuer", "year"],
          },
        },
      });
      
      const text = response.text;
      if (!text) throw new Error("No response from AI");
      return JSON.parse(text);
    } catch (error) {
      console.error("OCR/AI Analysis error:", error);
      throw error;
    }
  },

  // Use gemini-3-flash-preview for search-grounded queries
  searchAcademicResources: async (topic: string) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Find high-quality academic learning resources for: ${topic}`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      
      const text = response.text;
      const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      return { text, links };
    } catch (error) {
      console.error("Search Grounding error:", error);
      return { text: "Couldn't find resources at this time.", links: [] };
    }
  },

  // Use gemini-2.5-flash-lite for fast summaries
  summarizeProfile: async (userAbout: string, skills: string[]) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-lite-latest',
        contents: `Summarize this student's profile into a professional one-sentence bio: About: ${userAbout}. Skills: ${skills.join(', ')}`,
      });
      return response.text;
    } catch (error) {
      return "An aspiring learner on Campus SkillSwap.";
    }
  }
};
