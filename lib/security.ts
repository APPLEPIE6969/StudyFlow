import crypto from 'node:crypto';

/**
 * Signs data using HMAC-SHA256 with the AUTH_SECRET.
 * This ensures the data hasn't been tampered with when it's returned to the server.
 */
export function signData(data: unknown): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('AUTH_SECRET is not defined in production');
    }
    // Fallback for development only
    return crypto.createHmac('sha256', 'dev-secret').update(JSON.stringify(data)).digest('hex');
  }

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(data));
  return hmac.digest('hex');
}

/**
 * Verifies that the provided signature matches the data.
 * Robust against timing attacks and length mismatches.
 */
export function verifyData(data: unknown, signature: string): boolean {
  if (!signature) return false;

  try {
    const expectedSignature = signData(data);
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    // If anything fails (e.g. invalid hex), return false
    return false;
  }
}
