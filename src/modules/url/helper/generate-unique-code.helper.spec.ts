import {
  GenerateUniqueCodeHelper,
  CODE_REGEX,
} from './generate-unique-code.helper';
import { Base62ShortCodeHelper } from './base-62-short-code.helper';
import { UrlRepository } from '../url.repository';

describe('GenerateUniqueCodeHelper', () => {
  let sut: GenerateUniqueCodeHelper;

  let base62: jest.Mocked<Pick<Base62ShortCodeHelper, 'gen6'>>;
  let repo: jest.Mocked<Pick<UrlRepository, 'findByCode'>>;

  beforeEach(() => {
    base62 = { gen6: jest.fn() } as any;
    repo = { findByCode: jest.fn() } as any;

    sut = new GenerateUniqueCodeHelper(
      base62 as unknown as Base62ShortCodeHelper,
      repo as unknown as UrlRepository,
    );
    jest.clearAllMocks();
  });

  it('should return a unique code on the first try', async () => {
    base62.gen6.mockReturnValue('a1B2c3');
    repo.findByCode.mockResolvedValue(null);

    const code = await sut.exec();

    expect(code).toBe('a1B2c3');
    expect(CODE_REGEX.test(code!)).toBe(true);
    expect(base62.gen6).toHaveBeenCalledTimes(1);
    expect(repo.findByCode).toHaveBeenCalledWith('a1B2c3');
  });

  it('should retry on collision and return the next available code', async () => {
    base62.gen6.mockReturnValueOnce('abc123').mockReturnValueOnce('xY0z9A');

    repo.findByCode
      .mockResolvedValueOnce({ id: 'taken' } as any)
      .mockResolvedValueOnce(null);

    const code = await sut.exec();

    expect(code).toBe('xY0z9A');
    expect(repo.findByCode).toHaveBeenNthCalledWith(1, 'abc123');
    expect(repo.findByCode).toHaveBeenNthCalledWith(2, 'xY0z9A');
    expect(base62.gen6).toHaveBeenCalledTimes(2);
  });

  it('should skip invalid generated codes (not matching CODE_REGEX)', async () => {
    base62.gen6.mockReturnValueOnce('bad--').mockReturnValueOnce('OK12ab');

    repo.findByCode.mockResolvedValue(null);

    const code = await sut.exec();

    expect(code).toBe('OK12ab');
    expect(repo.findByCode).toHaveBeenCalledTimes(1);
    expect(repo.findByCode).toHaveBeenCalledWith('OK12ab');
  });

  it('should skip codes longer than 6 chars and only query repo for valid ones', async () => {
    base62.gen6.mockReturnValueOnce('abcdefg').mockReturnValueOnce('0000AA');

    repo.findByCode.mockResolvedValue(null);

    const code = await sut.exec();

    expect(code).toBe('0000AA');
    expect(repo.findByCode).toHaveBeenCalledTimes(1);
    expect(repo.findByCode).toHaveBeenCalledWith('0000AA');
  });

  it('should return null after 20 attempts when all codes are taken', async () => {
    let i = 0;
    base62.gen6.mockImplementation(() => 'A' + String(i++).padStart(5, '0'));
    repo.findByCode.mockResolvedValue({ id: 'exists' } as any);

    const code = await sut.exec();

    expect(code).toBeNull();
    expect(base62.gen6).toHaveBeenCalledTimes(20);
    expect(repo.findByCode).toHaveBeenCalledTimes(20);
  });
});
