import { ShortenUrlUseCase } from './shorten-url.usecase';
import { ShortenDto } from '../dtos/shorten.dto';
import { NormalizeUrlHelper } from '../helper/normalize-url.helper';
import { GenerateUniqueCodeHelper } from '../helper/generate-unique-code.helper';
import { HTTP_EXCEPTIONS } from '../../../commons/contants/http-errors.contants';
import { UrlRepository } from '../url.repository';
import { Url } from '@prisma/client';

describe('ShortenUrlUseCase', () => {
  let sut: ShortenUrlUseCase;
  let urlRepository: jest.Mocked<Partial<UrlRepository>>;
  let normalizeUrlHelper: jest.Mocked<Partial<NormalizeUrlHelper>>;
  let generateUniqueCode: jest.Mocked<Partial<GenerateUniqueCodeHelper>>;
  const BASE_URL = 'https://sho.rt';

  beforeEach(() => {
    urlRepository = {
      findByCode: jest.fn(),
      create: jest.fn(),
    };

    normalizeUrlHelper = {
      exec: jest.fn(),
    };

    generateUniqueCode = {
      exec: jest.fn(),
    };

    sut = new ShortenUrlUseCase(
      urlRepository as unknown as UrlRepository,
      normalizeUrlHelper as unknown as NormalizeUrlHelper,
      generateUniqueCode as unknown as GenerateUniqueCodeHelper,
      BASE_URL as unknown as any,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw SHORTEN_URL_INVALID when URL is invalid', async () => {
    const dto: ShortenDto = { url: 'not-a-url' };
    normalizeUrlHelper.exec.mockReturnValue(null);

    await expect(sut.execute(dto)).rejects.toBe(
      HTTP_EXCEPTIONS.SHORTEN_URL_INVALID,
    );

    expect(urlRepository.create).not.toHaveBeenCalled();
    expect(generateUniqueCode.exec).not.toHaveBeenCalled();
  });

  it('should throw SHORTEN_URL_INVALID when alias does not match CODE_REGEX', async () => {
    const dto: ShortenDto = { url: 'example.com', alias: 'invalid_bad--' };
    normalizeUrlHelper.exec.mockReturnValue('https://example.com/');

    await expect(sut.execute(dto)).rejects.toBe(
      HTTP_EXCEPTIONS.SHORTEN_URL_INVALID,
    );

    expect(urlRepository.findByCode).not.toHaveBeenCalled();
    expect(urlRepository.create).not.toHaveBeenCalled();
  });

  it('should throw SHORTEN_URL_CONFLICT when alias is already taken', async () => {
    const dto = { url: 'https://example.com', alias: 'abc123' };
    normalizeUrlHelper.exec.mockReturnValue('https://example.com/');
    urlRepository.findByCode.mockResolvedValue({
      code: 'abc123',
    } as unknown as Url);

    await expect(sut.execute(dto)).rejects.toBe(
      HTTP_EXCEPTIONS.SHORTEN_URL_CONFLICT,
    );

    expect(urlRepository.create).not.toHaveBeenCalled();
    expect(generateUniqueCode.exec).not.toHaveBeenCalled();
  });

  it('should shorten with generated code when alias is not provided', async () => {
    const dto: ShortenDto = { url: 'example.com' };
    normalizeUrlHelper.exec.mockReturnValue('https://example.com/');
    generateUniqueCode.exec.mockResolvedValue('a1B2c3');

    const rec: Partial<Url> = {
      code: 'a1B2c3',
      originalUrl: 'https://example.com/',
      userId: null,
    };
    urlRepository.create.mockResolvedValue(rec as Url);

    const out = await sut.execute(dto);

    expect(generateUniqueCode.exec).toHaveBeenCalled();
    expect(urlRepository.create).toHaveBeenCalledWith({
      code: 'a1B2c3',
      originalUrl: 'https://example.com/',
      userId: null,
    });

    expect(out).toEqual({
      code: 'a1B2c3',
      shortUrl: `${BASE_URL}/a1B2c3`,
      originalUrl: 'https://example.com/',
      ownerUserId: null,
    });
  });

  it('should use provided alias when available and attach owner userId', async () => {
    const dto: ShortenDto & { userId?: string | null } = {
      url: 'https://example.com',
      alias: 'QwErTy',
      userId: 'user-123',
    };
    normalizeUrlHelper.exec.mockReturnValue('https://example.com/');
    urlRepository.findByCode.mockResolvedValue(null);

    const rec: Partial<Url> = {
      code: 'QwErTy',
      originalUrl: 'https://example.com/',
      userId: 'user-123',
    };
    urlRepository.create.mockResolvedValue(rec as Url);

    const out = await sut.execute(dto);

    expect(generateUniqueCode.exec).not.toHaveBeenCalled();
    expect(urlRepository.findByCode).toHaveBeenCalledWith('QwErTy');
    expect(urlRepository.create).toHaveBeenCalledWith({
      code: 'QwErTy',
      originalUrl: 'https://example.com/',
      userId: 'user-123',
    });
    expect(out).toEqual({
      code: 'QwErTy',
      shortUrl: `${BASE_URL}/QwErTy`,
      originalUrl: 'https://example.com/',
      ownerUserId: 'user-123',
    });
  });

  it('should compose shortUrl correctly when baseUrl has trailing slash', async () => {
    sut = new ShortenUrlUseCase(
      urlRepository as unknown as UrlRepository,
      normalizeUrlHelper as unknown as NormalizeUrlHelper,
      generateUniqueCode as unknown as GenerateUniqueCodeHelper,
      'https://sho.rt/' as unknown as any,
    );

    normalizeUrlHelper.exec.mockReturnValue('https://example.com/');
    urlRepository.findByCode.mockResolvedValue(null);

    const dto: ShortenDto = { url: 'https://example.com', alias: 'abc123' };
    const rec: Partial<Url> = {
      code: 'abc123',
      originalUrl: 'https://example.com/',
      userId: null,
    };
    urlRepository.create.mockResolvedValue(rec as Url);

    const out = await sut.execute(dto);

    expect(out.shortUrl).toBe('https://sho.rt/abc123');
  });
});
