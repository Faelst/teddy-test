import { UpdateUrlUseCase } from './update-url.usecase';
import { UrlRepository } from '../url.repository';
import { NormalizeUrlHelper } from '../helper/normalize-url.helper';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('UpdateUrlUseCase', () => {
  let repo: jest.Mocked<Pick<UrlRepository, 'findByCode' | 'updateById'>>;
  let normalizer: jest.Mocked<Pick<NormalizeUrlHelper, 'exec'>>;

  const USER_ID = 'user-1';
  const CODE = 'Abc123';
  const RECORD = {
    id: 'url-1',
    code: CODE,
    userId: USER_ID,
    originalUrl: 'https://old.example/',
    deletedAt: null,
  } as any;

  beforeEach(() => {
    repo = {
      findByCode: jest.fn(),
      updateById: jest.fn(),
    } as any;

    normalizer = {
      exec: jest.fn(),
    } as any;

    jest.clearAllMocks();
  });

  function makeUseCase(baseUrl = 'https://sho.rt/') {
    return new UpdateUrlUseCase(repo as any, normalizer as any, baseUrl);
  }

  it('should update originalUrl and return mapped output (baseUrl ends with /)', async () => {
    const useCase = makeUseCase('https://sho.rt/');
    repo.findByCode.mockResolvedValue(RECORD);
    normalizer.exec.mockReturnValue('https://new.example/path');
    repo.updateById.mockResolvedValue({
      ...RECORD,
      originalUrl: 'https://new.example/path',
    });

    const out = await useCase.execute(USER_ID, CODE, {
      url: 'new.example/path',
    });

    expect(repo.findByCode).toHaveBeenCalledWith(CODE);
    expect(normalizer.exec).toHaveBeenCalledWith('new.example/path');
    expect(repo.updateById).toHaveBeenCalledWith('url-1', {
      originalUrl: 'https://new.example/path',
    });

    expect(out).toEqual({
      code: CODE,
      shortUrl: 'https://sho.rt/Abc123',
      originalUrl: 'https://new.example/path',
      ownerUserId: USER_ID,
    });
  });

  it('should compose shortUrl correctly when baseUrl has no trailing slash', async () => {
    const useCase = makeUseCase('https://sho.rt');
    repo.findByCode.mockResolvedValue(RECORD);
    normalizer.exec.mockReturnValue('https://new.example/');
    repo.updateById.mockResolvedValue({
      ...RECORD,
      originalUrl: 'https://new.example/',
    });

    const out = await useCase.execute(USER_ID, CODE, {
      url: 'https://new.example/',
    });
    expect(out.shortUrl).toBe('https://sho.rt/Abc123'); // apenas uma barra
  });

  it('should trim code and still work', async () => {
    const useCase = makeUseCase();
    repo.findByCode.mockResolvedValue(RECORD);
    normalizer.exec.mockReturnValue('https://new.example/');
    repo.updateById.mockResolvedValue({
      ...RECORD,
      originalUrl: 'https://new.example/',
    });

    await useCase.execute(USER_ID, `  ${CODE}  `, {
      url: 'https://new.example/',
    });
    expect(repo.findByCode).toHaveBeenCalledWith(CODE);
  });

  it('should throw NotFoundException when code does not match regex', async () => {
    const useCase = makeUseCase();
    await expect(
      useCase.execute(USER_ID, 'bad--', { url: 'https://valid.com' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repo.findByCode).not.toHaveBeenCalled();
    expect(repo.updateById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when record is not found', async () => {
    const useCase = makeUseCase();
    repo.findByCode.mockResolvedValue(null);

    await expect(
      useCase.execute(USER_ID, CODE, { url: 'https://valid.com' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repo.updateById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when record is soft-deleted', async () => {
    const useCase = makeUseCase();
    repo.findByCode.mockResolvedValue({ ...RECORD, deletedAt: new Date() });

    await expect(
      useCase.execute(USER_ID, CODE, { url: 'https://valid.com' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repo.updateById).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException when user is not the owner', async () => {
    const useCase = makeUseCase();
    repo.findByCode.mockResolvedValue({ ...RECORD, userId: 'other-user' });

    await expect(
      useCase.execute(USER_ID, CODE, { url: 'https://valid.com' }),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(repo.updateById).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when normalized url is invalid', async () => {
    const useCase = makeUseCase();
    repo.findByCode.mockResolvedValue(RECORD);
    normalizer.exec.mockReturnValue(null);

    await expect(
      useCase.execute(USER_ID, CODE, { url: '   ' }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(repo.updateById).not.toHaveBeenCalled();
  });
});
