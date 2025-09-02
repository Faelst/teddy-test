import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppLogger } from '../logger/logger.adapter';
import { RequestLoggerMiddleware } from '../../commons/middleware/logger.middleware';

@Module({
  providers: [AppLogger],
  exports: [AppLogger],
})
export class ObservabilityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
