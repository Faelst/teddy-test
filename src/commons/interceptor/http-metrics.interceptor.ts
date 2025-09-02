import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { MetricsRegistry } from '../../modules/metrics/metrics.registry';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private metrics: MetricsRegistry) {}
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const req = ctx.switchToHttp().getRequest();
    const start = process.hrtime.bigint();

    return next.handle().pipe(
      tap(() => {
        const res = ctx.switchToHttp().getResponse();
        const dur = Number(process.hrtime.bigint() - start) / 1e9;
        const route = req?.route?.path || req.url;
        this.metrics.httpLatency
          .labels(req.method, route, String(res.statusCode))
          .observe(dur);
      }),
    );
  }
}
