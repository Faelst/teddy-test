import { Injectable } from '@nestjs/common';
import { UrlRepository } from '../url.repository';
import { HTTP_EXCEPTIONS } from '../../../commons/contants/http-errors.contants';
import { PublisherService } from '../../../config/messager/publisher.service';

@Injectable()
export class RedirectUseCase {
  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly publisherService: PublisherService,
  ) {}

  async execute(code: string) {
    const url = await this.urlRepository.findByCode(code);

    if (!url) {
      throw HTTP_EXCEPTIONS.SHORTEN_URL_NOT_FOUND;
    }

    await this.publisherService.emit('url.hit', {
      urlId: url.id,
      code: url.code,
      originalUrl: url.originalUrl,
    });

    return url.originalUrl;
  }
}
