import { ListMyUrlsUseCase } from './list-my-urls.usecase';
import { UrlRepository } from '../url.repository';

describe('ListMyUrlsUseCase', () => {
  let sut: ListMyUrlsUseCase;
  let repo: jest.Mocked<Pick<UrlRepository, 'findManyByUser'>>;

  const BASE_WITH_SLASH = 'https://sho.rt/';
  const BASE_NO_SLASH = 'https://sho.rt';

  const now = new Date();

  beforeEach(() => {
    repo = {
      findManyByUser: jest.fn(),
    } as any;
    sut = new ListMyUrlsUseCase(
      repo as unknown as UrlRepository,
      BASE_WITH_SLASH as unknown as any,
    );
    jest.clearAllMocks();
  });

  it('should call repository with calculated skip/take (page=2, pageSize=10)', async () => {
    repo.findManyByUser.mockResolvedValue({ items: [], total: 0 });

    await sut.execute('user-1', { page: 2, pageSize: 10 } as any);

    expect(repo.findManyByUser).toHaveBeenCalledWith('user-1', {
      skip: 10,
      take: 10,
    });
  });

  it('should map items, convert hits (bigint/number/undefined) and compose shortUrl', async () => {
    repo.findManyByUser.mockResolvedValue({
      items: [
        {
          id: 'u1',
          code: 'abc123',
          originalUrl: 'https://ex.com/1',
          hits: 7n, // bigint
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'u2',
          code: 'QwErTy',
          originalUrl: 'https://ex.com/2',
          hits: 3, // number
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'u3',
          code: 'Z9Z9Z9',
          originalUrl: 'https://ex.com/3',
          // hits undefined → deve virar 0
          createdAt: now,
          updatedAt: now,
        } as any,
      ],
      total: 3,
    });

    const out = await sut.execute('user-1', {
      page: 1,
      pageSize: 10,
    } as any);

    expect(out.items).toEqual([
      {
        id: 'u1',
        code: 'abc123',
        shortUrl: 'https://sho.rt/abc123', // sem "//"
        originalUrl: 'https://ex.com/1',
        hits: 7,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'u2',
        code: 'QwErTy',
        shortUrl: 'https://sho.rt/QwErTy',
        originalUrl: 'https://ex.com/2',
        hits: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'u3',
        code: 'Z9Z9Z9',
        shortUrl: 'https://sho.rt/Z9Z9Z9',
        originalUrl: 'https://ex.com/3',
        hits: 0,
        createdAt: now,
        updatedAt: now,
      },
    ]);
    expect(out.total).toBe(3);
    expect(out.totalPages).toBe(1);
    expect(out.page).toBe(1);
    expect(out.pageSize).toBe(10);
  });

  it('should compute totalPages correctly (total=45, pageSize=10 → 5)', async () => {
    repo.findManyByUser.mockResolvedValue({ items: [], total: 45 });

    const out = await sut.execute('user-1', {
      page: 3,
      pageSize: 10,
    } as any);

    expect(out.total).toBe(45);
    expect(out.totalPages).toBe(5);
    expect(repo.findManyByUser).toHaveBeenCalledWith('user-1', {
      skip: 20,
      take: 10,
    });
  });

  it('should compose shortUrl correctly when baseUrl has no trailing slash', async () => {
    // re-instancia com base sem barra
    sut = new ListMyUrlsUseCase(
      repo as unknown as UrlRepository,
      BASE_NO_SLASH as unknown as any,
    );

    repo.findManyByUser.mockResolvedValue({
      items: [
        {
          id: 'u1',
          code: 'abc123',
          originalUrl: 'https://ex.com/1',
          hits: 1n,
          createdAt: now,
          updatedAt: now,
        } as any,
      ],
      total: 1,
    });

    const out = await sut.execute('user-1', {
      page: 1,
      pageSize: 10,
    } as any);

    expect(out.items[0].shortUrl).toBe('https://sho.rt/abc123');
  });

  it('should return empty items when repository returns none', async () => {
    repo.findManyByUser.mockResolvedValue({ items: [], total: 0 });

    const out = await sut.execute('user-1', {
      page: 1,
      pageSize: 10,
    } as any);

    expect(out.items).toEqual([]);
    expect(out.total).toBe(0);
    expect(out.totalPages).toBe(0);
  });
});
