import { test, describe } from "node:test";
import assert from "node:assert";
import { parseFormattedText } from "./format.ts";

describe("parseFormattedText", () => {
  test("should handle plain text", () => {
    const input = "Hello world";
    const result = parseFormattedText(input);
    assert.deepStrictEqual(result, [
      { text: "Hello world", isBold: false }
    ]);
  });

  test("should handle text with bold tags", () => {
    const input = "You've learned for <bold>5 minutes</bold> today.";
    const result = parseFormattedText(input);
    assert.deepStrictEqual(result, [
      { text: "You've learned for ", isBold: false },
      { text: "5 minutes", isBold: true },
      { text: " today.", isBold: false }
    ]);
  });

  test("should handle multiple bold tags", () => {
    const input = "<bold>Hello</bold> <bold>World</bold>";
    const result = parseFormattedText(input);
    assert.deepStrictEqual(result, [
      { text: "Hello", isBold: true },
      { text: " ", isBold: false },
      { text: "World", isBold: true }
    ]);
  });

  test("should handle bold tag at the end", () => {
    const input = "Total: <bold>100</bold>";
    const result = parseFormattedText(input);
    assert.deepStrictEqual(result, [
      { text: "Total: ", isBold: false },
      { text: "100", isBold: true }
    ]);
  });

  test("should handle bold tag at the start", () => {
    const input = "<bold>Warning:</bold> high priority";
    const result = parseFormattedText(input);
    assert.deepStrictEqual(result, [
      { text: "Warning:", isBold: true },
      { text: " high priority", isBold: false }
    ]);
  });

  test("should treat other tags as plain text", () => {
    const input = "Hello <script>alert(1)</script> <bold>world</bold>";
    const result = parseFormattedText(input);
    assert.deepStrictEqual(result, [
      { text: "Hello <script>alert(1)</script> ", isBold: false },
      { text: "world", isBold: true }
    ]);
  });

  test("should handle nested-like tags by treating inner as text", () => {
    const input = "<bold>outer <bold>inner</bold></bold>";
    // Based on the regex /<bold>(.*?)<\/bold>/g
    // It will match <bold>outer <bold>inner</bold>
    // Note: Non-greedy (.*?) will stop at the first </bold>
    const result = parseFormattedText(input);
    assert.deepStrictEqual(result, [
      { text: "outer <bold>inner", isBold: true },
      { text: "</bold>", isBold: false }
    ]);
  });
});
