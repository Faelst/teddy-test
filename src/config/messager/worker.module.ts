import { Module } from '@nestjs/common';
import { UrlConsumer } from '../../modules/url/url.consumer';
import { UrlRepository } from '../../modules/url/url.repository';
import { CounterUrlAccessUseCase } from '../../modules/url/use-cases/counter-url-access.usecase';

@Module({
  controllers: [UrlConsumer],
  providers: [UrlRepository, CounterUrlAccessUseCase],
})
export class WorkerModule {}
