import { test, describe } from 'node:test';
import assert from 'node:assert';
import { parseJSONFromAI } from './ai-utils.ts';

describe('parseJSONFromAI', () => {
  test('should parse valid JSON without markdown', () => {
    const input = '{"question": "What is 2+2?", "answer": "4"}';
    const result = parseJSONFromAI(input);
    assert.deepStrictEqual(result, { question: "What is 2+2?", answer: "4" });
  });

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

  test('should handle extra whitespace', () => {
    const input = '   {"x": 1}   ';
    const result = parseJSONFromAI(input);
    assert.deepStrictEqual(result, { x: 1 });
  });

  test('should throw on invalid JSON', () => {
    const input = '{"unclosed": "brace"';
    assert.throws(() => parseJSONFromAI(input));
  });

  test('should handle empty input gracefully (or throw if JSON.parse fails)', () => {
     // Current implementation: "".replace(...).trim() -> "" -> JSON.parse("") throws SyntaxError
     assert.throws(() => parseJSONFromAI(""));
  });
});
