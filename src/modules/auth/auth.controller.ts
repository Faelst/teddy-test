import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';

import { LoginDto } from './dtos/login.dto';
import { LoginUseCase } from './use-cases/login.usecase';
import { RefreshTokenUseCase } from './use-cases/refresh-token.usecase';
import { IsPublic } from '../../commons/decorators/is-public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @IsPublic()
  @HttpCode(200)
  @Post('login')
  async login(@Body() { email, password }: LoginDto) {
    return this.loginUseCase.execute(email, password);
  }

  @IsPublic()
  @HttpCode(200)
  @Post('refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.refreshTokenUseCase.execute(refreshToken);
  }

  @Get('check')
  @HttpCode(200)
  checkAuth() {
    return { isAuthenticated: true };
  }
}
