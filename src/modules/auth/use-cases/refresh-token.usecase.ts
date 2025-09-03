/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnvService } from '../../../config/env/env.service';
import { HTTP_EXCEPTIONS } from '../../../commons/contants/http-errors.contants';
import { randomUUID } from 'crypto';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private jwtService: JwtService,
    private envService: EnvService,
  ) {}

  async execute(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.envService.jwtRefreshSecret,
      });

      const newAccessToken = this.jwtService.sign(
        { sub: payload.sub },
        {
          secret: this.envService.jwtSecret,
          expiresIn: this.envService.jwtAccessExpiration,
          jwtid: randomUUID(),
        },
      );

      const newRefreshToken = this.jwtService.sign(
        { sub: payload.sub },
        {
          secret: this.envService.jwtRefreshSecret,
          expiresIn: this.envService.jwtRefreshExpiration,
          jwtid: randomUUID(),
        },
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (_err) {
      throw HTTP_EXCEPTIONS.JWT_REFRESH_TOKEN_INVALID;
    }
  }
}
