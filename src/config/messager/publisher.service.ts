// src/modules/messaging/publisher.service.ts
import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ClientProxy, RmqRecordBuilder } from '@nestjs/microservices';
import { catchError, EMPTY } from 'rxjs';
import { EnvService } from '../../config/env/env.service';

@Injectable()
export class PublisherService {
  private readonly logger = new Logger(PublisherService.name);
  private connected?: Promise<void>;
  private readonly enabled: boolean;

  constructor(
    @Inject('RMQ_PUBLISHER') private readonly client: ClientProxy,
    private readonly envService: EnvService,
    @Optional()
    @Inject('PUBLISHER_DEFAULT_TIMEOUT_MS')
    private readonly defaultTimeoutMs: number = 5000,
  ) {
    this.enabled = this.envService.rabbitEnabled;
  }

  private async ensureConnected() {
    if (!this.connected) {
      this.connected = this.client.connect().then(
        () => void this.logger.log('RMQ publisher connected'),
        (err) => {
          this.connected = undefined;
          throw err;
        },
      );
    }
    return this.connected;
  }

  async emit<T extends object = any>(
    pattern: string,
    payload: T,
    headers?: Record<string, any>,
  ): Promise<void> {
    if (!this.enabled) {
      this.logger.debug(`emit skipped (disabled): ${pattern}`);
      return;
    }
    await this.ensureConnected();

    const record = new RmqRecordBuilder(payload)
      .setOptions({ persistent: true, headers })
      .build();

    this.client
      .emit(pattern, record)
      .pipe(
        catchError((err) => {
          this.logger.error(
            `emit failed: ${pattern}`,
            err?.stack || String(err),
          );
          return EMPTY;
        }),
      )
      .subscribe();
  }
}
