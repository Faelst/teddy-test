import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../commons/decorators/current-user.decorator';
import { IsPublic } from '../../commons/decorators/is-public.decorator';
import { OptionalJwtAuthGuard } from '../../commons/guards/optional-jwt-auth.guard';
import { ShortenUrlUseCase } from './use-cases/shorten-url.usecase';
import { ShortenDto } from './dtos/shorten.dto';
import { JwtAuthGuard } from '../../commons/guards/jwt-auth.guard';
import { ListMyUrlsQueryDto } from './dtos/list-my-urls.dto';
import { ListMyUrlsUseCase } from './use-cases/list-my-urls.usecase';
import { UpdateUrlDto } from './dtos/update-url.dto';
import { UpdateUrlUseCase } from './use-cases/update-url.usecase';
import { DeleteUrlUseCase } from './use-cases/delete-url.usecase';

@Controller('url')
export class UrlController {
  constructor(
    private readonly shortenUrlUseCase: ShortenUrlUseCase,
    private readonly listMyUrlsUseCase: ListMyUrlsUseCase,
    private readonly updateUrlUseCase: UpdateUrlUseCase,
    private readonly deleteUrlUseCase: DeleteUrlUseCase,
  ) {}

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

  @UseGuards(JwtAuthGuard)
  @Get()
  async listMyUrls(
    @Query() query: ListMyUrlsQueryDto,
    @CurrentUser() current: { userId: string },
  ) {
    return this.listMyUrlsUseCase.execute(current.userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Patch('/:code([A-Za-z0-9_-]{1,32})')
  async updateUrl(
    @Param('code') code: string,
    @Body() dto: UpdateUrlDto,
    @CurrentUser() current: { userId: string },
  ) {
    return this.updateUrlUseCase.execute(current.userId, code, dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete('/:code([A-Za-z0-9_-]{1,32})')
  async deleteUrl(
    @Param('code') code: string,
    @CurrentUser() current: { userId: string },
  ) {
    await this.deleteUrlUseCase.execute(current.userId, code);
    return;
  }
}
