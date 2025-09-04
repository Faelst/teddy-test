import { CounterUrlAccessUseCase } from './counter-url-access.usecase';
import { UrlRepository } from '../url.repository';
import { HTTP_EXCEPTIONS } from '../../../commons/contants/http-errors.contants';

describe('CounterUrlAccessUseCase', () => {
  let useCase: CounterUrlAccessUseCase;
  let repo: jest.Mocked<Pick<UrlRepository, 'countHit' | 'createAccessLog'>>;

  const urlId = 'ed7d1b0a-55b0-4596-bff5-57118e805bde';

  beforeEach(() => {
    repo = {
      countHit: jest.fn().mockResolvedValue(undefined),
      createAccessLog: jest.fn().mockResolvedValue(undefined),
    } as any;

    useCase = new CounterUrlAccessUseCase(repo as unknown as UrlRepository);

    jest.clearAllMocks();
  });

  it('should count hit and create access log with null metadata when not provided', async () => {
    const payload: any = {
      urlId,
      code: '4ktr7P',
      originalUrl: 'https://google.com/',
    };

    await expect(useCase.execute(payload)).resolves.toBeUndefined();

    expect(repo.countHit).toHaveBeenCalledTimes(1);
    expect(repo.countHit).toHaveBeenCalledWith(urlId);

    expect(repo.createAccessLog).toHaveBeenCalledTimes(1);
    expect(repo.createAccessLog).toHaveBeenCalledWith({
      urlId,
      ip: null,
      userAgent: null,
      referer: null,
    });
  });

  it('should pass through ip, userAgent and referer when provided', async () => {
    const payload: any = {
      urlId,
      code: '4ktr7P',
      originalUrl: 'https://google.com/',
      ip: '203.0.113.10',
      userAgent: 'Mozilla/5.0 (Mac)',
      referer: 'https://ref.example/',
    };

    await expect(useCase.execute(payload)).resolves.toBeUndefined();

    expect(repo.countHit).toHaveBeenCalledWith(urlId);
    expect(repo.createAccessLog).toHaveBeenCalledWith({
      urlId,
      ip: '203.0.113.10',
      userAgent: 'Mozilla/5.0 (Mac)',
      referer: 'https://ref.example/',
    });
  });

  it('should throw INVALID_URL_HIT_MESSAGE for invalid UUID', async () => {
    const payload: any = {
      urlId: 'not-a-uuid',
      code: '4ktr7P',
      originalUrl: 'https://google.com/',
    };

    await expect(useCase.execute(payload)).rejects.toBe(
      HTTP_EXCEPTIONS.INVALID_URL_HIT_MESSAGE,
    );

    expect(repo.countHit).not.toHaveBeenCalled();
    expect(repo.createAccessLog).not.toHaveBeenCalled();
  });

  it('should throw INVALID_URL_HIT_MESSAGE when payload has unknown field (forbidNonWhitelisted)', async () => {
    const payload: any = {
      urlId,
      code: '4ktr7P',
      originalUrl: 'https://google.com/',
      foo: 'bar', // campo não permitido pelo DTO
    };

    await expect(useCase.execute(payload)).rejects.toBe(
      HTTP_EXCEPTIONS.INVALID_URL_HIT_MESSAGE,
    );

    expect(repo.countHit).not.toHaveBeenCalled();
    expect(repo.createAccessLog).not.toHaveBeenCalled();
  });
});
