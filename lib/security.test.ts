import { describe, it } from 'node:test';
import assert from 'node:assert';
import { signData, verifyData } from './security.ts';

describe('security lib', () => {
  const testData = { id: 123, score: 100 };

  describe('signData', () => {
    it('should return a 64-character hex string (SHA256)', () => {
      const signature = signData(testData);
      assert.strictEqual(typeof signature, 'string');
      assert.strictEqual(signature.length, 64);
      assert.match(signature, /^[0-9a-f]{64}$/);
    });

    it('should produce different signatures for different data', () => {
      const sig1 = signData({ a: 1 });
      const sig2 = signData({ a: 2 });
      assert.notStrictEqual(sig1, sig2);
    });
  });

  describe('verifyData', () => {
    it('should return true for valid data and signature', () => {
      const signature = signData(testData);
      const isValid = verifyData(testData, signature);
      assert.strictEqual(isValid, true);
    });

    it('should return false for invalid signature', () => {
      const signature = signData(testData);
      const invalidSignature = signature.replace(/^./, signature[0] === 'a' ? 'b' : 'a');
      const isValid = verifyData(testData, invalidSignature);
      assert.strictEqual(isValid, false);
    });

    it('should return false for invalid data', () => {
      const signature = signData(testData);
      const isValid = verifyData({ ...testData, score: 99 }, signature);
      assert.strictEqual(isValid, false);
    });

    it('should return false for empty signature', () => {
      const isValid = verifyData(testData, '');
      assert.strictEqual(isValid, false);
    });

    it('should return false for signature of wrong length', () => {
      const isValid = verifyData(testData, 'abc');
      assert.strictEqual(isValid, false);
    });

    it('should handle invalid hex characters in signature gracefully', () => {
      // Buffer.from might not throw, but we want to ensure verifyData returns false
      const invalidHex = 'g'.repeat(64);
      const isValid = verifyData(testData, invalidHex);
      assert.strictEqual(isValid, false);
    });

    it('should handle malformed signatures that might cause errors in Buffer.from', () => {
      // Some versions of Buffer.from might behave differently with certain inputs
      // We specifically want to test the catch block in security.ts

      // Passing something that isn't a string might trigger an error if not handled
      // although verifyData expects a string type.
      // @ts-expect-error Types may be incomplete or global variables need mocking
      const isValid = verifyData(testData, { not: 'a string' });
      assert.strictEqual(isValid, false);
    });
  });
});
