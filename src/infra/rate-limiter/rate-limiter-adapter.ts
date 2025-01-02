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

  private prefix: string = 'rate-limiter';

  async isAllowed(key: string): Promise<boolean> {
    const keyWithPrefix = `${this.prefix}:${key}`;

    try {
      const ttl = await this.redisClient.ttl(keyWithPrefix);

      if (ttl === -2 || ttl === -1) {
        // Key does not exist or expired, initialize it
        await this.redisClient.set(keyWithPrefix, 1, 'EX', this.duration);
        return true;
      }

      const currentCount = await this.redisClient.incr(keyWithPrefix);

      return currentCount <= this.max;
    } catch (error) {
      return false; // Deny request for safety
    }
  }

  async reset(key: string): Promise<void> {
    const keyWithPrefix = `${this.prefix}:${key}`;
    await this.redisClient.del(keyWithPrefix);
  }
}