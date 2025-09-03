import { CreateUserUseCase } from './create-user.usecase';
import { UserRepository } from '../user.repository';
import { HasherService } from '../../../commons/helpers/hasher.service';
import { HTTP_EXCEPTIONS } from '../../../commons/contants/http-errors.contants';

describe('CreateUserUseCase', () => {
  let sut: CreateUserUseCase;
  let userRepository: jest.Mocked<Partial<UserRepository>>;
  let hasher: jest.Mocked<Partial<HasherService>>;

  const now = new Date('2025-01-01T00:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);

    userRepository = {
      findByField: jest.fn(),
      create: jest.fn(),
    };

    hasher = {
      hash: jest.fn(),
    };

    sut = new CreateUserUseCase(userRepository as any, hasher as HasherService);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should create user when email does not exist', async () => {
    const dto = { email: 'alice@example.com', password: 'Strong#123' };

    userRepository.findByField.mockResolvedValue(null);
    hasher.hash.mockResolvedValue('hashed-abc');
    userRepository.create.mockResolvedValue({
      id: 'uuid-1',
      email: dto.email,
      password: 'hashed-abc',
      createdAt: now,
      deletedAt: null,
      updatedAt: null,
    });

    const result = await sut.execute(dto);

    expect(userRepository.findByField).toHaveBeenCalledWith('email', dto.email);
    expect(hasher.hash).toHaveBeenCalledWith(dto.password);
    expect(userRepository.create).toHaveBeenCalledWith({
      email: dto.email,
      password: 'hashed-abc',
    });
    expect(result).toEqual({
      id: 'uuid-1',
      email: 'alice@example.com',
      createdAt: now,
    });
  });

  it('Should throw error when email already exists', async () => {
    const dto = { email: 'alice@example.com', password: 'Strong#123' };

    userRepository.findByField.mockResolvedValue({
      id: 'uuid-1',
      email: dto.email,
      password: 'hashed',
      createdAt: now,
      deletedAt: null,
      updatedAt: null,
    });

    await expect(sut.execute(dto)).rejects.toBe(
      HTTP_EXCEPTIONS.EMAIL_ALREADY_EXISTS,
    );
    expect(hasher.hash).not.toHaveBeenCalled();
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
