export function parseJSONFromAI(text: string): any {
  if (!text || text.trim() === "") {
    throw new SyntaxError("Unexpected end of JSON input");
  }

  // Stage 1: Direct Parse
  try {
    return JSON.parse(text);
  } catch (e) {
    // Stage 2: Markdown block extraction
    const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/g;
    let match;
    while ((match = markdownRegex.exec(text)) !== null) {
      try {
        return JSON.parse(match[1]);
      } catch (e2) {
        // continue trying other code blocks
      }
    }

    // Stage 3: Regex-based structure detection
    const arrayRegex = /\[\s*\{[\s\S]*\}\s*\]/;
    const arrayMatch = text.match(arrayRegex);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch (e3) {
        // ignore
      }
    }

    const objectRegex = /\{[\s\S]*\}/;
    const objectMatch = text.match(objectRegex);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[0]);
      } catch (e4) {
        // ignore
      }
    }

    // Fallback parsing: aggressive cleaning
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanedText);
  }
}

import type { ChatMessage } from "./types.ts";

/**
 * Prepares history by filtering out system messages and removing redundant user messages
 * that match the current query to prevent duplication in LLM prompts.
 */
export function prepareHistory(history: ChatMessage[], message: string): ChatMessage[] {
  let validHistory = history.filter(h => h.role !== 'system');

  if (validHistory.length > 0) {
    const lastMsg = validHistory[validHistory.length - 1];
    if (lastMsg.role === 'user' && lastMsg.content === message) {
      validHistory = validHistory.slice(0, -1);
    }
  }

  return validHistory;
}
