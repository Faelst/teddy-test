import { Injectable } from '@nestjs/common';
import { Url } from '@prisma/client';
import { PrismaService } from '../../config/prisma/prisma.service';
import { BaseRepository } from '../../commons/repositories/base.repository';

@Injectable()
export class UrlRepository extends BaseRepository<Url> {
  constructor(prisma: PrismaService) {
    super(prisma, 'url');
  }

  findByCode(code: string): Promise<Url | null> {
    return this.prisma.url.findUnique({
      where: { code, deletedAt: null },
    });
  }
}
