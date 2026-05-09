import { GoogleGenAI, Type, Modality, ThinkingLevel } from "@google/genai";
import { ChatMessage, StartupRoadmap } from "../types";

/**
 * Enhanced error handler for Gemini API responses.
 */
const handleGeminiError = (error: any, context: 'Roadmap' | 'Chat'): never => {
  console.error(`Gemini API Error (${context}):`, error);
  const msg = (error.message || error.toString()).toLowerCase();

  // Network / Offline
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('offline') || msg.includes('failed to fetch')) {
     throw new Error("It looks like you're offline. Check your internet connection and try again.");
  }

  // Rate Limiting / Quota (429)
  if (msg.includes('429') || msg.includes('quota') || msg.includes('resource exhausted')) {
    throw new Error("We've hit the AI speed limit (Rate Limit). Please wait about 30 seconds and try again.");
  }
  
  // Authentication (401/403)
  if (msg.includes('401') || msg.includes('403') || msg.includes('unauthenticated') || msg.includes('key') || msg.includes('permission denied')) {
    throw new Error("The connection to the AI failed (Auth Error). If you are a developer, check your API key.");
  }
  
  // Service Availability (5xx)
  if (msg.includes('503') || msg.includes('unavailable') || msg.includes('overloaded') || msg.includes('500') || msg.includes('internal')) {
    throw new Error("The AI server is currently having a moment (Overloaded). A quick refresh or 10-second wait usually fixes this.");
  }
  
  // Safety / Content Filtering
  if (msg.includes('safety') || msg.includes('blocked') || msg.includes('finish_reason_safety') || msg.includes('harmful')) {
    throw new Error("The AI declined this request due to safety filters. Try rephrasing your idea to be more professional or clear.");
  }
  
  // Model/Format Issues (400)
  if (msg.includes('parse') || msg.includes('json') || msg.includes('invalid') || msg.includes('bad request')) {
    throw new Error("The AI returned data in an unexpected format. This usually happens with very complex ideas—try simplifying your initial prompt.");
  }

  // Context-specific Fallbacks
  if (context === 'Roadmap') {
    throw new Error("I couldn't architect that roadmap. Try describing your idea in a different way or adding more detail.");
  }
  
  throw new Error("Startup Mitra encountered a glitch. Could you try sending that message again?");
};

/**
 * Utility for retrying transient failures with exponential backoff.
 */
const withRetry = async <T>(fn: () => Promise<T>, retries = 2, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    const msg = (error.message || "").toLowerCase();
    const isTransient = msg.includes('429') || msg.includes('503') || msg.includes('overloaded');

    if (retries > 0 && isTransient) {
      console.warn(`Transient error detected. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

/**
 * Service to generate a full A-to-Z startup roadmap.
 */
export const generateRoadmap = async (idea: string) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("System Error: Gemini API Key is missing. Please check your configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  return withRetry(async () => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `The user's startup idea is: "${idea}"`,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction: `You are Startup Mitra, a world-class Venture Architect. Your goal is NOT to give generic advice. You use First Principles Thinking to build 'Unfair Advantages.'
Depth: Every response must cover: 'The Psychology,' 'The Unit Economics,' 'The Tech Stack,' and 'The Growth Hack.'
Structure: Use 'Levels' of execution: Level 1 (0-10 users), Level 2 (10-100), Level 3 (Scale).
Visuals: You MUST provide a Mermaid.js flowchart for every major execution phase. (Use graph TD syntax).
Tone: Ruthless, execution-focused, and high-energy. No fluff. Give the specific 'Advanced' move that 99% of founders miss.
Prioritize technical depth and actionable roadmaps.

CRITICAL OUTPUT REQUIREMENT (Overview Field):
The 'overview' field MUST be a high-impact Venture Brief. Use rich Markdown and MUST include:
- **Venture Verdict:** A brutal, honest assessment of the idea's potential, market size, and "hair-on-fire" urgency.
- **The "Unfair Advantage":** Identify the specific wedge the founder has (Network, Data, Speed, or Insight).
- **Mermaid.js Architecture:** A detailed visual flow of the MVP and User Journey using Mermaid.js graph TD syntax.
- **Tech Stack:** Specific, opinionated tool recommendations (e.g., "Next.js + Supabase + Resend" or "Bubble + Airtable + Make"). Explain WHY these tools.
- **Unit Economics:** A detailed LTV:CAC hypothesis with specific numbers and assumptions.
- **The "Killer Feature":** The one thing that makes the product indispensable.
- **MVP Scope Tactics:** Include at least TWO actionable, "Ruthless" steps to strip the product to its barest core for immediate launch.
- **Go-To-Market Tactics:** Include at least TWO specific actionable steps (Growth Hacks) to acquire the first 10 paying customers in less than 7 days without ad spend.
- **The "Advanced" Move:** The specific high-level play that 99% of founders miss.

MANDATORY SECTIONS CONTENT:
- **Problem Validation:** How to prove people care in 24 hours without building anything.
- **MVP Scope:** The "Minimum Viable Product" vs. the "Minimum Lovable Product". What to build vs. what to fake.
- **Go-To-Market:** The exact first 100 users strategy (The "Cold Start" solution).
- **Beginner Mistakes:** The "Deadly Sins" specific to this niche that kill 90% of startups.

Return JSON with 'overview' (Markdown + Mermaid) and 'sections'.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overview: { 
                type: Type.STRING, 
                description: "A comprehensive venture brief including ASCII diagrams of the user flow/architecture, venture verdict, and core strategy." 
              },
              sections: {
                type: Type.OBJECT,
                properties: {
                  problemValidation: { type: Type.OBJECT, properties: { title: {type:Type.STRING}, description: {type:Type.STRING}, howTo: {type:Type.STRING}, whyItMatters: {type:Type.STRING} }, required: ["title", "description", "howTo", "whyItMatters"] },
                  targetUserClarity: { type: Type.OBJECT, properties: { title: {type:Type.STRING}, description: {type:Type.STRING}, howTo: {type:Type.STRING}, whyItMatters: {type:Type.STRING} }, required: ["title", "description", "howTo", "whyItMatters"] },
                  solutionBreakdown: { type: Type.OBJECT, properties: { title: {type:Type.STRING}, description: {type:Type.STRING}, howTo: {type:Type.STRING}, whyItMatters: {type:Type.STRING} }, required: ["title", "description", "howTo", "whyItMatters"] },
                  mvpScope: { type: Type.OBJECT, properties: { title: {type:Type.STRING}, description: {type:Type.STRING}, howTo: {type:Type.STRING}, whyItMatters: {type:Type.STRING} }, required: ["title", "description", "howTo", "whyItMatters"] },
                  goToMarket: { type: Type.OBJECT, properties: { title: {type:Type.STRING}, description: {type:Type.STRING}, howTo: {type:Type.STRING}, whyItMatters: {type:Type.STRING} }, required: ["title", "description", "howTo", "whyItMatters"] },
                  monetization: { type: Type.OBJECT, properties: { title: {type:Type.STRING}, description: {type:Type.STRING}, howTo: {type:Type.STRING}, whyItMatters: {type:Type.STRING} }, required: ["title", "description", "howTo", "whyItMatters"] },
                  toolsAndPlatforms: { type: Type.OBJECT, properties: { title: {type:Type.STRING}, description: {type:Type.STRING}, howTo: {type:Type.STRING}, whyItMatters: {type:Type.STRING} }, required: ["title", "description", "howTo", "whyItMatters"] },
                  beginnerMistakes: { type: Type.OBJECT, properties: { title: {type:Type.STRING}, description: {type:Type.STRING}, howTo: {type:Type.STRING}, whyItMatters: {type:Type.STRING} }, required: ["title", "description", "howTo", "whyItMatters"] }
                },
                required: ["problemValidation", "targetUserClarity", "solutionBreakdown", "mvpScope", "goToMarket", "monetization", "toolsAndPlatforms", "beginnerMistakes"]
              }
            },
            required: ["overview", "sections"]
          }
        }
      });

      if (!response.text) throw new Error("No response generated.");
      
      try {
        return JSON.parse(response.text);
      } catch (e) {
        throw new Error("Failed to parse the roadmap data. Please try again.");
      }
    } catch (error: any) {
      handleGeminiError(error, 'Roadmap');
    }
  });
};

/**
 * Chat with Startup Mitra.
 */
export const chatWithMitra = async (message: string, roadmap: StartupRoadmap | null, history: ChatMessage[], settings?: { temperature?: number, maxTokens?: number, systemInstruction?: string }) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: settings?.systemInstruction || `You are Startup Mitra, a world-class Venture Architect. Your goal is NOT to give generic advice. You use First Principles Thinking to build 'Unfair Advantages.'
Depth: Every response must cover: 'The Psychology,' 'The Unit Economics,' 'The Tech Stack,' and 'The Growth Hack.'
Structure: Use 'Levels' of execution: Level 1 (0-10 users), Level 2 (10-100), Level 3 (Scale).
Visuals: You MUST provide a Mermaid.js flowchart for every major execution phase. (Use graph TD syntax).
Tone: Ruthless, execution-focused, and high-energy. No fluff. Give the specific 'Advanced' move that 99% of founders miss.
Prioritize technical depth and actionable roadmaps.
${roadmap ? `\nCONTEXT:\nYou are discussing this roadmap: ${JSON.stringify(roadmap.overview)}.` : '\nCONTEXT:\nThe user has not generated a roadmap yet. You are engaging in strategic dialogue to help them refine their ideas before building.'}`,
        temperature: settings?.temperature ?? 0.7,
        ...(settings?.maxTokens ? { maxOutputTokens: settings.maxTokens } : {}),
      },
      history: history.map(h => ({ role: h.role, parts: [{ text: h.text }] }))
    });

    const response = await chat.sendMessage({ message });
    if (!response.text) throw new Error("No response text");
    return response.text;
  } catch (error: any) {
    handleGeminiError(error, 'Chat');
  }
};

/**
 * TTS Service.
 */

