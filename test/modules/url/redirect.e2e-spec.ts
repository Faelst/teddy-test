import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../../src/modules/app/app.module';
import { PrismaService } from '../../../src/config/prisma/prisma.service';

describe('Redirect (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = modRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /:code → should redirect (302) to originalUrl', async () => {
    const code = 'Promo1';
    const originalUrl = 'https://example.com/path?q=1';

    await prisma.url.create({
      data: { code, originalUrl },
    });

    await request(app.getHttpServer()).get(`/${code}`).expect(302);
  });

  it('GET /:code → should return 404 when code is not found', async () => {
    await request(app.getHttpServer()).get('/DoesNotExist').expect(404);
  });
});
