import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../../../src/modules/app/app.module';
import { PrismaService } from '../../../src/config/prisma/prisma.service';

describe('Auth (e2e)', () => {
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

  describe('/login', () => {
    it('should login successfully and return access & refresh tokens (200)', async () => {
      const email = 'alice_1@example.com';
      const plain = 'Strong#123';
      const password = await bcrypt.hash(plain, 12);

      await prisma.user.create({ data: { email, password: password } });

      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: plain })
        .expect(200);

      expect(res.body).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      );
    });

    it('should reject when password is invalid (401)', async () => {
      const email = 'alice_2@example.com';
      const password = await bcrypt.hash('Correct#123', 12);
      await prisma.user.create({ data: { email, password: password } });

      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'Wrong#123' })
        .expect(401);
    });

    it('should reject when email is not found (401)', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'ghost@example.com', password: 'Any#123' })
        .expect(401);
    });
  });

  describe('/refresh', () => {
    it('should issue new access & refresh tokens when refresh token is valid (200)', async () => {
      const email = 'alice_3@example.com';
      const plain = 'Strong#123';
      const password = await bcrypt.hash(plain, 12);
      await prisma.user.create({ data: { email, password } });

      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: plain })
        .expect(200);

      const { accessToken: oldAccess, refreshToken: oldRefresh } =
        loginRes.body;

      const refreshRes = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: oldRefresh })
        .expect(200);

      expect(refreshRes.body).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        }),
      );

      const { accessToken: newAccess, refreshToken: newRefresh } =
        refreshRes.body;

      expect(newAccess).not.toEqual(oldAccess);
      expect(newRefresh).not.toEqual(oldRefresh);
    });

    it('should return 401 when refresh token is invalid', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid.token.here' })
        .expect(401);
    });
  });
});
