import { HttpException } from '@nestjs/common';

export const HTTP_EXCEPTIONS = {
  EMAIL_ALREADY_EXISTS: new HttpException('EMAIL_ALREADY_EXISTS', 400),
  INVALID_CREDENTIALS: new HttpException('INVALID_CREDENTIALS', 401),
  USER_NOT_FOUND: new HttpException('USER_NOT_FOUND', 404),
  JWT_EXPIRED: new HttpException('JWT_EXPIRED', 401),
  JWT_REFRESH_TOKEN_INVALID: new HttpException(
    'JWT_REFRESH_TOKEN_INVALID',
    401,
  ),
};
