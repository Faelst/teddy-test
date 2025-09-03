import { NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

type DelegateKeys = {
  [K in keyof PrismaClient]: PrismaClient[K] extends {
    create?: any;
    findUnique?: any;
    update?: any;
    delete?: any;
  }
    ? K
    : never;
}[keyof PrismaClient];

export class BaseRepository<T extends { id: string }> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly model: DelegateKeys,
  ) {}

  private get delegate() {
    return (this.prisma as any)[this.model];
  }

  async create(data: unknown): Promise<T> {
    return this.delegate.create({ data }) as Promise<T>;
  }

  async findById(
    id: string,
    select?: Record<string, boolean>,
    include?: Record<string, any>,
  ): Promise<T> {
    const item = await this.delegate.findUnique({
      where: { id },
      select,
      include,
    });

    if (!item)
      throw new NotFoundException(`${String(this.model)} não encontrado`);

    return item as T;
  }

  async count(filter?: Record<string, unknown>): Promise<number> {
    return this.delegate.count({
      where: filter,
    } as any);
  }

  async findAll(
    filter?: Record<string, unknown>,
    orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' },
    select?: Record<string, boolean>,
    include?: Record<string, boolean>,
    skip?: number,
    take?: number,
  ): Promise<T[]> {
    return this.delegate.findMany({
      where: filter,
      orderBy: orderBy,
      include: include,
      select: select,
      skip: skip,
      take: take,
    }) as Promise<T[]>;
  }

  async update(id: string, data: unknown): Promise<T> {
    return this.delegate.update({ where: { id }, data }) as Promise<T>;
  }

  async delete(id: string): Promise<T> {
    return this.delegate.delete({ where: { id } }) as Promise<T>;
  }

  async findByField<K extends keyof T>(
    field: K,
    value: T[K],
  ): Promise<T | null> {
    return this.delegate.findFirst({
      where: { [field]: value },
    }) as Promise<T | null>;
  }
}
