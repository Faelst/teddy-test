import { Controller, Get, HttpCode, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { IsPublic } from '../../commons/decorators/is-public.decorator';
import { RedirectUseCase } from './use-cases/redirect.usecase';

@Controller()
export class RedirectController {
  constructor(private readonly redirectUseCase: RedirectUseCase) {}

  @IsPublic()
  @Get('/:code([A-Za-z0-9_-]{1,32})')
  @HttpCode(302)
  async redirect(@Param('code') code: string, @Res() res: Response) {
    const url = await this.redirectUseCase.execute(code);
    res.redirect(302, url);
  }
}
