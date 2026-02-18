import { NextRequest, NextResponse } from "next/server";
import { generateTutorResponse } from "@/lib/chat";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Input validation schema
const tutorSchema = z.object({
  query: z.string().min(1),
  subject: z.string().optional(),
  history: z.array(z.object({
    role: z.enum(["user", "ai", "system"]),
    content: z.string()
  })).optional(),
  language: z.string().optional()
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Validate Input
    const result = tutorSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
    }

    const { query, subject, history, language } = result.data;

    // Default language to English if not provided
    const userLanguage = language || "English";

    const response = await generateTutorResponse(
      query,
      history || [],
      subject || "General Knowledge",
      userLanguage
    );

    return NextResponse.json({ explanation: response.text, model: response.model });
  } catch (error) {
    console.error("Explanation API Error:", error);
    return NextResponse.json({ error: "Failed to generate explanation" }, { status: 500 });
  }
}
