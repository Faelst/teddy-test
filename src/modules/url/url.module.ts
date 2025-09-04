import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { EnvService } from '../../config/env/env.service';
import { ShortenUrlUseCase } from './use-cases/shorten-url.usecase';
import { Base62ShortCodeHelper } from './helper/base-62-short-code.helper';
import { UrlRepository } from './url.repository';
import { GenerateUniqueCodeHelper } from './helper/generate-unique-code.helper';
import { NormalizeUrlHelper } from './helper/normalize-url.helper';

@Module({
  imports: [],
  controllers: [UrlController],
  providers: [
    {
      provide: 'baseUrl',
      useFactory: (envService: EnvService) => envService.baseUrl as string,
      inject: [EnvService],
    },
    ShortenUrlUseCase,
    Base62ShortCodeHelper,
    NormalizeUrlHelper,
    GenerateUniqueCodeHelper,
    UrlRepository,
  ],
})
export class UrlModule {}
