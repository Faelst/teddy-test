import { Inject, Injectable } from '@nestjs/common';
import { ShortenDto } from '../dtos/shorten.dto';
import { NormalizeUrlHelper } from '../helper/normalize-url.helper';
import { HTTP_EXCEPTIONS } from '../../../commons/contants/http-errors.contants';
import {
  CODE_REGEX,
  GenerateUniqueCodeHelper,
} from '../helper/generate-unique-code.helper';
import { UrlRepository } from '../url.repository';
import { Url } from '@prisma/client';

@Injectable()
export class ShortenUrlUseCase {
  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly normalizeUrlHelper: NormalizeUrlHelper,
    private readonly generateUniqueCode: GenerateUniqueCodeHelper,
    @Inject('baseUrl') private readonly baseUrl: string,
  ) {}

  async execute(input: ShortenDto & { userId?: string | null }) {
    const ownerId = input.userId ?? null;

    const originalUrl = this.normalizeUrlHelper.exec(input.url);

    if (!originalUrl) {
      throw HTTP_EXCEPTIONS.SHORTEN_URL_INVALID;
    }

    if (input.alias) {
      const alias = input.alias.trim();
      if (!CODE_REGEX.test(alias)) {
        throw HTTP_EXCEPTIONS.SHORTEN_URL_INVALID;
      }

      const exists = await this.urlRepository.findByCode(alias);
      if (exists) {
        throw HTTP_EXCEPTIONS.SHORTEN_URL_CONFLICT;
      }

      const rec = await this.urlRepository.create({
        code: alias,
        originalUrl,
        userId: ownerId,
      });

      return this.toOutput(rec);
    }

    const code = await this.generateUniqueCode.exec();

    const rec = await this.urlRepository.create({
      code,
      originalUrl,
      userId: ownerId,
    });

    return this.toOutput(rec);
  }

  private toOutput(rec: Url) {
    const base = this.baseUrl.replace(/\/$/, '');
    const shortUrl = `${base}/${rec.code}`;

    return {
      code: rec.code,
      shortUrl,
      originalUrl: rec.originalUrl,
      ownerUserId: rec.userId ?? null,
    };
  }
}
