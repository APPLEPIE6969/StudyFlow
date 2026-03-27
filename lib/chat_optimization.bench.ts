
export interface ChatMessage {
  role: "user" | "ai" | "system";
  content: string;
}

const history: ChatMessage[] = Array.from({ length: 20 }, (_, i) => ({
    role: i % 2 === 0 ? "user" : "ai",
    content: "This is some content for the chat message " + i
}));

const ITERATIONS = 100_000;

function benchmarkRepeatedMapping() {
    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        // Simulating the 4 blocks in generateTutorResponse
        const h1 = history.map(msg => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));
        const h2 = history.map(msg => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));
        const h3 = history.map(h => ({
            role: h.role === "ai" ? "assistant" : "user" as any,
            content: h.content
        }));
        const h4 = history.map(h => ({
            role: h.role === "ai" ? "assistant" : "user" as any,
            content: h.content
        }));

        if (h1.length === 0 || h2.length === 0 || h3.length === 0 || h4.length === 0) { /* prevent optimize */ }
    }
    return performance.now() - start;
}

function benchmarkPrecalculatedMapping() {
    const start = performance.now();
    for (let i = 0; i < ITERATIONS; i++) {
        const geminiHistory = history.map(msg => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }],
        }));
        const groqHistory = history.map(h => ({
            role: h.role === "ai" ? "assistant" : "user" as any,
            content: h.content
        }));

        // Simulating use in 4 blocks
        const h1 = geminiHistory;
        const h2 = geminiHistory;
        const h3 = groqHistory;
        const h4 = groqHistory;

        if (h1.length === 0 || h2.length === 0 || h3.length === 0 || h4.length === 0) { /* prevent optimize */ }
    }
    return performance.now() - start;
}

console.log(`Benchmarking with ${ITERATIONS} iterations and history length ${history.length}...`);

const repeatedTime = benchmarkRepeatedMapping();
console.log(`Repeated mapping: ${repeatedTime.toFixed(2)}ms`);

const precalculatedTime = benchmarkPrecalculatedMapping();
console.log(`Precalculated mapping: ${precalculatedTime.toFixed(2)}ms`);

if (repeatedTime > 0) {
    const improvement = ((repeatedTime - precalculatedTime) / repeatedTime * 100).toFixed(2);
    console.log(`Improvement: ${improvement}%`);
}
