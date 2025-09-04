import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../commons/decorators/current-user.decorator';
import { IsPublic } from '../../commons/decorators/is-public.decorator';
import { OptionalJwtAuthGuard } from '../../commons/guards/optional-jwt-auth.guard';
import { ShortenUrlUseCase } from './use-cases/shorten-url.usecase';
import { ShortenDto } from './dtos/shorten.dto';

@Controller('url')
export class UrlController {
  constructor(private readonly shortenUrlUseCase: ShortenUrlUseCase) {}

  @IsPublic()
  @UseGuards(OptionalJwtAuthGuard)
  @Post('shorten')
  async shortenUrl(
    @Body() dto: ShortenDto,
    @CurrentUser() current: { userId?: string | null },
  ) {
    return this.shortenUrlUseCase.execute({
      url: dto.url,
      alias: dto.alias,
      userId: current?.userId ?? null,
    });
  }
}
