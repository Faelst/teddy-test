import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { EnvService } from './config/env/env.service';
import { HttpMetricsInterceptor } from './commons/interceptor/http-metrics.interceptor';

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

  await app.listen(envService.port);
}
bootstrap();
