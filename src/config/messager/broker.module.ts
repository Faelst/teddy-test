import { Module } from '@nestjs/common';
import { EnvModule } from '../../config/env/env.module';
import { EnvService } from '../../config/env/env.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PublisherService } from './publisher.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'RMQ_PUBLISHER',
        imports: [EnvModule],
        inject: [EnvService],
        useFactory: (env: EnvService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [env.rabbitUrl],
            queue: env.rabbitQueue,
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  providers: [PublisherService],
  exports: [PublisherService],
})
export class BrokerModule {}
