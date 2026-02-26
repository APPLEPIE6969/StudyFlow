import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { rateLimit } from "@/lib/ratelimit";

// Rate limiter for rewards: 20 rewards per hour
const limiter = rateLimit({
  interval: 60 * 60 * 1000, // 1 hour
  uniqueTokenPerInterval: 500,
});

const rewardSchema = z.object({
  action: z.enum(["create_set"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate Limiting
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const token = (session.user?.email || ip) + "_reward";

  if (!limiter.check(20, token)) {
    return NextResponse.json({
      error: "Too many reward requests. Please try again later.",
      xpReward: 0
    }, { status: 429 });
  }

  try {
    const body = await req.json();
    const result = rewardSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { action } = result.data;

    let xpReward = 0;
    if (action === "create_set") {
      xpReward = 30;
    }

    return NextResponse.json({ xpReward });
  } catch (error) {
    console.error("Reward API Error:", error);
    return NextResponse.json({ error: "Failed to process reward" }, { status: 500 });
  }
}
