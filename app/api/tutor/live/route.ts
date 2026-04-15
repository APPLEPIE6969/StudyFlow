import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import { transcribeAudio } from "@/lib/ai";
import { generateTutorResponse } from "@/lib/chat";

// Ensure this runs on the edge or Node, but for file handling Node is often safer with Next.js depending on config.
// Using standard Node runtime for now.
export const runtime = "nodejs";

// Initialize rate limiter: 5 requests per minute for live audio tutoring
const limiter = rateLimit({
    interval: 60 * 1000,
    uniqueTokenPerInterval: 500,
});

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate Limiting
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const token = (session.user?.email || ip) + "_live";
    const limit = 5; // 5 audio requests per minute

    if (!limiter.check(limit, token)) {
        return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
    }

    try {
        const formData = await req.formData();
        const audioFile = formData.get("audio") as Blob;
        const history = formData.get("history") ? JSON.parse(formData.get("history") as string) : [];
        const language = formData.get("language") as string || "English";

        if (!audioFile) {
            return NextResponse.json({ error: "No audio provided" }, { status: 400 });
        }

        // Convert Blob to ArrayBuffer then to Base64
        const arrayBuffer = await audioFile.arrayBuffer();
        const base64Audio = Buffer.from(arrayBuffer).toString("base64");

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

        // 1. Try Native Audio Model
        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-2.5-flash-preview-native-audio-dialog",
            });

            const systemPrompt = `You are a helpful and friendly AI Tutor. 
      You are speaking with a student in ${language}. 
      Keep your responses concise, encouraging, and focused on helping them learn. 
      Do not be too verbose as this is a voice conversation.`;

            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: systemPrompt }],
                    },
                    ...history.map((msg: { role: string, content: string }) => ({
                        role: msg.role === "ai" ? "model" : "user",
                        parts: [{ text: msg.content }],
                    })),
                ],
            });

            const result = await chat.sendMessage([
                {
                    inlineData: {
                        mimeType: audioFile.type || "audio/webm",
                        data: base64Audio,
                    },
                },
            ]);

            const response = await result.response;
            const candidates = response.candidates;
            let text = "";
            let audioData = null;

            if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
                for (const part of candidates[0].content.parts) {
                    if (part.text) {
                        text += part.text;
                    }
                    if (part.inlineData && part.inlineData.mimeType.startsWith("audio/")) {
                        audioData = part.inlineData.data;
                    }
                }
            }

            if (!text && !audioData) {
                text = response.text();
            }

            return NextResponse.json({
                text,
                audio: audioData
            });

        } catch (nativeError) {
            console.warn("Native Audio API failed, falling back to text-to-speech chain:", nativeError);

            // 2. Fallback: Transcribe Audio -> Text Chat -> Return Text (Frontend will use TTS if needed or just show text)
            // For now, we don't have a robust server-side STT + TTS chain ready in this route without importing more libs.
            // But we CAN use the `generateTutorResponse` for the text part if we could transcribe.

            // Since we can't easily transcribe without Whisper (Groq) here (and we want to keep it simple),
            // we might just return an error OR try to transcribe if we import `transcribeAudio` from lib/ai.

            // Let's try to transcribe using Groq (since we have the key) and then chat.
            try {
                // Transcribe
                const transcription = await transcribeAudio(base64Audio);

                if (!transcription) throw new Error("Transcription failed");

                // Chat
                const chatResponse = await generateTutorResponse(
                    transcription,
                    history,
                    "General Tutor", // Default subject for voice
                    language
                );

                return NextResponse.json({
                    text: chatResponse.text,
                    audio: null, // Frontend will handle text-only response (maybe Read Aloud?)
                    model: chatResponse.model + " (fallback)"
                });

            } catch (fallbackError) {
                console.error("Fallback chain failed:", fallbackError);
                return NextResponse.json({
                    error: "Failed to process audio",
                    details: "Both native audio and fallback chains failed."
                }, { status: 500 });
            }
        }

    } catch (error) {
        console.error("Error in live tutor API:", error);
        return NextResponse.json({ error: "Failed to process audio" }, { status: 500 });
    }
}
