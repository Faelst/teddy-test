import { HTTP_EXCEPTIONS } from '../../../commons/contants/http-errors.contants';
import { PublisherService } from '../../../config/messager/publisher.service';
import { UrlRepository } from '../url.repository';
import { RedirectUseCase } from './redirect.usecase';

describe('RedirectUseCase', () => {
  let sut: RedirectUseCase;
  let repo: jest.Mocked<Partial<UrlRepository>>;
  let publisherService: jest.Mocked<Partial<PublisherService>>;

  beforeEach(() => {
    repo = {
      findByCode: jest.fn(),
    } as any;

    publisherService = {
      emit: jest.fn(),
    } as any;

    sut = new RedirectUseCase(
      repo as unknown as UrlRepository,
      publisherService as unknown as PublisherService,
    );
    jest.clearAllMocks();
  });

  it('should return the originalUrl when code exists', async () => {
    repo.findByCode.mockResolvedValue({
      id: 'u1',
      code: 'Abc123',
      originalUrl: 'https://example.com/path?q=1',
      userId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      hits: 0,
    } as any);

    const result = await sut.execute('Abc123');

    expect(repo.findByCode).toHaveBeenCalledWith('Abc123');
    expect(publisherService.emit).toHaveBeenCalledWith('url.hit', {
      code: 'Abc123',
      originalUrl: 'https://example.com/path?q=1',
      urlId: 'u1',
    });
    expect(result).toBe('https://example.com/path?q=1');
  });

  it('should throw SHORTEN_URL_NOT_FOUND when code does not exist', async () => {
    repo.findByCode.mockResolvedValue(null);

    await expect(sut.execute('missing')).rejects.toBe(
      HTTP_EXCEPTIONS.SHORTEN_URL_NOT_FOUND,
    );

    expect(repo.findByCode).toHaveBeenCalledWith('missing');
  });
});
