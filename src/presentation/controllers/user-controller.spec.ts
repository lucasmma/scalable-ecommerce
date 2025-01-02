import { UserController } from './user-controller';
import { HttpRequest, HttpResponse } from '../protocols';
import { badRequest, ok } from '../helpers/http-helper';
import { BcryptAdapter } from '../../infra/criptography/bcrypt-adapter';
import { JwtAdapter } from '../../infra/auth/jwt-adapter';
import prisma from '../../main/config/prisma';
import { securityEventCounter } from '../../main/config/registry-metrics';

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});


jest.mock('../../infra/criptography/bcrypt-adapter');
jest.mock('../../infra/auth/jwt-adapter');
jest.mock('../../main/config/registry-metrics');

describe('UserController', () => {
  let userController: UserController;
  let bcryptAdapter: jest.Mocked<BcryptAdapter>;
  let jwtAdapter: jest.Mocked<JwtAdapter>;
  let secondaryJwtAdapter: jest.Mocked<JwtAdapter>;
  let userFindUnique = prisma.user.findUnique as jest.Mock;
  let userCreate = prisma.user.create as jest.Mock;
  let userUpdate = prisma.user.update as jest.Mock;

  beforeEach(() => {
    bcryptAdapter = new BcryptAdapter(12) as jest.Mocked<BcryptAdapter>;
    jwtAdapter = new JwtAdapter('secret') as jest.Mocked<JwtAdapter>;
    secondaryJwtAdapter = new JwtAdapter('secret') as jest.Mocked<JwtAdapter>;
    userController = new UserController(bcryptAdapter, jwtAdapter, secondaryJwtAdapter);
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should return bad request if user already exists', async () => {
      const request = {
        body: { email: 'test10@example.com', password: 'password123' },
      } as HttpRequest;

      userFindUnique.mockResolvedValue({ id: 'user1', email: 'test10@example.com' });

      const response = await userController.createUser(request);

      expect(response.statusCode).toEqual(400);
      expect(response.body).toEqual(new Error('User already exists'));
    });

    it('should create a new user and return the user without password', async () => {
      const request = {
        body: { email: 'test10@example.com', password: 'password123' },
      } as HttpRequest;

      const hashedPassword = 'hashedPassword';
      bcryptAdapter.encrypt.mockResolvedValue(hashedPassword);
      userFindUnique.mockResolvedValue(null);
      userCreate.mockResolvedValue({
        id: 'user1',
        email: 'test10@example.com',
        password: hashedPassword,
        role: 'USER',
      });
      jwtAdapter.encode.mockReturnValue('mockToken');
      secondaryJwtAdapter.encode.mockReturnValue('mockRefreshToken');

      const response = await userController.createUser(request);

      expect(response).toEqual(ok({
        id: 'user1',
        email: 'test10@example.com',
        role: 'USER',
        token: 'mockToken',
        refreshToken: 'mockRefreshToken',
      }));
    });
  });

  describe('oauthToken', () => {
    it('should return bad request if credentials are invalid', async () => {
      const request = {
        body: { email: 'test@example.com', password: 'wrongPassword', grantType: 'client_credentials' },
      } as HttpRequest;

      userFindUnique.mockResolvedValue({
        id: 'user1',
        email: 'test@example.com',
        password: 'correctPassword',
      });
      bcryptAdapter.compare.mockResolvedValue(false);

      const response = await userController.oauthToken(request);

      expect(response).toEqual(badRequest(new Error('Invalid credentials')));
    });

    it('should generate token if credentials are valid', async () => {
      const request = {
        body: { email: 'test@example.com', password: 'correctPassword', grantType: 'client_credentials' },
      } as HttpRequest;

      userFindUnique.mockResolvedValue({
        id: 'user1',
        email: 'test@example.com',
        password: 'correctPassword',
      });
      bcryptAdapter.compare.mockResolvedValue(true);
      jwtAdapter.encode.mockReturnValue('mockToken');
      secondaryJwtAdapter.encode.mockReturnValue('mockRefreshToken');

      const response = await userController.oauthToken(request);

      expect(response).toEqual(ok({
        id: 'user1',
        email: 'test@example.com',
        token: 'mockToken',
        refreshToken: 'mockRefreshToken',
      }));
    });

    it('should throws if refresh token is invalid', async () => {
      const request = {
        body: { refreshToken: 'invalidToken', grantType: 'refresh_token' },
      } as HttpRequest;

      secondaryJwtAdapter.validate.mockImplementationOnce(() => {
        return null
      });

      const response = await userController.oauthToken(request);

      expect(response.statusCode).toEqual(400);
      expect(response.body).toEqual(new Error('Invalid refresh token')
      );
    });
  });

  describe('editUser', () => {
    it('should update user details', async () => {
      const request = {
        auth: { user: { id: 'user1' } },
        body: { email: 'updated@example.com' },
      } as HttpRequest;

      const mockUser = {
        email: 'updated@example.com',
      }

      userUpdate.mockResolvedValue(mockUser);

      const response = await userController.editUser(request);

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(mockUser);
    });
  });
});
  
