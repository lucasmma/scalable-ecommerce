import bcrypt from 'bcrypt';
import { BcryptAdapter } from './bcrypt-adapter';
import { EncrypterProtocol } from '../../data/protocols/encrypter';

// Mock bcrypt methods with appropriate return types
jest.mock('bcrypt', () => ({
  hash: jest.fn<string, [string, number]>(),  // mock `hash` method with correct types
  compare: jest.fn<boolean, [string, string]>(),  // mock `compare` method with correct types
}));

const salt = 12;
const makeSut = (): BcryptAdapter => {
  return new BcryptAdapter(salt);
};

describe('BcryptAdapter', () => {
  let sut: BcryptAdapter;

  beforeAll(() => {
    sut = makeSut();
  });

  afterAll(() => {
    jest.clearAllMocks(); // Clear all mock data after all tests
  });

  const value = 'any_value';
  const hash = 'hashed_value';

  describe('encrypt', () => {
    test('Should call bcrypt.hash with correct values', async () => {
      // Explicitly mock the resolved value of hash
      (bcrypt.hash as jest.Mock).mockResolvedValue(hash);

      await sut.encrypt(value);
      expect(bcrypt.hash).toHaveBeenCalledWith(value, salt);
    });

    test('Should return a hash on success', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue(hash);

      const result = await sut.encrypt('any_value');
      expect(result).toBe(hash);
    });
  });

  describe('compare', () => {
    test('Should call bcrypt.compare with correct values', async () => {
      // Explicitly mock the resolved value of compare
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      
      await sut.compare(value, hash);
      expect(bcrypt.compare).toHaveBeenCalledWith(value, hash);
    });

    test('Should return true if comparison is successful', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await sut.compare(value, hash);
      expect(result).toBe(true);
    });

    test('Should return false if comparison fails', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await sut.compare(value, hash);
      expect(result).toBe(false);
    });
  });
});
