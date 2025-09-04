import { Inject, Injectable } from '@nestjs/common';
import { UrlRepository } from '../url.repository';
import { ListMyUrlsQueryDto } from '../dtos/list-my-urls.dto';

@Injectable()
export class ListMyUrlsUseCase {
  constructor(
    private readonly urlRepository: UrlRepository,
    @Inject('baseUrl') private readonly baseUrl: string,
  ) {}

  async execute(userId: string, query: ListMyUrlsQueryDto) {
    const { page, pageSize } = query;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const { items, total } = await this.urlRepository.findManyByUser(userId, {
      skip,
      take,
    });

    const base = this.baseUrl.replace(/\/$/, '');

    const mapped = items.map((u) => ({
      id: u.id,
      code: u.code,
      shortUrl: `${base}/${u.code}`,
      originalUrl: u.originalUrl,
      hits: typeof u.hits === 'bigint' ? Number(u.hits) : (u.hits ?? 0),
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    return {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      items: mapped,
    };
  }
}
