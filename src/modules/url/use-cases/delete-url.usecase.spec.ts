import { DeleteUrlUseCase } from './delete-url.usecase';
import { UrlRepository } from '../url.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('DeleteUrlUseCase', () => {
  let useCase: DeleteUrlUseCase;
  let repo: jest.Mocked<Pick<UrlRepository, 'findByCode' | 'softDeleteById'>>;

  beforeEach(() => {
    repo = {
      findByCode: jest.fn(),
      softDeleteById: jest.fn().mockResolvedValue(undefined),
    } as any;

    useCase = new DeleteUrlUseCase(repo as unknown as UrlRepository);

    jest.clearAllMocks();
  });

  it('should soft delete when user owns the short url', async () => {
    const rec = {
      id: 'u1',
      code: 'Abc123',
      userId: 'user-1',
      deletedAt: null,
    } as any;
    repo.findByCode.mockResolvedValue(rec);

    await expect(useCase.execute('user-1', 'Abc123')).resolves.toBeUndefined();

    expect(repo.findByCode).toHaveBeenCalledWith('Abc123');
    expect(repo.softDeleteById).toHaveBeenCalledWith('u1');
  });

  it('should accept code with surrounding spaces (trim) and delete', async () => {
    const rec = {
      id: 'u2',
      code: 'QwErTy',
      userId: 'user-1',
      deletedAt: null,
    } as any;
    repo.findByCode.mockResolvedValue(rec);

    await expect(
      useCase.execute('user-1', '  QwErTy  '),
    ).resolves.toBeUndefined();

    expect(repo.findByCode).toHaveBeenCalledWith('QwErTy');
    expect(repo.softDeleteById).toHaveBeenCalledWith('u2');
  });

  it('should throw NotFoundException when code does not match regex', async () => {
    await expect(useCase.execute('user-1', 'bad--')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(repo.findByCode).not.toHaveBeenCalled();
    expect(repo.softDeleteById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when code is not found', async () => {
    repo.findByCode.mockResolvedValue(null);

    await expect(useCase.execute('user-1', 'Abc123')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(repo.findByCode).toHaveBeenCalledWith('Abc123');
    expect(repo.softDeleteById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when url is already soft-deleted', async () => {
    const rec = {
      id: 'u3',
      code: 'Abc123',
      userId: 'user-1',
      deletedAt: new Date(), // já deletado
    } as any;
    repo.findByCode.mockResolvedValue(rec);

    await expect(useCase.execute('user-1', 'Abc123')).rejects.toBeInstanceOf(
      NotFoundException,
    );

    expect(repo.softDeleteById).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user is not the owner', async () => {
    const rec = {
      id: 'u4',
      code: 'Abc123',
      userId: 'owner-123',
      deletedAt: null,
    } as any;
    repo.findByCode.mockResolvedValue(rec);

    await expect(useCase.execute('other-456', 'Abc123')).rejects.toBeInstanceOf(
      ForbiddenException,
    );

    expect(repo.softDeleteById).not.toHaveBeenCalled();
  });
});
