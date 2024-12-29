import { CacheAdapter } from './cache-adapter';
import { Redis } from 'ioredis';

jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      set: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      scan: jest.fn(),
      pipeline: jest.fn().mockReturnValue({
        exec: jest.fn(),
        get: jest.fn().mockReturnThis(),
      }),
    })),
  };
});

const makeRedisClient = (): Redis => new Redis();
const prefix = 'test-prefix';

describe('CacheAdapter', () => {
  let sut: CacheAdapter;
  let redisClient: Redis;

  beforeAll(() => {
    const makeSut = (): CacheAdapter => {
      redisClient = makeRedisClient();
      return new CacheAdapter(redisClient, prefix);
    };
    sut = makeSut();
  });

  afterAll(() => {
    jest.clearAllMocks(); // Clear all mock data after all tests
  });

  var testKey = 'test-key';
  describe('set', () => {
    test('Should call redis.set with correct values and duration', async () => {
      await sut.set(testKey, { value: 'test' }, 3600);
      expect(redisClient.set).toHaveBeenCalledWith(
        `${prefix}:${testKey}`,
        JSON.stringify({ value: 'test' }),
        'EX',
        3600
      );
    });

    test('Should call redis.set without duration if not provided', async () => {
      await sut.set(testKey, { value: 'test' });
      expect(redisClient.set).toHaveBeenCalledWith(
        `${prefix}:${testKey}`,
        JSON.stringify({ value: 'test' })
      );
    });
  });

  describe('get', () => {
    test('Should return the parsed value for an existing key', async () => {
      jest.spyOn(redisClient, 'get').mockResolvedValueOnce(JSON.stringify({ value: 'test' }));

      const result = await sut.get(testKey);
      expect(redisClient.get).toHaveBeenCalledWith(`${prefix}:${testKey}`);
      expect(result).toEqual({ value: 'test' });
    });

    test('Should return null if the key does not exist', async () => {
      jest.spyOn(redisClient, 'get').mockResolvedValueOnce(null);

      const result = await sut.get(testKey);
      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    test('Should call redis.del with correct key', async () => {
      await sut.delete(testKey);
      expect(redisClient.del).toHaveBeenCalledWith(`${prefix}:${testKey}`);
    });
  });

  describe('exists', () => {
    test('Should return true if the key exists', async () => {
      jest.spyOn(redisClient, 'exists').mockResolvedValueOnce(1);

      const result = await sut.exists(testKey);
      expect(redisClient.exists).toHaveBeenCalledWith(`${prefix}:${testKey}`);
      expect(result).toBe(true);
    });

    test('Should return false if the key does not exist', async () => {
      jest.spyOn(redisClient, 'exists').mockResolvedValueOnce(0);

      const result = await sut.exists(testKey);
      expect(result).toBe(false);
    });
  });

  describe('getMany', () => {
    test('Should return parsed values for matching keys', async () => {
      jest.spyOn(redisClient, 'scan')
        .mockResolvedValueOnce(['1', [`${prefix}:key1`, `${prefix}:key2`]])
        .mockResolvedValueOnce(['0', []]);

      const pipelineMock = redisClient.pipeline();
      const value1 = { value: 'value1' };
      const value2 = { value: 'value2' };
      jest.spyOn(pipelineMock, 'exec').mockResolvedValueOnce([
        [null, JSON.stringify(value1)],
        [null, JSON.stringify(value2)],
      ]);

      const result = await sut.getMany();
      expect(result).toEqual([
        value1,
        value2,
      ]);
    });

    test('Should return null if no keys match the prefix', async () => {
      jest.spyOn(redisClient, 'scan').mockResolvedValueOnce(['0', []]);

      const result = await sut.getMany();
      expect(result).toBeNull();
    });
  });
});
