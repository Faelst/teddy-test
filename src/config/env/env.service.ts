import { ConfigService as NestConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EnvService {
  constructor(private readonly configService: NestConfigService) {}

  get<T = any>(key: string): T {
    const value = this.configService.get<T>(key);

    if (value === undefined || value === null) {
      throw new Error(`Configuration key "${key}" is not defined`);
    }

    return value;
  }

  get nodeEnv(): string {
    return this.get<string>('NODE_ENV') ?? 'development';
  }

  get port(): number {
    return this.get<number>('PORT') ?? 3000;
  }

  get baseUrl(): string {
    return this.get<string>('BASE_URL') ?? 'http://localhost:3000';
  }

  get isProduction(): boolean {
    return this.get<string>('NODE_ENV') === 'production';
  }

  get jwtSecret(): string {
    return this.get<string>('JWT_SECRET');
  }

  get jwtAccessExpiration(): string {
    return this.get<string>('JWT_ACCESS_EXPIRATION') ?? '15m';
  }

  get jwtRefreshSecret(): string {
    return this.get<string>('JWT_REFRESH_SECRET');
  }

  get jwtRefreshExpiration(): string {
    return this.get<string>('JWT_REFRESH_EXPIRATION') ?? '7d';
  }

  get databaseUrl(): string {
    return this.get<string>('DATABASE_URL');
  }

  get metricsPath(): string {
    return this.get<string>('METRICS_PATH') ?? '/metrics';
  }

  get metricsEnabled(): boolean {
    return this.get<boolean>('METRICS_ENABLED') ?? false;
  }

  get isMetricsEnabled(): boolean {
    return this.metricsEnabled;
  }

  get appName(): string {
    return this.get<string>('APP_NAME');
  }

  get appVersion(): string {
    return this.get<string>('APP_VERSION');
  }

  get tracingEnabled(): boolean {
    return this.get<boolean>('TRACING_ENABLED') ?? false;
  }

  get sentryEnabled(): boolean {
    return this.get<boolean>('SENTRY_ENABLED') ?? false;
  }
}
