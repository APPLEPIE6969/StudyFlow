import { test, describe } from 'node:test';
import assert from 'node:assert';
import { prepareHistory } from './ai-utils.ts';
import type { ChatMessage } from './types.ts';

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
