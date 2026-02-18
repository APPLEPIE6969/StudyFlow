import { NextRequest, NextResponse } from "next/server";
import { generateQuiz, AIMode, QuizGenerationParams } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { rateLimit } from "@/lib/ratelimit";

// Initialize rate limiter: 5 requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

// Input validation schema
const generateQuizSchema = z.object({
  topic: z.string().min(1).max(200).optional(),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]).optional(),
  type: z.enum(["Multiple Choice", "True / False", "Short Answer", "Mix of All", "Flashcards"]).optional(),
  amount: z.union([z.string(), z.number()]).optional(),
  language: z.string().max(50).optional(),
  mode: z.enum(["fast", "balanced", "smart"]).optional(),
  customContent: z.string().max(10000).optional(), // Limit custom content to 10k chars
  instantFeedback: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate Limiting
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const token = session.user?.email || ip; // Use email if available, else IP
  const limit = 10; // 10 requests per minute

  if (!limiter.check(limit, token)) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();

    // Validate Input
    const result = generateQuizSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
    }

    const {
      topic,
      difficulty,
      type,
      amount,
      language,
      mode,
      customContent,
      instantFeedback
    } = result.data;

    // Validate mode
    const aiMode: AIMode = mode as AIMode || "balanced";

    const params: QuizGenerationParams = {
      topic: topic || "General Knowledge",
      difficulty: difficulty || "Intermediate",
      type: type || "Mixed",
      amount: amount === "recommended" ? "recommended" : (typeof amount === 'string' ? parseInt(amount) : amount) || 5,
      language: language || "English",
      customContent: customContent || undefined,
    };

    // Generate quiz with automatic fallback
    const { questions, usedMode } = await generateQuiz(aiMode, params);

    return NextResponse.json({
      quiz: questions,
      settings: {
        topic,
        difficulty,
        type,
        language,
        instantFeedback: instantFeedback ?? false,
        aiMode: usedMode,
        totalQuestions: questions.length,
      }
    });
  } catch (error) {
    console.error("Quiz Generation API Error:", error);
    return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 });
  }
}
