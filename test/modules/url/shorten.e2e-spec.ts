import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../../src/modules/app/app.module';
import { CreateUserUseCase } from '../../../src/modules/user/use-cases/create-user.usecase';

describe('URL Shorten (e2e) — success cases', () => {
  let app: INestApplication;
  let createUserUseCase: CreateUserUseCase;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    createUserUseCase = app.get(CreateUserUseCase);
    await app.init();
  });

  beforeAll(async () => {
    await createUserUseCase.execute({
      email: 'user-1@example.com',
      password: 'password',
    });

    const resLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user-1@example.com', password: 'password' })
      .expect(200);

    token = resLogin.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /shorten — success with alias and with userId (authenticated)', async () => {
    const alias = 'Promo9';
    const res = await request(app.getHttpServer())
      .post('/url/shorten')
      .set('Authorization', `Bearer ${token}`)
      .send({ url: 'https://example.com/landing?utm=abc', alias })
      .expect(201);

    expect(res.body).toEqual(
      expect.objectContaining({
        code: alias,
        originalUrl: 'https://example.com/landing?utm=abc',
        ownerUserId: expect.any(String),
        shortUrl: expect.stringMatching(new RegExp(`/${alias}$`)),
      }),
    );
  });

  it('POST /shorten — success with alias and without userId (anonymous)', async () => {
    const alias = 'QwErTy';
    const res = await request(app.getHttpServer())
      .post('/url/shorten')
      .send({ url: 'https://example.com/path?q=1', alias })
      .expect(201);

    expect(res.body).toEqual(
      expect.objectContaining({
        code: alias,
        originalUrl: 'https://example.com/path?q=1',
        ownerUserId: null,
        shortUrl: expect.stringMatching(new RegExp(`/${alias}$`)),
      }),
    );
  });

  it('POST /shorten — success without alias and with userId (authenticated)', async () => {
    const res = await request(app.getHttpServer())
      .post('/url/shorten')
      .set('Authorization', `Bearer ${token}`)
      .send({ url: 'https://example.com/landing?utm=abc' })
      .expect(201);

    expect(res.body).toEqual(
      expect.objectContaining({
        code: expect.any(String),
        originalUrl: 'https://example.com/landing?utm=abc',
        ownerUserId: expect.any(String),
      }),
    );
  });

  it('POST /shorten — success without alias and without userId (anonymous)', async () => {
    const res = await request(app.getHttpServer())
      .post('/url/shorten')
      .send({ url: 'http://example.com' })
      .expect(201);

    expect(res.body).toEqual(
      expect.objectContaining({
        code: expect.any(String),
        originalUrl: 'http://example.com/',
        ownerUserId: null,
        shortUrl: expect.any(String),
      }),
    );
  });
});
