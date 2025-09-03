import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnvService } from '../../../config/env/env.service';
import { HTTP_EXCEPTIONS } from '../../../commons/contants/http-errors.contants';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../user/user.repository';
import { randomUUID } from 'crypto';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly envService: EnvService,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    email: string,
    password: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw HTTP_EXCEPTIONS.INVALID_CREDENTIALS;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw HTTP_EXCEPTIONS.INVALID_CREDENTIALS;
    }

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
      },
      {
        secret: this.envService.jwtSecret,
        expiresIn: this.envService.jwtAccessExpiration,
        jwtid: randomUUID(),
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.envService.jwtRefreshSecret,
        expiresIn: this.envService.jwtRefreshExpiration,
        jwtid: randomUUID(),
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
