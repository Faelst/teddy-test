import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UrlRepository } from '../url.repository';
import { CODE_REGEX } from '../helper/generate-unique-code.helper';

@Injectable()
export class DeleteUrlUseCase {
  constructor(private readonly urlRepository: UrlRepository) {}

  async execute(userId: string, code: string) {
    const c = code?.trim();
    if (!CODE_REGEX.test(c)) throw new NotFoundException('Short URL not found');

    const rec = await this.urlRepository.findByCode(c);
    if (!rec || (rec as any).deletedAt)
      throw new NotFoundException('Short URL not found');
    if (!rec.userId || rec.userId !== userId) {
      throw new ForbiddenException('You do not own this short URL');
    }

    await this.urlRepository.softDeleteById(rec.id);

    return;
  }
}
