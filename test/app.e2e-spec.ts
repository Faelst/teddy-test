import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/modules/app/app.module';

describe('App (e2e) – info & metrics', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET / should return app info payload', async () => {
    const res = await request(app.getHttpServer()).get('/').expect(200);

    expect(res.body).toMatchObject({
      name: 'teddy-test',
      version: '9.9.9',
      env: expect.any(String),
      node: expect.stringContaining('v'),
      pid: expect.any(Number),
      hostname: expect.any(String),
      health: 'ok',
      http: {
        baseUrl: expect.any(String),
        port: expect.any(Number),
      },
      observability: {
        metrics: {
          enabled: expect.any(Boolean),
          path: expect.any(String),
        },
        tracing: { enabled: expect.any(Boolean) },
        sentry: { enabled: expect.any(Boolean) },
      },
    });

    expect(typeof res.body.uptimeSec).toBe('number');
    expect(res.body.startedAt).toMatch(/Z$/);
    expect(res.body.now).toMatch(/Z$/);
    expect(res.body.memoryMB).toEqual(
      expect.objectContaining({
        rss: expect.any(Number),
        heapTotal: expect.any(Number),
        heapUsed: expect.any(Number),
      }),
    );
  });

  it.skip('GET /metrics should expose prometheus metrics when enabled', async () => {
    const res = await request(app.getHttpServer()).get('/metrics').expect(200);

    expect(res.headers['content-type']).toMatch(/text\/plain/);
    expect(res.text).toContain('# HELP');
    expect(res.text).toContain('process_cpu_user_seconds_total');
  });
});
