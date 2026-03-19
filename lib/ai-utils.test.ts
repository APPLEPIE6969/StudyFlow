import { test, describe } from 'node:test';
import assert from 'node:assert';
import { parseJSONFromAI } from './ai-utils.ts';

describe('parseJSONFromAI', () => {
  // Stage 1: Direct Parse
  test('should parse valid JSON without markdown', () => {
    const input = '{"question": "What is 2+2?", "answer": "4"}';
    const result = parseJSONFromAI(input);
    assert.deepStrictEqual(result, { question: "What is 2+2?", answer: "4" });
  });

  test('should handle extra whitespace', () => {
    const input = '   {"x": 1}   ';
    const result = parseJSONFromAI(input);
    assert.deepStrictEqual(result, { x: 1 });
  });

  // Stage 2: Markdown block extraction
  test('should parse JSON wrapped in markdown code block with json language', () => {
    const input = '```json\n{"question": "What is AI?", "answer": "Artificial Intelligence"}\n```';
    const result = parseJSONFromAI(input);
    assert.deepStrictEqual(result, { question: "What is AI?", answer: "Artificial Intelligence" });
  });

  test('should parse JSON wrapped in generic markdown code block', () => {
    const input = '```\n{"key": "value"}\n```';
    const result = parseJSONFromAI(input);
    assert.deepStrictEqual(result, { key: "value" });
  });

  test('should parse the second markdown block if the first one is invalid', () => {
    const input = 'Here is some invalid JSON:\n```json\n{ invalid }\n```\nAnd here is the valid one:\n```json\n{"valid": true}\n```';
    const result = parseJSONFromAI(input);
    assert.deepStrictEqual(result, { valid: true });
  });

  // Stage 3: Regex-based structure detection
  test('should extract a JSON array from conversational text', () => {
    const input = 'Sure, here are the questions: [{"q": "1+1", "a": "2"}] Hope this helps!';
    const result = parseJSONFromAI(input);
    assert.deepStrictEqual(result, [{ q: "1+1", a: "2" }]);
  });

  test('should extract a JSON object from conversational text', () => {
    const input = 'The result is {"score": 10} for your quiz.';
    const result = parseJSONFromAI(input);
    assert.deepStrictEqual(result, { score: 10 });
  });

  // Fallback parsing: aggressive cleaning
  test('should handle unclosed markdown blocks', () => {
    const input = '```json\n{"unclosed": "markdown"';
    // Fallback cleaning: text.replace(/```json/g, "").replace(/```/g, "").trim()
    // Result: '{"unclosed": "markdown"' -> JSON.parse throws
    assert.throws(() => parseJSONFromAI(input));
  });

  test('should handle malformed markdown markers', () => {
    const input = '```json {"cleaned": true} ```';
    const result = parseJSONFromAI(input);
    assert.deepStrictEqual(result, { cleaned: true });
  });

  // Edge Cases
  test('should throw on empty input', () => {
    assert.throws(() => parseJSONFromAI(""), {
      name: 'SyntaxError',
      message: 'Unexpected end of JSON input'
    });
  });

  test('should throw on whitespace-only input', () => {
    assert.throws(() => parseJSONFromAI("   "), {
      name: 'SyntaxError',
      message: 'Unexpected end of JSON input'
    });
  });

  test('should throw on completely invalid input', () => {
    const input = 'This is just some text with no JSON in it.';
    assert.throws(() => parseJSONFromAI(input));
  });
});
