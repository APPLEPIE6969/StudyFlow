import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

// Initialize clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "dummy_key" });

// =============================================================================
// MODEL CATALOG
// =============================================================================

// All available text generation models for quiz generation
export const TEXT_MODELS = {
  // Gemini Models (ordered by capability)
  GEMINI_FLASH_25: { provider: "gemini" as const, model: "gemini-2.5-flash" },
  GEMINI_FLASH_3: { provider: "gemini" as const, model: "gemini-3-flash-preview" },
  GEMINI_FLASH_LITE: { provider: "gemini" as const, model: "gemini-2.5-flash-lite" },
  GEMMA_27B: { provider: "gemini" as const, model: "gemma-3-27b" },
  GEMMA_12B: { provider: "gemini" as const, model: "gemma-3-12b" },
  GEMMA_4B: { provider: "gemini" as const, model: "gemma-3-4b" },
  GEMMA_1B: { provider: "gemini" as const, model: "gemma-3-1b" },

  // Groq Models (ordered by capability)
  GPT_OSS_120B: { provider: "groq" as const, model: "openai/gpt-oss-120b" },
  LLAMA_70B: { provider: "groq" as const, model: "llama-3.3-70b-versatile" },
  QWEN_32B: { provider: "groq" as const, model: "qwen/qwen3-32b" },
  KIMI_K2: { provider: "groq" as const, model: "moonshotai/kimi-k2-instruct-0905" },
  GPT_OSS_20B: { provider: "groq" as const, model: "openai/gpt-oss-20b" },
  LLAMA_4_MAVERICK: { provider: "groq" as const, model: "meta-llama/llama-4-maverick-17b-128e-instruct" },
  LLAMA_4_SCOUT: { provider: "groq" as const, model: "meta-llama/llama-4-scout-17b-16e-instruct" },
  COMPOUND: { provider: "groq" as const, model: "groq/compound" },
  COMPOUND_MINI: { provider: "groq" as const, model: "groq/compound-mini" },
  LLAMA_8B: { provider: "groq" as const, model: "llama-3.1-8b-instant" },
};

// Special purpose models (not for quiz generation)
export const SPECIAL_MODELS = {
  // Image Generation (Gemini)
  IMAGE: "gemini-2.5-flash-image",
  IMAGE_PREVIEW: "gemini-2.5-flash-image-preview",

  // Audio/TTS (Gemini)
  TTS: "gemini-2.5-flash-preview-tts",
  AUDIO: "gemini-2.5-flash-native-audio-preview-05-06",

  // Embeddings (Gemini)
  EMBEDDING: "gemini-embedding-1",

  // Audio (Groq)
  WHISPER_V3: "whisper-large-v3",
  WHISPER_TURBO: "whisper-large-v3-turbo",
  ORPHEUS_TTS: "canopylabs/orpheus-v1-english",
  ORPHEUS_ARABIC: "canopylabs/orpheus-arabic-saudi",

  // Safety (Groq)
  GUARD_12B: "meta-llama/llama-guard-4-12b",
  PROMPT_GUARD_22M: "meta-llama/llama-prompt-guard-2-22m",
  PROMPT_GUARD_86M: "meta-llama/llama-prompt-guard-2-86m",
  SAFEGUARD_20B: "openai/gpt-oss-safeguard-20b",
};

// =============================================================================
// AI MODE CONFIGURATION
// =============================================================================

export type AIMode = "fast" | "balanced" | "smart";

type ModelEntry = { provider: "groq" | "gemini"; model: string };

// Complete fallback chains for each mode (uses ALL text models)
const FALLBACK_CHAINS: Record<AIMode, ModelEntry[]> = {
  // Smart: Start with best Gemini, fall through all models
  smart: [
    TEXT_MODELS.GEMINI_FLASH_25,
    TEXT_MODELS.GEMINI_FLASH_3,
    TEXT_MODELS.GPT_OSS_120B,
    TEXT_MODELS.LLAMA_70B,
    TEXT_MODELS.QWEN_32B,
    TEXT_MODELS.GEMMA_27B,
    TEXT_MODELS.KIMI_K2,
    TEXT_MODELS.GPT_OSS_20B,
    TEXT_MODELS.LLAMA_4_MAVERICK,
    TEXT_MODELS.LLAMA_4_SCOUT,
    TEXT_MODELS.GEMMA_12B,
    TEXT_MODELS.GEMINI_FLASH_LITE,
    TEXT_MODELS.COMPOUND,
    TEXT_MODELS.COMPOUND_MINI,
    TEXT_MODELS.GEMMA_4B,
    TEXT_MODELS.LLAMA_8B,
    TEXT_MODELS.GEMMA_1B,
  ],

  // Balanced: Start with Groq 70B, use most models
  balanced: [
    TEXT_MODELS.LLAMA_70B,
    TEXT_MODELS.QWEN_32B,
    TEXT_MODELS.KIMI_K2,
    TEXT_MODELS.GPT_OSS_20B,
    TEXT_MODELS.LLAMA_4_MAVERICK,
    TEXT_MODELS.LLAMA_4_SCOUT,
    TEXT_MODELS.GEMINI_FLASH_LITE,
    TEXT_MODELS.COMPOUND,
    TEXT_MODELS.COMPOUND_MINI,
    TEXT_MODELS.GEMMA_12B,
    TEXT_MODELS.GEMMA_4B,
    TEXT_MODELS.LLAMA_8B,
    TEXT_MODELS.GEMMA_1B,
  ],

  // Fast: Start with fastest, minimal fallbacks
  fast: [
    TEXT_MODELS.GEMINI_FLASH_LITE,
    TEXT_MODELS.LLAMA_8B,
    TEXT_MODELS.COMPOUND_MINI,
    TEXT_MODELS.GEMMA_4B,
    TEXT_MODELS.GEMMA_1B,
  ],
};

// =============================================================================
// QUIZ GENERATION
// =============================================================================

import type { QuizQuestion } from "./types.ts";
export type { QuizQuestion };

export interface ChatMessage {
  role: "user" | "ai" | "system";
  content: string;
}

export interface QuizGenerationParams {
  topic: string;
  difficulty: string;
  type: string;
  amount: number | "recommended";
  language: string;
  customContent?: string;
}

function buildQuizPrompt(params: QuizGenerationParams): string {
  const questionCount = params.amount === "recommended"
    ? "an appropriate number (between 5-15 based on topic complexity)"
    : params.amount;

  const customContentSection = params.customContent
    ? `\n\nIMPORTANT: Use ONLY the following source material to generate questions. Do not use any external knowledge:\n---\n${params.customContent}\n---\n`
    : "";

  if (params.type === "Flashcards") {
    return `You are an expert tutor. Generate a high-quality, factually accurate set of flashcards about "${params.topic}".${customContentSection}
Difficulty: ${params.difficulty}.
Number of Cards: ${questionCount}.
Language: Generate all terms and definitions in ${params.language}.

CRITICAL INSTRUCTIONS:
1. For each flashcard, provide a "question" which should be the Term, and "correctAnswer" which should be its Definition.
2. Provide 3 plausible but incorrect distractors in the "options" array, plus the correct definition.
3. The "correctAnswer" MUST be exactly identical to one of the strings in the "options" array.
4. Provide a clear, educational "explanation" for why the term and definition are correct.

Output strictly valid JSON in the following format:
[
  {
    "question": "Term here",
    "options": ["Correct Definition", "Distractor 1", "Distractor 2", "Distractor 3"],
    "correctAnswer": "Correct Definition",
    "explanation": "Brief explanation of the term."
  }
]
Do not include markdown code blocks. Just the raw JSON array.`;
  }

  return `You are an expert tutor. Generate a high-quality, factually accurate quiz about "${params.topic}".${customContentSection}
Difficulty: ${params.difficulty}.
Question Type: ${params.type}.
Number of Questions: ${questionCount}.
Language: Generate all questions, options, and explanations in ${params.language}.

CRITICAL INSTRUCTIONS:
1. Ensure all answers are FACTUALLY CORRECT.
2. The "correctAnswer" MUST be exactly identical to one of the strings in the "options" array.
3. Provide a clear, educational explanation for why the answer is correct.

Output strictly valid JSON in the following format:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation of why it is correct."
  }
]
Do not include markdown code blocks. Just the raw JSON array.`;
}

export function parseJSONFromAI(text: string): any {
  const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
  return JSON.parse(cleanedText);
}

async function generateWithGemini(prompt: string, modelName: string): Promise<QuizQuestion[]> {
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return parseJSONFromAI(text);
}

async function generateWithGroq(prompt: string, modelName: string): Promise<QuizQuestion[]> {
  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: modelName,
    temperature: 0.5,
  });

  const text = completion.choices[0]?.message?.content || "[]";
  return parseJSONFromAI(text);
}

/**
 * Generate quiz with comprehensive model fallback chain
 * Tries every model in the chain until one succeeds
 */
export async function generateQuiz(
  mode: AIMode,
  params: QuizGenerationParams
): Promise<{ questions: QuizQuestion[]; usedMode: AIMode; usedModel: string }> {
  const prompt = buildQuizPrompt(params);
  const fallbackChain = FALLBACK_CHAINS[mode];

  let lastError: Error | null = null;

  for (const { provider, model } of fallbackChain) {
    try {
      console.log(`Trying ${provider}/${model}...`);

      let questions: QuizQuestion[];
      if (provider === "gemini") {
        questions = await generateWithGemini(prompt, model);
      } else {
        questions = await generateWithGroq(prompt, model);
      }

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Invalid response: empty or not an array");
      }

      console.log(`Success with ${provider}/${model}`);
      return { questions, usedMode: mode, usedModel: model };
    } catch (error) {
      console.error(`${provider}/${model} failed:`, error instanceof Error ? error.message : String(error));
      lastError = error as Error;
    }
  }

  throw lastError || new Error("All models failed to generate quiz");
}

// =============================================================================
// ADDITIONAL AI FEATURES
// =============================================================================

export async function explainConcept(concept: string, context?: string): Promise<string> {
  const prompt = `Explain the concept of "${concept}" simply and clearly. ${context ? `Context: ${context}` : ""} Use an analogy if possible. Keep it concise.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: TEXT_MODELS.LLAMA_8B.model,
    });
    return completion.choices[0]?.message?.content || "Could not generate explanation.";
  } catch {
    const model = genAI.getGenerativeModel({ model: TEXT_MODELS.GEMINI_FLASH_LITE.model });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const model = genAI.getGenerativeModel({ model: SPECIAL_MODELS.EMBEDDING });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

export async function transcribeAudio(audioBase64: string): Promise<string> {
  const audioBuffer = Buffer.from(audioBase64, "base64");
  const file = new File([audioBuffer], "audio.webm", { type: "audio/webm" });

  const completion = await groq.audio.transcriptions.create({
    file,
    model: SPECIAL_MODELS.WHISPER_TURBO,
  });
  return completion.text;
}

export async function chatWithTutor(message: string, subject: string, history: ChatMessage[]): Promise<string> {
  const systemPrompt = `You are an expert ${subject} tutor. Your goal is to help the user learn by explaining concepts clearly, asking guiding questions, and providing examples.
  - Be encouraging and patient.
  - If the user asks for a solution, guide them towards it rather than just giving the answer.
  - Use simple language suitable for a student.
  - Keep responses concise but helpful.`;

  const messages = [
    { role: "system" as const, content: systemPrompt },
    ...history.map(msg => ({
      role: (msg.role === "ai" ? "assistant" : msg.role) as "system" | "user" | "assistant",
      content: msg.content
    })),
    { role: "user" as const, content: message }
  ];

  try {
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: TEXT_MODELS.LLAMA_70B.model,
      temperature: 0.7,
    });
    return completion.choices[0]?.message?.content || "I'm having trouble thinking of a response right now.";
  } catch (error) {
    console.error("Groq chat failed, falling back:", error instanceof Error ? error.message : String(error));
    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt
      });

      const chat = model.startChat({
        history: history
          .filter(msg => msg.role !== "system")
          .map(msg => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
          })),
      });

      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (geminiError) {
      console.error("Gemini chat failed:", geminiError instanceof Error ? geminiError.message : String(geminiError));
      return "Sorry, I'm unable to connect to my brain right now. Please try again later.";
    }
  }
}