/* eslint-disable @typescript-eslint/no-unused-vars */
import { Controller } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { CounterUrlAccessUseCase } from './use-cases/counter-url-access.usecase';

@Controller()
export class UrlConsumer {
  constructor(
    private readonly counterUrlAccessUseCase: CounterUrlAccessUseCase,
  ) {}

  @EventPattern('url.hit')
  async handleUrlHit(@Payload() payload: any, @Ctx() ctx: RmqContext) {
    const channel = ctx.getChannelRef();
    const msg = ctx.getMessage();

    try {
      await this.counterUrlAccessUseCase.execute(payload);
      await channel.ack(msg);
    } catch (err) {
      channel.nack(msg, false, false);
    }
  }
}
