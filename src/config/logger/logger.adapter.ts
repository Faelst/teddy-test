import pino, { Logger as PinoLogger } from 'pino';
import { Injectable } from '@nestjs/common';
import { EnvService } from '../env/env.service';

@Injectable()
export class AppLogger {
  private readonly logger: PinoLogger;
  constructor(env: EnvService) {
    const enabled = env.get('LOG_ENABLED');

    this.logger = pino({
      enabled,
      level: env.get('LOG_LEVEL'),
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'SYS:standard' },
            }
          : undefined,
      base: { service: 'teddy-test' },
    });
  }
  child(bindings: Record<string, any>) {
    return this.logger.child(bindings);
  }
  info(o: any, msg?: string) {
    this.logger.info(o, msg);
  }
  error(o: any, msg?: string) {
    this.logger.error(o, msg);
  }
  warn(o: any, msg?: string) {
    this.logger.warn(o, msg);
  }
  debug(o: any, msg?: string) {
    this.logger.debug(o, msg);
  }
}
