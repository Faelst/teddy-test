import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../../src/modules/app/app.module';
import { PrismaService } from '../../../src/config/prisma/prisma.service';
import { PublisherService } from '../../../src/config/messager/publisher.service';

class FakePublisherService {
  constructor(private readonly prisma: PrismaService) {}
  async emit(pattern: string, payload: any): Promise<void> {
    if (pattern !== 'url.hit') return;

    const {
      urlId,
      ip = null,
      userAgent = null,
      referer = null,
    } = payload ?? {};
    if (!urlId) return;

    await this.prisma.$transaction([
      this.prisma.url.update({
        where: { id: urlId },
        data: { hits: { increment: 1 } },
      }),

      this.prisma.urlAccess.create({
        data: { urlId, ip, userAgent, referer },
      }),
    ]);
  }

  async send(): Promise<unknown> {
    return undefined;
  }
}

describe('Redirect (e2e) — counter hits', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const modRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PublisherService)
      .useFactory({
        inject: [PrismaService],
        factory: (prisma: PrismaService) => new FakePublisherService(prisma),
      })
      .compile();

    app = modRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    // Limpa para evitar conflito de códigos e garantir hits previsíveis
    await prisma
      .$executeRawUnsafe(`TRUNCATE TABLE "UrlAccess" RESTART IDENTITY CASCADE;`)
      .catch(() => {});
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "Url" RESTART IDENTITY CASCADE;`,
    );
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect().catch(() => void 0);
  });

  it('GET /:code → redirects and increments hits (and writes access log)', async () => {
    const code = 'Count1';
    const originalUrl = 'https://example.com/landing?utm=test';

    const url = await prisma.url.create({
      data: { code, originalUrl /* userId opcional */ },
    });

    const before = await prisma.url.findUnique({ where: { id: url.id } });
    const beforeHits = Number(before?.hits ?? 0);

    await request(app.getHttpServer())
      .get(`/${code}`)
      .set('User-Agent', 'JestTest/1.0')
      .set('Referer', 'https://ref.example/')
      .expect(302)
      .expect('Location', originalUrl);

    const after = await prisma.url.findUnique({ where: { id: url.id } });
    const afterHits = Number(after?.hits ?? 0);

    expect(afterHits).toBe(beforeHits + 1);

    const accessCount = await prisma.urlAccess.count({
      where: { urlId: url.id },
    });
    expect(accessCount).toBe(1);
  });
});
