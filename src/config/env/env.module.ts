import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvService } from './env.service';
import { validateEnv } from './env.schema';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
      expandVariables: true,
      cache: true,
      validate: validateEnv,
    }),
  ],
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
