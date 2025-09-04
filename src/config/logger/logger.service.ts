import { Injectable, LoggerService } from '@nestjs/common';
import { AppLogger } from './logger.adapter';

@Injectable()
export class NestLoggerService implements LoggerService {
  constructor(private readonly appLogger: AppLogger) {}

  log(message: any, context?: string) {
    this.appLogger.info(
      this.bindContext(context, message),
      this.stringify(message),
    );
  }

  error(message: any, trace?: string, context?: string) {
    this.appLogger.error(
      this.bindContext(context, { err: trace }),
      this.stringify(message),
    );
  }

  warn(message: any, context?: string) {
    this.appLogger.warn(
      this.bindContext(context, message),
      this.stringify(message),
    );
  }

  debug(message: any, context?: string) {
    this.appLogger.debug(
      this.bindContext(context, message),
      this.stringify(message),
    );
  }

  verbose(message: any, context?: string) {
    this.appLogger.debug(
      this.bindContext(context, { verbose: true, message }),
      this.stringify(message),
    );
  }

  private stringify(msg: any): string {
    return typeof msg === 'string' ? msg : this.safeJson(msg);
  }

  private bindContext(context?: string, extra?: any) {
    return context
      ? { context, ...(this.isObject(extra) ? extra : { value: extra }) }
      : this.isObject(extra)
        ? extra
        : { value: extra };
  }

  protected isObject(v: any) {
    return v !== null && typeof v === 'object';
  }

  protected safeJson(v: any) {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
}
