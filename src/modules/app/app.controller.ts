import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { IsPublic } from '../../commons/decorators/is-public.decorator';

@IsPublic()
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo(): Record<string, unknown> {
    return this.appService.getInfo();
  }
}
