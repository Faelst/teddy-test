import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from '../../config/prisma/prisma.module';
import { EnvModule } from '../../config/env/env.module';
import { ObservabilityModule } from '../../config/observability/observability.module';
import { AuthModule } from '../auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../../commons/guards/jwt-auth.guard';
import { AppService } from './app.service';
import { MetricsModule } from '../metrics/metrics.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    EnvModule,
    PrismaModule,
    ObservabilityModule,
    AuthModule,
    MetricsModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
