import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { JwtProtocol } from '../../data/protocols/jwt';
import { JwtAdapter } from './jwt-adapter';

const mockUser: Omit<User, 'password'> = {
  id: '13129039120',
  documentNumber: '123456789',
  role: 'USER',
  name: 'John Doe',
  email: 'john.doe@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
};

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'valid_token'),
  verify: jest.fn(() => mockUser),
  decode: jest.fn(() => mockUser),
}));

const secret = 'test-secret';

describe('JwtAdapter', () => {
  let sut: JwtProtocol;

  beforeEach(() => {
    sut = new JwtAdapter(secret);
    jest.clearAllMocks(); // Reset mocks before each test
  });

  describe('encode', () => {
    test('Should call jwt.sign with correct values', () => {
      const signSpy = jest.spyOn(jwt, 'sign');
      sut.encode(mockUser, '8h');
      expect(signSpy).toHaveBeenCalledWith(mockUser, secret, { expiresIn: '8h' });
    });

    test('Should return a valid token', () => {
      const token = sut.encode(mockUser, '8h');
      expect(token).toBe('valid_token');
    });
  });

  describe('validate', () => {
    test('Should call jwt.verify with correct values', () => {
      const verifySpy = jest.spyOn(jwt, 'verify');
      sut.validate('valid_token');
      expect(verifySpy).toHaveBeenCalledWith('valid_token', secret);
    });

    test('Should return the decoded payload on success', () => {
      const payload = sut.validate('valid_token');
      expect(payload).toEqual(mockUser);
    });

    test('Should return null if jwt.verify fails', () => {
      jest.spyOn(jwt, 'verify').mockImplementationOnce((token) => {
        throw new Error(); // Simulate failure
      });
    
      const result = sut.validate('invalid_token');
      expect(result).toBeNull();
    });
  });

  describe('decode', () => {
    test('Should call jwt.decode with correct values', () => {
      const decodeSpy = jest.spyOn(jwt, 'decode');
      sut.decode('any_token');
      expect(decodeSpy).toHaveBeenCalledWith('any_token');
    });

    test('Should return the decoded payload', () => {
      const payload = sut.decode('any_token');
      expect(payload).toEqual(mockUser);
    });
  });
});
