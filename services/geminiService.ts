import { GoogleGenAI, Type } from "@google/genai";
import { ProfileContent, SOCResult } from '../types';

const getAI = () => {
    // The API key is obtained exclusively from the environment variable.
    // Ensure strict adherence to security guidelines by not hardcoding keys.
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
        console.warn("Gemini API Key not found in environment variables. AI features are disabled.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const checkSpam = async (message: string): Promise<{ isSpam: boolean; reason?: string }> => {
  const ai = getAI();
  if (!ai) return { isSpam: false };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following message for spam, abuse, or malicious intent. 
      Message: "${message}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isSpam: { type: Type.BOOLEAN },
            reason: { type: Type.STRING },
          },
          required: ["isSpam"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return result;
  } catch (error) {
    console.error("AI Spam Check Error:", error);
    return { isSpam: false };
  }
};

export const answerProfileQuestion = async (
  question: string, 
  profile: ProfileContent
): Promise<string> => {
  const ai = getAI();
  if (!ai) return "System: AI capabilities are currently unavailable because the API Key is missing from the environment configuration.";

  try {
    const profileContext = JSON.stringify(profile);
    const systemInstruction = `You are the Profile Q&A Assistant for ${profile.name}.
    Your goal is to answer visitor questions using ONLY the provided profile context.
    Context includes: Experience, Projects, Education, and Skills.
    
    Rules:
    1. If the answer is not in the context, say: 'I don't have that information. Please message ${profile.name} directly.'
    2. Do not hallucinate dates, companies, or skills not listed in the profile data.
    3. Be friendly, professional, and concise (under 3 sentences).
    4. Speak in the first person plural ('We' or 'The profile shows...') or third person regarding ${profile.name}.
    
    Profile Data: ${profileContext}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: question,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I couldn't generate an answer.";
  } catch (error) {
    console.error("AI Profile Q&A Error:", error);
    return "Temporary error contacting the assistant.";
  }
};

export const evaluateSOC = async (title: string, description: string): Promise<SOCResult | null> => {
  const ai = getAI();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Evaluate the following job for a Standard Occupational Classification (SOC) 2020 code.
      Job Title: ${title}
      Description: ${description}
      
      Return the best fit code, official title, confidence score (0-100), and a list of reasoning bullet points.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING },
            title: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
            reasoning: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
          },
          required: ["code", "title", "confidence", "reasoning"],
        },
      },
    });

    return JSON.parse(response.text || 'null') as SOCResult;
  } catch (error) {
    console.error("SOC Eval Error:", error);
    return null;
  }
};