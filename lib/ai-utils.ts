// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseJSONFromAI(text: string): any {
  // Stage 1: Direct Parse
  try {
    return JSON.parse(text);
  } catch {
    // Stage 2: Markdown block extraction
    const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
    let match;
    while ((match = markdownRegex.exec(text)) !== null) {
      try {
        return JSON.parse(match[1]);
      } catch {
        // continue trying other code blocks
      }
    }

    // Stage 3: Regex-based structure detection
    const arrayRegex = /\[\s*\{[\s\S]*\}\s*\]/;
    const arrayMatch = text.match(arrayRegex);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch {
        // ignore
      }
    }

    const objectRegex = /\{[\s\S]*\}/;
    const objectMatch = text.match(objectRegex);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch {
        // ignore
      }
    }

    // Fallback parsing: aggressive cleaning
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  }
}
