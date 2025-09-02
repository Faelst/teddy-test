import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { register } from 'prom-client';
import { EnvService } from '../../config/env/env.service';

@Controller()
export class MetricsController {
  private enabled: boolean;
  private path: string;

  constructor(private env: EnvService) {
    this.enabled = env.isMetricsEnabled;
    this.path = env.metricsPath;
  }
  @Get()
  async metrics(@Res() res: Response) {
    if (!this.enabled) return res.status(404).send('metrics disabled');
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  }
}
