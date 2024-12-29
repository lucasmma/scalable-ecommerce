import { Redis } from 'ioredis';
import { RateLimiterProtocol } from '../../data/protocols/rate-limiter';
import { RateLimiter } from './rate-limiter-adapter'

// Mocking ioredis with promises
jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      ttl: jest.fn(),
      set: jest.fn(),
      incr: jest.fn(),
      expire: jest.fn(),
      del: jest.fn(),
    })),
  };
});

describe('RateLimiter', () => {
  let sut: RateLimiter;
  let redisMock: Redis;
  const key = 'user1';
  const maxRequests = 5;
  const duration = 60; // 1 minute
  const keyWithPrefix = `rate-limiter:${key}`;
  let ttl: jest.Mock
  let incr: jest.Mock

  const makeSut = (): RateLimiter => new RateLimiter(redisMock, maxRequests, duration);

  beforeAll(() => {
    redisMock = new Redis(); // Create a fresh Redis mock instance
    sut = makeSut(); // Create RateLimiter instance
    ttl = redisMock.ttl as jest.Mock; // Mock ttl method
    incr = redisMock.incr as jest.Mock; // Mock incr method
  });

  afterAll(() => {
    jest.clearAllMocks(); // Clear all mocks to prevent state leakage between tests
  });

  describe('isAllowed method', () => {
    test('should return true if key does not exist in Redis', async () => {
      ttl.mockResolvedValueOnce(-2); // Simulating key doesn't exist in Redis

      const result = await sut.isAllowed(key);

      expect(result).toBe(true);
      expect(redisMock.set).toHaveBeenCalledWith(keyWithPrefix, 1, 'EX', duration);
    });

    test('should increment key and return true if within rate limit', async () => {
      ttl.mockResolvedValueOnce(duration); // Simulating key exists and has ttl
      incr.mockResolvedValueOnce(maxRequests - 1); // Simulate incrementing the key to maximum - 1

      const result = await sut.isAllowed(key);

      expect(result).toBe(true);
      expect(incr).toHaveBeenCalledWith(keyWithPrefix);
    });

    test('should return false if rate limit exceeded', async () => {
      ttl.mockResolvedValueOnce(duration); // Simulate key exists with ttl
      incr.mockResolvedValueOnce(maxRequests + 1); // Exceed the max limit (e.g., 6 requests)

      const result = await sut.isAllowed(key);

      expect(result).toBe(false);
      expect(incr).toHaveBeenCalledWith(keyWithPrefix);
    });

    test('should return false if there is an error with Redis', async () => {
      ttl.mockRejectedValue(new Error('Redis Error')); // Simulate an error

      const result = await sut.isAllowed(key);

      expect(result).toBe(false);
    });
  });

  describe('reset method', () => {
    test('should call redis del to reset key', async () => {
      await sut.reset(key);

      expect(redisMock.del).toHaveBeenCalledWith(keyWithPrefix);
    });
  });
});
