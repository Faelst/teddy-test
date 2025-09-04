import { execSync } from 'node:child_process';
import { GenericContainer, Wait, StartedTestContainer } from 'testcontainers';

jest.setTimeout(120_000);

let pg: StartedTestContainer;
let rmq: StartedTestContainer;

beforeAll(async () => {
  rmq = await new GenericContainer('rabbitmq:3-management')
    .withEnvironment({ RABBITMQ_DEFAULT_USER: 'guest' })
    .withEnvironment({ RABBITMQ_DEFAULT_PASS: 'guest' })
    .withExposedPorts(5672, 15672)
    .withWaitStrategy(Wait.forLogMessage('Server startup complete'))
    .withWaitStrategy(Wait.forListeningPorts())
    .start();

  const rmqHost = rmq.getHost();
  const rmqPort = rmq.getMappedPort(5672);

  process.env.RABBITMQ_ENABLED = process.env.RABBITMQ_ENABLED ?? 'true';
  process.env.RABBITMQ_URL = `amqp://guest:guest@${rmqHost}:${rmqPort}`;
  process.env.RABBITMQ_QUEUE = process.env.RABBITMQ_QUEUE ?? 'url_hits';
  process.env.RABBITMQ_PREFETCH = process.env.RABBITMQ_PREFETCH ?? '50';

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

  if (rmq) {
    await rmq.stop({ timeout: 10_000 });
  }
});
