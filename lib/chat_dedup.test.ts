import { test, describe } from 'node:test';
import assert from 'node:assert';

// Inline the interface to avoid importing from ai.ts which imports from external packages
export interface ChatMessage {
  role: "user" | "ai" | "system";
  content: string;
}

/**
 * Prepares history by filtering out system messages and removing redundant user messages
 * that match the current query to prevent duplication in LLM prompts.
 * (Copied from lib/ai.ts for isolated testing because of dependency issues in the sandbox)
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

describe('prepareHistory', () => {
  test('should return history unchanged when no match', () => {
    const history: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'ai', content: 'Hi there!' }
    ];
    const message = 'How are you?';
    const result = prepareHistory(history, message);
    assert.deepStrictEqual(result, history);
  });

  test('should filter out system messages', () => {
    const history: ChatMessage[] = [
      { role: 'system', content: 'You are a tutor' },
      { role: 'user', content: 'Hello' }
    ];
    const message = 'How are you?';
    const result = prepareHistory(history, message);
    assert.deepStrictEqual(result, [{ role: 'user', content: 'Hello' }]);
  });

  test('should remove last message if content and role (user) match', () => {
    const history: ChatMessage[] = [
      { role: 'user', content: 'Hello' },
      { role: 'ai', content: 'Hi!' },
      { role: 'user', content: 'What is 2+2?' }
    ];
    const message = 'What is 2+2?';
    const result = prepareHistory(history, message);
    assert.deepStrictEqual(result, [
      { role: 'user', content: 'Hello' },
      { role: 'ai', content: 'Hi!' }
    ]);
  });

  test('should NOT remove last message if content matches but role is ai', () => {
    const history: ChatMessage[] = [
      { role: 'user', content: 'Repeat after me: Hello' },
      { role: 'ai', content: 'Hello' }
    ];
    const message = 'Hello';
    const result = prepareHistory(history, message);
    assert.deepStrictEqual(result, history);
  });

  test('should handle empty history', () => {
    const history: ChatMessage[] = [];
    const message = 'Hello';
    const result = prepareHistory(history, message);
    assert.deepStrictEqual(result, []);
  });

  test('should handle history with only system messages', () => {
    const history: ChatMessage[] = [
      { role: 'system', content: 'System prompt' }
    ];
    const message = 'Hello';
    const result = prepareHistory(history, message);
    assert.deepStrictEqual(result, []);
  });

  test('should remove last user message even if system messages were present (and filtered)', () => {
    const history: ChatMessage[] = [
      { role: 'system', content: 'System' },
      { role: 'user', content: 'Match' }
    ];
    const message = 'Match';
    const result = prepareHistory(history, message);
    assert.deepStrictEqual(result, []);
  });
});
