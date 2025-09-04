import { Module } from '@nestjs/common';
import { UrlController } from './url.controller';
import { EnvService } from '../../config/env/env.service';
import { ShortenUrlUseCase } from './use-cases/shorten-url.usecase';
import { Base62ShortCodeHelper } from './helper/base-62-short-code.helper';
import { UrlRepository } from './url.repository';
import { GenerateUniqueCodeHelper } from './helper/generate-unique-code.helper';
import { NormalizeUrlHelper } from './helper/normalize-url.helper';
import { RedirectController } from './redirect.controller';
import { RedirectUseCase } from './use-cases/redirect.usecase';
import { BrokerModule } from '../../config/messager/broker.module';
import { ListMyUrlsUseCase } from './use-cases/list-my-urls.usecase';
import { UpdateUrlUseCase } from './use-cases/update-url.usecase';
import { DeleteUrlUseCase } from './use-cases/delete-url.usecase';

@Module({
  imports: [BrokerModule],
  controllers: [UrlController, RedirectController],
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
    RedirectUseCase,
    ListMyUrlsUseCase,
    UpdateUrlUseCase,
    DeleteUrlUseCase,
  ],
})
export class UrlModule {}
