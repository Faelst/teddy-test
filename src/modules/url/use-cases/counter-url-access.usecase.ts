import { Injectable } from '@nestjs/common';
import { UrlRepository } from '../url.repository';
import { HTTP_EXCEPTIONS } from '../../../commons/contants/http-errors.contants';
import { plainToInstance } from 'class-transformer';
import { UrlHitMessageDto } from '../dtos/url-hit-message.dto';
import { validateSync } from 'class-validator';

@Injectable()
export class CounterUrlAccessUseCase {
  constructor(private readonly urlRepository: UrlRepository) {}

  async execute(payload: UrlHitMessageDto) {
    const data = plainToInstance(UrlHitMessageDto, payload);

    const errors = validateSync(data, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length) {
      throw HTTP_EXCEPTIONS.INVALID_URL_HIT_MESSAGE;
    }

    await this.urlRepository.countHit(data.urlId);

    await this.urlRepository.createAccessLog({
      urlId: data.urlId,
      ip: data.ip ?? null,
      userAgent: data.userAgent ?? null,
      referer: data.referer ?? null,
    } as any);
  }
}
