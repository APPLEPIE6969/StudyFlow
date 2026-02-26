import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyData } from "@/lib/security";
import { z } from "zod";
import { QuizQuestion } from "@/lib/ai";
import { rateLimit } from "@/lib/ratelimit";
import { LRUCache } from "lru-cache";

// Initialize rate limiter: 10 score submissions per minute
const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

// Replay protection: Store used signatures for 1 hour
// This prevents resubmitting the same quiz completion multiple times
const usedSignatures = new LRUCache({
  max: 1000,
  ttl: 60 * 60 * 1000,
});

const scoreSchema = z.object({
  questions: z.array(z.any()),
  answers: z.record(z.string(), z.string()),
  signature: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate Limiting
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const token = (session.user?.email || ip) + "_score";

  if (!limiter.check(10, token)) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const result = scoreSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
    }

    const { questions, answers, signature } = result.data;

    // 1. Verify signature to ensure questions haven't been tampered with
    const isVerified = signature ? verifyData(questions, signature) : false;

    if (!isVerified) {
      return NextResponse.json({
        error: "Invalid or missing quiz signature. Verification failed.",
        verified: false,
        xpReward: 0
      }, { status: 403 });
    }

    // 2. Replay protection: Check if this signature has already been used
    if (signature && usedSignatures.has(signature)) {
      return NextResponse.json({
        error: "Quiz already submitted. XP cannot be awarded twice.",
        verified: false,
        xpReward: 0
      }, { status: 403 });
    }

    // Mark signature as used
    if (signature) {
      usedSignatures.set(signature, true);
    }

    // 3. Calculate score
    let score = 0;
    const typedQuestions = questions as QuizQuestion[];

    typedQuestions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        score++;
      }
    });

    // 4. Calculate XP Reward: (Correct * 20) + 10 bonus for completion
    const xpReward = (score * 20) + 10;

    return NextResponse.json({
      score,
      totalQuestions: typedQuestions.length,
      xpReward,
      verified: true
    });
  } catch (error) {
    console.error("Scoring API Error:", error);
    return NextResponse.json({ error: "Failed to verify quiz score" }, { status: 500 });
  }
}
