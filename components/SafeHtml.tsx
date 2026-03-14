"use client";

import React from "react";
import { parseFormattedText } from "@/lib/format";

interface SafeHtmlProps {
  text: string;
  className?: string;
}

/**
 * A component that safely renders text with basic formatting tags (<bold>).
 * It avoids using dangerouslySetInnerHTML by parsing the text and rendering
 * standard React elements.
 */
export function SafeHtml({ text, className }: SafeHtmlProps) {
  const parts = parseFormattedText(text);

  return (
    <span className={className}>
      {parts.map((part, index) => (
        part.isBold ? (
          <strong key={index} className="font-bold">
            {part.text}
          </strong>
        ) : (
          <React.Fragment key={index}>{part.text}</React.Fragment>
        )
      ))}
    </span>
  );
}
