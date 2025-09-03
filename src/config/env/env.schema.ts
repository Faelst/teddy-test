import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).default(3000),
  BASE_URL: z
    .string()
    .url()
    .transform((u) => u.replace(/\/$/, '')),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatório'),
  LOG_ENABLED: z.coerce.boolean().default(true),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  METRICS_ENABLED: z.coerce.boolean().default(true),
  METRICS_PATH: z.string().default('/metrics'),
  TRACING_ENABLED: z.coerce.boolean().default(false),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url().optional(),
  OTEL_SERVICE_NAME: z.string().default('teddy-test'),
  SENTRY_ENABLED: z.coerce.boolean().default(false),
  SENTRY_DSN: z.string().optional(),
  APP_NAME: z.string().default('teddy-test'),
  APP_VERSION: z.string().default('0.0.0'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter no mínimo 16 caracteres'),
  JWT_ACCESS_EXPIRATION: z.string().default('15m'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(16, 'JWT_REFRESH_SECRET deve ter no mínimo 16 caracteres'),
  JWT_REFRESH_EXPIRATION: z.string().default('7d'),
});

export type EnvVars = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvVars {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');

    throw new Error('Falha ao validar variáveis de ambiente: ' + issues);
  }
  return parsed.data;
}
