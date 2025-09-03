import { HttpException } from '@nestjs/common';

export const HTTP_EXCEPTIONS = {
  EMAIL_ALREADY_EXISTS: new HttpException('EMAIL_ALREADY_EXISTS', 400),
};
