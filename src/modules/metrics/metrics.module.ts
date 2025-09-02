import { Module, OnModuleInit } from '@nestjs/common';
import { EnvService } from '../../config/env/env.service';
import { MetricsController } from './metrics.controller';
import { MetricsRegistry } from './metrics.registry';
import { collectDefaultMetrics } from 'prom-client';
import { HttpMetricsInterceptor } from '../../commons/interceptor/http-metrics.interceptor';

@Module({
  controllers: [MetricsController],
  providers: [MetricsRegistry, HttpMetricsInterceptor],
  exports: [MetricsRegistry, HttpMetricsInterceptor],
})
export class MetricsModule implements OnModuleInit {
  constructor(private env: EnvService) {}
  onModuleInit() {
    if (!this.env.isMetricsEnabled) return;
    collectDefaultMetrics();
  }
}
