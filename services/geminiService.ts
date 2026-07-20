import { ProfileContent, SOCResult } from '../types';

/**
 * Client-side proxy service calling the secure, server-side Gemini API endpoints.
 */

export const checkSpam = async (message: string): Promise<{ isSpam: boolean; reason?: string }> => {
  try {
    const res = await fetch("/api/check-spam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("❌ AI Spam Check Error:", error);
    return { isSpam: false };
  }
};

export const answerProfileQuestion = async (
  question: string, 
  profile: ProfileContent
): Promise<string> => {
  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, profile }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      if (res.status === 500 && (errData.error?.includes("apiKey") || errData.error?.includes("key"))) {
        return "The AI assistant is currently unavailable (API key issue). Please check the environment configuration.";
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data.text || "I couldn't generate an answer at the moment.";
  } catch (error) {
    console.error("❌ AI Profile Q&A Error:", error);
    return "I'm having a temporary connection issue. Please try again in a few seconds.";
  }
};

export const evaluateSOC = async (title: string, description: string): Promise<SOCResult | null> => {
  try {
    const res = await fetch("/api/evaluate-soc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json() as SOCResult;
  } catch (error) {
    console.error("❌ SOC Evaluation Error:", error);
    return null;
  }
};
