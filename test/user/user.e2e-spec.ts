import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { PrismaService } from '../../src/config/prisma/prisma.service';
import { AppModule } from '../../src/modules/app/app.module';

describe('Users (e2e) — create', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "Url" RESTART IDENTITY CASCADE;`,
    );
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;`,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /users ➜ cria usuário novo (201)', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'alice@example.com', password: 'Strong#123' })
      .expect(201);

    expect(res.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        email: 'alice@example.com',
        createdAt: expect.any(String),
      }),
    );

    const user = await prisma.user.findUnique({
      where: { email: 'alice@example.com' },
    });
    expect(user).toBeTruthy();
  });
});
