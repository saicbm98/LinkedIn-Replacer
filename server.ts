import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON bodies
  app.use(express.json());

  // API Route: answerProfileQuestion
  app.post("/api/chat", async (req, res) => {
    try {
      const { question, profile } = req.body;
      if (!question || !profile) {
        return res.status(400).json({ error: "Missing question or profile" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error("❌ GEMINI_API_KEY is not defined in the environment.");
        return res.status(500).json({ error: "Gemini API key is not configured." });
      }

      const ai = new GoogleGenAI({ apiKey });

      const profileContext = `
CANDIDATE POSITIONING:
${profile.name} is an operations and process improvement professional targeting roles in operations, business analysis, process improvement and digital transformation in New Zealand.

NAME: ${profile.name}
HEADLINE: ${profile.headline}
LOCATION: ${profile.location}
SUMMARY: ${profile.aboutLong}

EXPERIENCE:
${profile.experience.map((exp: any) => `
- ${exp.title} at ${exp.company} (${exp.dates}, ${exp.location})
  ${exp.description.join(' ')}
`).join('\n')}

PROJECTS:
${profile.projects.map((proj: any) => `
- ${proj.name}: ${proj.description}
  Stack: ${proj.stack ? proj.stack.join(', ') : ''}
`).join('\n')}

SKILLS: ${profile.skills.join(', ')}

EDUCATION:
${profile.education.map((edu: any) => `
- ${edu.degree} from ${edu.school} (${edu.dates})
`).join('\n')}

WHAT HE IS LOOKING FOR: ${profile.whatLookingFor.join(', ')}
`;

      const systemInstruction = `You are a profile assistant for ${profile.name}, helping recruiters, hiring managers and founders learn about his background.

Rules:
1. Always refer to ${profile.name} in the third person.
2. Keep answers to 2-3 sentences maximum. Be direct and confident.
3. Be warm and conversational. Match the informal but professional tone common in New Zealand workplaces.
4. Use the full profile context to give specific, well-rounded answers. Reference actual experience, projects or skills where relevant rather than giving vague responses.
5. If the answer is not in the profile data, say: "That information isn't in the profile. You can message ${profile.name} directly to ask."
6. Never invent experience, dates, companies or skills not listed in the profile.
7. Do not use bullet points. Answer in natural, flowing prose.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Profile Data:\n${profileContext}\n\nQuestion: ${question}`,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      res.json({ text: response.text || "I couldn't generate an answer at the moment." });
    } catch (error: any) {
      console.error("❌ API Chat Error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API Route: checkSpam
  app.post("/api/check-spam", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Missing message" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured." });
      }

      const ai = new GoogleGenAI({ apiKey });

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

      const text = response.text;
      if (!text) {
        return res.json({ isSpam: false });
      }

      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("❌ API Spam Check Error:", error);
      res.json({ isSpam: false });
    }
  });

  // API Route: evaluateSOC
  app.post("/api/evaluate-soc", async (req, res) => {
    try {
      const { title, description } = req.body;
      if (!title || !description) {
        return res.status(400).json({ error: "Missing title or description" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured." });
      }

      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
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

      const text = response.text;
      if (!text) {
        return res.status(500).json({ error: "Empty model response" });
      }

      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("❌ API SOC Error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
