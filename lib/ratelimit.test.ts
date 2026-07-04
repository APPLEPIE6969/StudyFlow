import { test, describe } from "node:test";
import assert from "node:assert";
import { rateLimit } from "./ratelimit.ts";

describe("rateLimit", () => {
    test("should allow requests under the limit", () => {
        const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 10 });
        const limit = 5;
        const token = "user1";

        for (let i = 0; i < limit; i++) {
            assert.strictEqual(limiter.check(limit, token), true, `Request ${i + 1} should be allowed`);
        }
    });

    test("should block requests over the limit for a single token", () => {
        const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 10 });
        const limit = 3;
        const token = "user1";

        assert.strictEqual(limiter.check(limit, token), true);
        assert.strictEqual(limiter.check(limit, token), true);
        assert.strictEqual(limiter.check(limit, token), true);
        assert.strictEqual(limiter.check(limit, token), false, "Request 4 should be blocked");
    });

    test("should maintain separate limits for different tokens", () => {
        const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 10 });
        const limit = 2;

        assert.strictEqual(limiter.check(limit, "user1"), true);
        assert.strictEqual(limiter.check(limit, "user1"), true);
        assert.strictEqual(limiter.check(limit, "user1"), false);

        assert.strictEqual(limiter.check(limit, "user2"), true, "user2 should still have requests left");
        assert.strictEqual(limiter.check(limit, "user2"), true);
        assert.strictEqual(limiter.check(limit, "user2"), false);
    });

    test("should reset the limit after the interval", async (_t) => {
        // Use real timers for lru-cache expiry, as mocking Date might not be enough for its internal tracking
        // or just wait sufficiently if the interval is short.
        const interval = 50;
        const limiter = rateLimit({ interval, uniqueTokenPerInterval: 10 });
        const limit = 1;
        const token = "user1";

        assert.strictEqual(limiter.check(limit, token), true);
        assert.strictEqual(limiter.check(limit, token), false);

        // Wait for interval to pass
        await new Promise(resolve => setTimeout(resolve, interval + 20));

        assert.strictEqual(limiter.check(limit, token), true, "Limit should be reset after interval");
    });

    test("should respect uniqueTokenPerInterval by evicting old tokens when the cache is full", () => {
        const limiter = rateLimit({ interval: 60000, uniqueTokenPerInterval: 2 });
        const limit = 1;

        assert.strictEqual(limiter.check(limit, "user1"), true);
        assert.strictEqual(limiter.check(limit, "user2"), true);

        // This should evict user1 because max size is 2
        assert.strictEqual(limiter.check(limit, "user3"), true);

        // user1 should be "new" again and allowed if we call it
        // Wait, if it was evicted, it should be allowed again (reset)
        assert.strictEqual(limiter.check(limit, "user1"), true, "user1 should be allowed again as it was evicted and thus reset");
    });
});
