import { PrismaService } from '../../config/prisma/prisma.service';
import {
  NotFoundError,
  UniqueConstraintError,
} from '../errors/repository.errors';

export abstract class BasePrismaRepository<TDomain, TModel> {
  constructor(protected readonly prisma: PrismaService) {}

  protected abstract get delegate(): any;
  protected abstract toDomain(model: TModel): TDomain;

  protected translateError(e: any): never {
    if (e?.code === 'P2002') {
      throw new UniqueConstraintError(e?.meta?.target);
    }
    if (e?.code === 'P2025') {
      throw new NotFoundError();
    }
    throw e;
  }

  protected async _findUnique(args: any): Promise<TDomain | null> {
    const m = await this.delegate.findUnique(args);
    return m ? this.toDomain(m as TModel) : null;
  }
  protected async _findFirst(args: any): Promise<TDomain | null> {
    const m = await this.delegate.findFirst(args);
    return m ? this.toDomain(m as TModel) : null;
  }
  protected async _findMany(args: any = {}): Promise<TDomain[]> {
    const list = await this.delegate.findMany(args);
    return (list as TModel[]).map(this.toDomain.bind(this));
  }
  protected async _create(args: any): Promise<TDomain> {
    try {
      const m = await this.delegate.create(args);
      return this.toDomain(m as TModel);
    } catch (e) {
      this.translateError(e);
    }
  }
  protected async _update(args: any): Promise<TDomain> {
    try {
      const m = await this.delegate.update(args);
      return this.toDomain(m as TModel);
    } catch (e) {
      this.translateError(e);
    }
  }
  protected async _delete(args: any): Promise<void> {
    try {
      await this.delegate.delete(args);
    } catch (e) {
      this.translateError(e);
    }
  }
  protected async _count(args: any = {}): Promise<number> {
    return this.delegate.count(args);
  }

  protected async _paginateOffset(args: {
    where?: any;
    orderBy?: any;
    page?: number;
    pageSize?: number;
    select?: any;
    include?: any;
  }): Promise<{
    items: TDomain[] | unknown[];
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
  }> {
    const page = Math.max(1, args.page ?? 1);
    const pageSize = Math.max(1, Math.min(100, args.pageSize ?? 20));
    const [rows, total] = await Promise.all([
      this.delegate.findMany({
        where: args.where,
        orderBy: args.orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: args.select,
        include: args.include,
      }),
      this.delegate.count({ where: args.where }),
    ]);

    const items = (rows as TModel[]).map(this.toDomain.bind(this));

    return { items, total, page, pageSize, hasNext: page * pageSize < total };
  }
}
