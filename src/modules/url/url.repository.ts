import { Injectable } from '@nestjs/common';
import { Url, UrlAccess } from '@prisma/client';
import { PrismaService } from '../../config/prisma/prisma.service';
import { BaseRepository } from '../../commons/repositories/base.repository';

@Injectable()
export class UrlRepository extends BaseRepository<Url> {
  constructor(prisma: PrismaService) {
    super(prisma, 'url');
  }

  async softDeleteById(id: string): Promise<void> {
    await this.prisma.url.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async updateById(id: string, data: Partial<Url>): Promise<Url> {
    return this.prisma.url.update({
      where: { id },
      data,
    });
  }

  async findManyByUser(
    userId: string,
    params: any,
  ): Promise<{ items: Url[]; total: number }> {
    const items = await this.prisma.url.findMany({
      where: { userId, deletedAt: null },
      ...params,
    });

    const total = await this.prisma.url.count({
      where: { userId, deletedAt: null },
    });

    return { items, total };
  }

  findByCode(code: string): Promise<Url | null> {
    return this.prisma.url.findUnique({
      where: { code, deletedAt: null },
    });
  }

  async countHit(urlId: string): Promise<void> {
    await this.prisma.url.update({
      where: { id: urlId },
      data: { hits: { increment: 1 } },
    });
  }

  async createAccessLog(data: UrlAccess): Promise<void> {
    await this.prisma.urlAccess.create({
      data: {
        urlId: data.urlId,
        ip: data?.ip,
        userAgent: data?.userAgent,
        referer: data?.referer,
      },
    });
  }
}
