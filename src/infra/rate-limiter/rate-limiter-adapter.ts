import { Redis } from 'ioredis'
import { RateLimiterProtocol } from '../../data/protocols/rate-limiter'


export class RateLimiter implements RateLimiterProtocol {
  private readonly redisClient: Redis;
  private readonly max: number;
  private readonly duration: number;

  constructor(redisClient: Redis, max: number, duration: number) {
    this.redisClient = redisClient;
    this.max = max; // Maximum requests allowed
    this.duration = duration; // Time window in seconds
  }

  async isAllowed(key: string): Promise<boolean> {
    const keyWithPrefix = `rate-limiter:${key}`;

    try {
      const ttl = await this.redisClient.ttl(keyWithPrefix);

      if (ttl === -1 || ttl === -2) {
        // Key does not exist or has no expiration, initialize it
        await this.redisClient.set(keyWithPrefix, 1, 'EX', this.duration);
        return true;
      }

      const currentCount = await this.redisClient.incr(keyWithPrefix);

      // First increamentation of the key, set the expiration
      if (currentCount === 1) {
        await this.redisClient.expire(keyWithPrefix, this.duration);
      }

      return currentCount <= this.max;
    } catch (error) {
      console.error('RateLimiter Error:', error);
      return false; // Deny request for safety
    }
  }

  async reset(key: string): Promise<void> {
    const keyWithPrefix = `rate-limiter:${key}`;
    await this.redisClient.del(keyWithPrefix);
  }
}