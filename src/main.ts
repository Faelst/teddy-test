import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { EnvService } from './config/env/env.service';
import { HttpMetricsInterceptor } from './commons/interceptor/http-metrics.interceptor';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const envService = app.get(EnvService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api', {
    exclude: [{ path: ':code', method: RequestMethod.GET }],
  });

  app.enableCors({
    origin: '*',
  });

  if (envService.isMetricsEnabled) {
    app.use(envService.metricsPath, (req, res, next) => {
      (app as any)
        .getHttpAdapter()
        .getInstance()
        ._router.handle(req, res, next);
    });
  }

  app.useGlobalInterceptors(app.get(HttpMetricsInterceptor));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [envService.rabbitUrl],
      queue: envService.rabbitQueue,
      queueOptions: { durable: true },
      noAck: false,
      prefetchCount: envService.rabbitPrefetch ?? 50,
    },
  });

  await app.startAllMicroservices();

  await app.listen(envService.port);
}
bootstrap();
