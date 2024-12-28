import { Redis } from 'ioredis';
import { CacheProtocol } from '../../data/protocols/cache'

export class CacheAdapter implements CacheProtocol {
  constructor(private readonly redisClient: Redis, private readonly prefix: string) {
    this.redisClient = redisClient;
    this.prefix = prefix;
  }

  async set<T>(key: string, value: T, duration?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);

    if (duration) {
      await this.redisClient.set(this.prefix + ':' + key, serializedValue, 'EX', duration);
    } else {
      await this.redisClient.set(this.prefix + ':' + key, serializedValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const cachedValue = await this.redisClient.get(this.prefix + ':' + key);

    if (!cachedValue) {
      return null;
    }

    return JSON.parse(cachedValue) as T;
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(this.prefix + ':' + key);
  }

  async exists(key: string): Promise<boolean> {
    const exists = await this.redisClient.exists(this.prefix + ':' + key);
    return exists === 1;
  }

  async getMany<T>(): Promise<T[] | null> {
    const keys: string[] = [];
    let cursor = '0'; // Start cursor for SCAN
    let result: [error: Error | null, result: unknown][] = []; 
  
    // Step 1: Use SCAN to get all keys matching the prefix
    do {
      const scanResult = await this.redisClient.scan(cursor, 'MATCH', `${this.prefix}*`);
      cursor = scanResult[0]; // Update cursor
      keys.push(...scanResult[1]); // Add matching keys to the list
    } while (cursor !== '0'); // Continue until the cursor is back to 0 (end of scan)
  
    if (keys.length === 0) {
      return null; // No matching keys found
    }
  
    // Use pipelining to fetch all values for the found keys in better performance
    const pipeline = this.redisClient.pipeline();
    keys.forEach((key) => {
      pipeline.get(key); // Add GET command for each key
    });
  
    // Execute the pipeline
    result = (await pipeline.exec()) || [];
  
    return result.map(([_, value]) => {
      if (value === null) {
        return null; // Return null if the key doesn't exist
      }
      try {
        return JSON.parse(value as string) as T; // Parse the cached value
      } catch (error) {
        console.error(`Error parsing value for key: ${value}`);
        return null;
      }
    }).filter((value) => value !== null) as T[];
  }
  
}
