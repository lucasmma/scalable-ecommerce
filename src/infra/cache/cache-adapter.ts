import { Redis } from 'ioredis';
import { CacheProtocol } from '../../data/protocols/cache'

export class CacheAdapter implements CacheProtocol {
  private readonly redisClient: Redis;

  constructor(redisClient: Redis) {
    this.redisClient = redisClient;
  }

  async set<T>(key: string, value: T, duration?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);

    if (duration) {
      await this.redisClient.set(key, serializedValue, 'EX', duration);
    } else {
      await this.redisClient.set(key, serializedValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const cachedValue = await this.redisClient.get(key);

    if (!cachedValue) {
      return null;
    }

    return JSON.parse(cachedValue) as T;
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const exists = await this.redisClient.exists(key);
    return exists === 1;
  }
}
