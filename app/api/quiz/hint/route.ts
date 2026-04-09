import { NextRequest, NextResponse } from "next/server";
import { explainConcept } from "@/lib/ai";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { rateLimit } from "@/lib/ratelimit";

// Initialize rate limiter: 10 requests per minute
const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds
  uniqueTokenPerInterval: 500,
});

const hintSchema = z.object({
  question: z.string().min(1).max(1000),
  context: z.string().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  // TODO: Revert auth check before submission
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate Limiting
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const token = session?.user?.email || ip;
  const limit = 10;

  if (!limiter.check(limit, token)) {
    return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();

    // Input Validation
    const result = hintSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
    }

    const { question, context } = result.data;

    const explanation = await explainConcept(
      `Hint for question: "${question}".`,
      `Context: The correct answer involves ${context || "general knowledge"}. Don't give the answer directly, just a hint.`
    );

    return NextResponse.json({ hint: explanation });
  } catch (error) {
    console.error("Hint Generation API Error:", error);
    return NextResponse.json({ error: "Failed to generate hint" }, { status: 500 });
  }
}
