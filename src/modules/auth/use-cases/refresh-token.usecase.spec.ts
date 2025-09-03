import { RefreshTokenUseCase } from './refresh-token.usecase';
import { JwtService } from '@nestjs/jwt';
import { EnvService } from '../../../config/env/env.service';
import { HTTP_EXCEPTIONS } from '../../../commons/contants/http-errors.contants';

describe('RefreshTokenUseCase', () => {
  let sut: RefreshTokenUseCase;

  let jwtService: jest.Mocked<Pick<JwtService, 'verifyAsync' | 'sign'>>;
  let envService: Pick<
    EnvService,
    | 'jwtSecret'
    | 'jwtAccessExpiration'
    | 'jwtRefreshSecret'
    | 'jwtRefreshExpiration'
  >;

  beforeEach(() => {
    jwtService = {
      verifyAsync: jest.fn(),
      sign: jest.fn(),
    } as any;

    envService = {
      jwtSecret: 'access-secret',
      jwtAccessExpiration: '15m',
      jwtRefreshSecret: 'refresh-secret',
      jwtRefreshExpiration: '7d',
      jwtid: 'jwtId',
    } as any;

    sut = new RefreshTokenUseCase(
      jwtService as unknown as JwtService,
      envService as EnvService,
    );

    jest.clearAllMocks();
  });

  it('should issue new access and refresh tokens when the refresh token is valid', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1', iat: 1, exp: 2 });
    jwtService.sign
      .mockReturnValueOnce('new.access.token')
      .mockReturnValueOnce('new.refresh.token');

    const result = await sut.execute('valid.refresh.token');

    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid.refresh.token', {
      secret: 'refresh-secret',
    });
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
      accessToken: 'new.access.token',
      refreshToken: 'new.refresh.token',
    });
  });

  it('should throw JWT_REFRESH_TOKEN_INVALID when verification fails (invalid/expired token)', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('expired'));

    await expect(sut.execute('bad.token')).rejects.toBe(
      HTTP_EXCEPTIONS.JWT_REFRESH_TOKEN_INVALID,
    );

    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});
