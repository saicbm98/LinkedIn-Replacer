
import { GoogleGenAI, Type } from "@google/genai";
import { ProfileContent, SOCResult } from '../types';

/**
 * World-class senior frontend engineer implementation following strictly 
 * the @google/genai SDK guidelines.
 */

export const checkSpam = async (message: string): Promise<{ isSpam: boolean; reason?: string }> => {
  try {
    // Initializing GoogleGenAI right before making the call using process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-flash-preview for basic text tasks like spam checking
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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
        },
      },
    });

    // Accessing text property directly (not a method)
    const text = response.text;
    if (!text) return { isSpam: false };

    return JSON.parse(text);
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
    // Initializing GoogleGenAI with process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const profileContext = `
Name: ${profile.name}
Headline: ${profile.headline}
Location: ${profile.location}
Summary: ${profile.aboutLong}

Experience:
${profile.experience.map(exp => `
- ${exp.title} at ${exp.company} (${exp.dates})
  ${exp.description.join(' ')}
`).join('\n')}

Projects:
${profile.projects.map(proj => `
- ${proj.name}: ${proj.description}
  Stack: ${proj.stack.join(', ')}
`).join('\n')}

Skills: ${profile.skills.join(', ')}

Education:
${profile.education.map(edu => `
- ${edu.degree} from ${edu.school} (${edu.dates})
`).join('\n')}

What they're looking for: ${profile.whatLookingFor.join(', ')}
`;

    const systemInstruction = `You are the Profile Q&A Assistant for ${profile.name}.
Your goal is to answer visitor questions using ONLY the provided profile context.

Rules:
1. If the answer is not in the context, say: 'I don't have that information. Please message ${profile.name} directly.'
2. Do not hallucinate dates, companies, or skills not listed in the profile data.
3. Be friendly, professional, and concise (under 3 sentences).
4. Speak in the first person plural ('We' or 'The profile shows...') or third person regarding ${profile.name}.`;

    // Using gemini-3-flash-preview for simple Q&A tasks
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Profile Data:
${profileContext}

Question: ${question}`,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    // Accessing text property directly
    return response.text || "I couldn't generate an answer.";
  } catch (error) {
    console.error("❌ AI Profile Q&A Error:", error);
    return "Temporary error contacting the assistant.";
  }
};

export const evaluateSOC = async (title: string, description: string): Promise<SOCResult | null> => {
  try {
    // Initializing GoogleGenAI with process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Using gemini-3-pro-preview for complex reasoning tasks like SOC classification
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyze the following job title and description to determine the most appropriate Standard Occupational Classification (SOC) 2020 code.

Job Title: ${title}
Job Description: ${description}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: { type: Type.STRING, description: "The 4-digit SOC 2020 code" },
            title: { type: Type.STRING, description: "The official SOC title" },
            confidence: { type: Type.NUMBER, description: "Confidence level between 0-100" },
            reasoning: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "List of reasoning points"
            }
          },
          propertyOrdering: ["code", "title", "confidence", "reasoning"],
        }
      }
    });

    // Accessing text property directly
    const text = response.text;
    if (!text) return null;

    return JSON.parse(text) as SOCResult;
  } catch (error) {
    console.error("❌ SOC Evaluation Error:", error);
    return null;
  }
};