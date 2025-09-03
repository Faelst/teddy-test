import { Injectable } from '@nestjs/common';
import { UserRepository } from '../user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { HTTP_EXCEPTIONS } from '../../../commons/contants/http-errors.contants';
import { HasherService } from '../../../commons/helpers/hasher.service';

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly hasher: HasherService,
  ) {}

  async execute({ email, password }: CreateUserDto) {
    const exists = await this.userRepository.findByField('email', email);

    if (exists) {
      throw HTTP_EXCEPTIONS.EMAIL_ALREADY_EXISTS;
    }

    const hashedPassword = await this.hasher.hash(password);

    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
    });

    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }
}
