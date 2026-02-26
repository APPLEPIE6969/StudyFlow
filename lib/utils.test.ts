import { describe, it } from 'node:test';
import assert from 'node:assert';
import { cn } from './utils.ts';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    assert.strictEqual(cn('foo', 'bar'), 'foo bar');
  });

  it('handles conditional classes', () => {
    assert.strictEqual(cn('foo', true && 'bar', false && 'baz'), 'foo bar');
  });

  it('handles objects', () => {
    assert.strictEqual(cn({ foo: true, bar: false, baz: true }), 'foo baz');
  });

  it('handles arrays', () => {
    assert.strictEqual(cn(['foo', 'bar']), 'foo bar');
  });

  it('handles nested arrays', () => {
    assert.strictEqual(cn(['foo', ['bar', 'baz']]), 'foo bar baz');
  });

  it('handles falsy values', () => {
    assert.strictEqual(cn('foo', null, undefined, false, 'bar'), 'foo bar');
  });

  it('resolves tailwind conflicts', () => {
    assert.strictEqual(cn('p-4', 'p-2'), 'p-2');
    assert.strictEqual(cn('text-red-500', 'text-blue-500'), 'text-blue-500');
  });

  it('resolves tailwind conflicts with conditions', () => {
      assert.strictEqual(cn('p-4', true && 'p-2'), 'p-2');
      assert.strictEqual(cn('p-4', false && 'p-2'), 'p-4');
  });

  it('handles mixed inputs', () => {
    assert.strictEqual(cn('foo', [ 'bar', { baz: true } ], false, 'qux'), 'foo bar baz qux');
  });
});
