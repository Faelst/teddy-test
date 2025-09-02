import { Injectable } from '@nestjs/common';
import os from 'os';
import { EnvService } from '../../config/env/env.service';

const STARTED_AT = new Date();

function bytesToMB(n: number) {
  return Math.round((n / 1024 / 1024) * 10) / 10;
}

@Injectable()
export class AppService {
  constructor(private readonly env: EnvService) {}

  getInfo() {
    const now = new Date();
    const uptimeSec = Math.round(process.uptime());
    const mem = process.memoryUsage();

    return {
      name: this.env.appName,
      version: this.env.appVersion,
      env: this.env.nodeEnv,
      node: process.version,
      pid: process.pid,
      hostname: os?.hostname() || 'localhost',
      startedAt: STARTED_AT.toISOString(),
      now: now.toISOString(),
      uptimeSec,
      memoryMB: {
        rss: bytesToMB(mem.rss),
        heapTotal: bytesToMB(mem.heapTotal),
        heapUsed: bytesToMB(mem.heapUsed),
        external: bytesToMB(mem.external ?? 0),
      },
      http: {
        baseUrl: this.env.baseUrl,
        port: this.env.port,
      },
      observability: {
        metrics: {
          enabled: this.env.metricsEnabled,
          path: this.env.metricsPath,
        },
        tracing: { enabled: this.env.tracingEnabled },
        sentry: { enabled: this.env.sentryEnabled },
      },
      health: 'ok',
    };
  }
}
