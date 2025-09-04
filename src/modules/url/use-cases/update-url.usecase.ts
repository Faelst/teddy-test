import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { UrlRepository } from '../url.repository';
import { NormalizeUrlHelper } from '../helper/normalize-url.helper';

import { CODE_REGEX } from '../helper/generate-unique-code.helper';
import { UpdateUrlDto } from '../dtos/update-url.dto';

@Injectable()
export class UpdateUrlUseCase {
  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly normalizeUrlHelper: NormalizeUrlHelper,
    @Inject('baseUrl') private readonly baseUrl: string,
  ) {}

  async execute(userId: string, code: string, dto: UpdateUrlDto) {
    const c = code?.trim();

    if (!CODE_REGEX.test(c)) throw new NotFoundException('Short URL not found');

    const rec = await this.urlRepository.findByCode(c);

    if (!rec || (rec as any).deletedAt) {
      throw new NotFoundException('Short URL not found');
    }

    if (!rec.userId || rec.userId !== userId) {
      throw new ForbiddenException('You do not own this short URL');
    }

    const normalized = this.normalizeUrlHelper.exec(dto.url);

    if (!normalized) throw new NotFoundException('Invalid URL');

    const updated = await this.urlRepository.updateById(rec.id, {
      originalUrl: normalized,
    });

    const base = this.baseUrl.replace(/\/$/, '');

    return {
      code: updated.code,
      shortUrl: `${base}/${updated.code}`,
      originalUrl: updated.originalUrl,
      ownerUserId: updated.userId ?? null,
    };
  }
}
