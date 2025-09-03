import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { HasherService } from '../../commons/helpers/hasher.service';
import { CreateUserUseCase } from './use-cases/create-user.usecase';

@Module({
  controllers: [UserController],
  providers: [UserRepository, HasherService, CreateUserUseCase],
})
export class UserModule {}
