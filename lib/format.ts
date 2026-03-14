export interface TextPart {
  text: string;
  isBold: boolean;
}

/**
 * Parses a string containing <bold>...</bold> tags into an array of parts.
 * This allows safe rendering in React without dangerouslySetInnerHTML.
 */
export function parseFormattedText(text: string): TextPart[] {
  const parts: TextPart[] = [];
  const regex = /<bold>(.*?)<\/bold>/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({
        text: text.substring(lastIndex, match.index),
        isBold: false,
      });
    }

    // Add the bold part
    parts.push({
      text: match[1],
      isBold: true,
    });

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      isBold: false,
    });
  }

  return parts;
}
