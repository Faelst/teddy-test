import pinoHttp from 'pino-http';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { AppLogger } from '../../config/logger/logger.adapter';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private pinoHttp: any;
  constructor(private readonly appLogger: AppLogger) {
    this.pinoHttp = pinoHttp({
      logger: this.appLogger['logger'],
      genReqId: (req: any) =>
        req.headers['x-request-id'] || crypto.randomUUID(),
      customSuccessMessage: function (req: any, res: any) {
        return `${req.method} ${req.url} -> ${res.statusCode}`;
      },
    });
  }
  use(req: any, res: any, next: () => void) {
    this.pinoHttp(req, res);
    next();
  }
}
