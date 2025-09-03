import { execSync } from 'node:child_process';
import { GenericContainer, Wait, StartedTestContainer } from 'testcontainers';

jest.setTimeout(120_000);

let pg: StartedTestContainer;

beforeAll(async () => {
  pg = await new GenericContainer('postgres:16-alpine')
    .withEnvironment({ POSTGRES_USER: 'postgres' })
    .withEnvironment({ POSTGRES_PASSWORD: 'postgres' })
    .withEnvironment({ POSTGRES_DB: 'teddy_test' })
    .withExposedPorts(5432)
    .withWaitStrategy(
      Wait.forLogMessage('database system is ready to accept connections'),
    )
    .start();

  const host = pg.getHost();
  const port = pg.getMappedPort(5432);

  process.env.NODE_ENV = process.env.NODE_ENV || 'test';
  process.env.DATABASE_URL = `postgresql://postgres:postgres@${host}:${port}/teddy_test?schema=public`;

  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env as NodeJS.ProcessEnv,
  });
});

afterAll(async () => {
  if (pg) {
    await pg.stop({ timeout: 10_000 });
  }
});
