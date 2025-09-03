import { LoginUseCase } from './login.usecase';
import { JwtService } from '@nestjs/jwt';
import { EnvService } from '../../../config/env/env.service';
import { UserRepository } from '../../user/user.repository';
import { HTTP_EXCEPTIONS } from '../../../commons/contants/http-errors.contants';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('LoginUseCase', () => {
  let sut: LoginUseCase;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign'>>;
  let envService: Pick<
    EnvService,
    | 'jwtSecret'
    | 'jwtAccessExpiration'
    | 'jwtRefreshSecret'
    | 'jwtRefreshExpiration'
  >;
  let userRepository: jest.Mocked<Pick<UserRepository, 'findByEmail'>>;

  beforeEach(() => {
    jwtService = {
      sign: jest.fn(),
    };

    envService = {
      jwtSecret: 'access-secret',
      jwtAccessExpiration: '15m',
      jwtRefreshSecret: 'refresh-secret',
      jwtRefreshExpiration: '7d',
    } as any;

    userRepository = {
      findByEmail: jest.fn(),
    } as any;

    sut = new LoginUseCase(
      jwtService as unknown as JwtService,
      envService as EnvService,
      userRepository as unknown as UserRepository,
    );

    jest.clearAllMocks();
  });

  it('should return accessToken and refreshToken when credentials are valid', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'alice@example.com',
      password: 'hashed-password',
      createdAt: new Date(),
      deletedAt: null,
      updatedAt: new Date(),
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    (jwtService.sign as jest.Mock)
      .mockReturnValueOnce('access.token')
      .mockReturnValueOnce('refresh.token');
    const result = await sut.execute('alice@example.com', 'Strong#123');

    expect(userRepository.findByEmail).toHaveBeenCalledWith(
      'alice@example.com',
    );
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'Strong#123',
      'hashed-password',
    );
    expect(jwtService.sign).toHaveBeenNthCalledWith(
      1,
      { sub: 'user-1' },
      expect.objectContaining({
        secret: 'access-secret',
        expiresIn: '15m',
        jwtid: expect.any(String),
      }),
    );
    expect(jwtService.sign).toHaveBeenNthCalledWith(
      2,
      { sub: 'user-1' },
      expect.objectContaining({
        secret: 'refresh-secret',
        expiresIn: '7d',
        jwtid: expect.any(String),
      }),
    );
    expect(result).toEqual({
      accessToken: 'access.token',
      refreshToken: 'refresh.token',
    });
  });

  it('should throw INVALID_CREDENTIALS when email does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(sut.execute('ghost@example.com', 'Any#123')).rejects.toBe(
      HTTP_EXCEPTIONS.INVALID_CREDENTIALS,
    );

    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('should throw INVALID_CREDENTIALS when password does not match', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'alice@example.com',
      password: 'hashed-password',
      createdAt: new Date(),
      deletedAt: null,
      updatedAt: new Date(),
    });

    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(sut.execute('alice@example.com', 'Wrong#123')).rejects.toBe(
      HTTP_EXCEPTIONS.INVALID_CREDENTIALS,
    );

    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});
