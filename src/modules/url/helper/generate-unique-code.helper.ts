/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { Base62ShortCodeHelper } from './base-62-short-code.helper';
import { UrlRepository } from '../url.repository';

export const CODE_REGEX = /^[A-Za-z0-9]{1,6}$/;
const MAX_ATTEMPTS = 20;

@Injectable()
export class GenerateUniqueCodeHelper {
  constructor(
    private readonly base62ShortCodeHelper: Base62ShortCodeHelper,
    private readonly urlRepository: UrlRepository,
  ) {}

  async exec(): Promise<string | null> {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      const code = this.base62ShortCodeHelper.gen6();

      if (!CODE_REGEX.test(code)) continue;

      const exists = await this.urlRepository.findByCode(code);

      if (!exists) return code;
    }

    return null;
  }
}
