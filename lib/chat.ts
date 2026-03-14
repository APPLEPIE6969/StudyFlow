import { TEXT_MODELS, ChatMessage, prepareHistory, genAI, groq } from "./ai";

const SYSTEM_PROMPT_TEMPLATE = `You are a helpful and friendly AI Tutor specializing in {subject}.
Your goal is to help the student learn by explaining concepts clearly, asking guiding questions, and providing examples.
- Be encouraging and patient.
- If the user asks for a solution, guide them towards it rather than just giving the answer.
- Use simple language suitable for a student.
- Keep responses concise but helpful.
- Current Language: {language}`;

export async function generateTutorResponse(
    message: string,
    history: ChatMessage[],
    subject: string,
    language: string = "English"
): Promise<{ text: string; model: string }> {

    const systemPrompt = SYSTEM_PROMPT_TEMPLATE
        .replace("{subject}", subject)
        .replace("{language}", language);

    // Prepare history: filters system messages and removes redundant user message if any
    const validHistory = prepareHistory(history, message);

    // 1. Try Gemini 2.5 Flash (Best balance of speed and smarts)
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemPrompt
        });

        const chat = model.startChat({
            history: validHistory.map(msg => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }],
            })),
        });

        const result = await chat.sendMessage(message);
        const text = result.response.text();
        if (text) return { text, model: "gemini-2.5-flash" };
    } catch (err) {
        console.warn("Gemini 2.5 Flash failed, trying callback:", err);
    }

    // 2. Try Gemini 1.5 Flash (Reliable fallback)
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemPrompt
        });

        const chat = model.startChat({
            history: validHistory.map(msg => ({
                role: msg.role === "user" ? "user" : "model",
                parts: [{ text: msg.content }],
            })),
        });

        const result = await chat.sendMessage(message);
        const text = result.response.text();
        if (text) return { text, model: "gemini-1.5-flash" };
    } catch (err) {
        console.warn("Gemini 1.5 Flash failed, trying Groq:", err);
    }

    // 3. Try Groq (Llama 3.3 70B)
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...validHistory.map(h => ({
                    role: h.role === "ai" ? "assistant" : "user" as any ,// eslint-disable-line @typescript-eslint/no-explicit-any
                    content: h.content
                })),
                { role: "user", content: message }
            ],
            model: TEXT_MODELS.LLAMA_70B.model,
            temperature: 0.7,
        });

        const text = completion.choices[0]?.message?.content;
        if (text) return { text, model: TEXT_MODELS.LLAMA_70B.model };
    } catch (err) {
        console.warn("Groq Llama 70B failed, trying Llama 8B:", err);
    }

    // 4. Try Groq (Llama 3.1 8B - Fast fallback)
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...validHistory.map(h => ({
                    role: h.role === "ai" ? "assistant" : "user" as any ,// eslint-disable-line @typescript-eslint/no-explicit-any
                    content: h.content
                })),
                { role: "user", content: message }
            ],
            model: TEXT_MODELS.LLAMA_8B.model,
        });

        const text = completion.choices[0]?.message?.content;
        if (text) return { text, model: TEXT_MODELS.LLAMA_8B.model };
    } catch (err) {
        console.error("All models failed:", err);
        throw new Error("Unable to connect to any AI tutor. Please try again later.");
    }

    return { text: "I'm having trouble connecting right now. Please try again.", model: "error" };
}
