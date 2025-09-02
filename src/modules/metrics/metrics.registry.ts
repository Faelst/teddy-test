import { Histogram, Counter } from 'prom-client';

export class MetricsRegistry {
  readonly httpLatency = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP latency',
    labelNames: ['method', 'route', 'status'] as const,
    buckets: [0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  });
  readonly prismaSlowQuery = new Counter({
    name: 'prisma_slow_queries_total',
    help: 'Slow Prisma queries (threshold ms)',
    labelNames: ['model', 'action'] as const,
  });
}
