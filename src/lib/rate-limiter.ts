import { Redis } from "@upstash/redis";

import { logger } from "@/lib/logger";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Epoch milliseconds at which the current window resets. */
  resetTime: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

/**
 * In-memory fallback backend. Instance-scoped, so only correct for a single
 * process (local dev, tests, or when Upstash env vars are absent). Production
 * on serverless uses the Redis backend below.
 */
class MemoryBackend {
  private requests = new Map<string, RateLimitEntry>();
  private cleanupInterval: ReturnType<typeof setInterval>;

  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
    this.cleanupInterval.unref?.();
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  hit(key: string, maxRequests: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const entry = this.requests.get(key);

    if (!entry || now > entry.resetTime) {
      const resetTime = now + windowMs;
      this.requests.set(key, { count: 1, resetTime });
      return { allowed: true, remaining: maxRequests - 1, resetTime };
    }

    if (entry.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    entry.count += 1;
    return {
      allowed: true,
      remaining: maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  clear(key: string) {
    this.requests.delete(key);
  }
}

/**
 * Durable, shared backend backed by Upstash Redis. Uses a fixed-window counter:
 * INCR the key, and on the first hit set the window TTL. Safe across serverless
 * instances since all state lives in Redis.
 */
class RedisBackend {
  constructor(private redis: Redis) {}

  async hit(
    key: string,
    maxRequests: number,
    windowMs: number,
  ): Promise<RateLimitResult> {
    const count = await this.redis.incr(key);

    let ttlMs: number;
    if (count === 1) {
      // First request in a new window — arm the expiry.
      await this.redis.pexpire(key, windowMs);
      ttlMs = windowMs;
    } else {
      ttlMs = await this.redis.pttl(key);
      // pttl returns -1 (no expiry) / -2 (missing) in edge cases; re-arm.
      if (ttlMs < 0) {
        await this.redis.pexpire(key, windowMs);
        ttlMs = windowMs;
      }
    }

    const resetTime = Date.now() + ttlMs;
    const allowed = count <= maxRequests;

    return {
      allowed,
      remaining: Math.max(0, maxRequests - count),
      resetTime,
    };
  }

  async clear(key: string) {
    await this.redis.del(key);
  }
}

// Choose a backend once at module load. Upstash is used when both REST env vars
// are present; otherwise we fall back to the in-memory limiter so local dev and
// tests keep working without external infrastructure.
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

type Backend = MemoryBackend | RedisBackend;

let backend: Backend;
if (redisUrl && redisToken) {
  backend = new RedisBackend(new Redis({ url: redisUrl, token: redisToken }));
  logger.info("Rate limiter using durable Upstash Redis backend");
} else {
  backend = new MemoryBackend();
  logger.warn(
    "Rate limiter using in-memory backend — set UPSTASH_REDIS_REST_URL and " +
      "UPSTASH_REDIS_REST_TOKEN for durable, serverless-safe limiting.",
  );
}

export class RateLimiter {
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60 * 1000,
    private prefix: string = "rl",
  ) {}

  private key(identifier: string) {
    return `${this.prefix}:${identifier}`;
  }

  async check(identifier: string): Promise<RateLimitResult> {
    const key = this.key(identifier);
    try {
      return await backend.hit(key, this.maxRequests, this.windowMs);
    } catch (error) {
      // Fail open: a rate-limiter outage must never block legitimate checkout
      // or login traffic. Log so the outage is visible.
      logger.error("Rate limiter backend error — failing open", error, {
        identifier,
      });
      return {
        allowed: true,
        remaining: this.maxRequests,
        resetTime: Date.now() + this.windowMs,
      };
    }
  }

  async reset(identifier: string): Promise<void> {
    try {
      await backend.clear(this.key(identifier));
    } catch (error) {
      logger.error("Rate limiter reset failed", error, { identifier });
    }
  }
}

// Rate limiters for different use cases (thresholds unchanged).
export const checkoutRateLimiter = new RateLimiter(5, 60 * 1000, "rl:checkout"); // 5 / min
export const authRateLimiter = new RateLimiter(10, 15 * 60 * 1000, "rl:auth"); // 10 / 15 min
// Throttles the payment settlement webhook (keyed per intent id) so the settle
// endpoint can't be brute-forced independently of checkout.
export const paymentCallbackRateLimiter = new RateLimiter(20, 60 * 1000, "rl:pay"); // 20 / min
