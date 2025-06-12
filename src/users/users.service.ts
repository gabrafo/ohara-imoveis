import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import { RegisterRequestDto } from 'src/auth/dto/request/register.request.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password')
      .addSelect('user.tokenVersion')
      .getOne();
  }

  async findById(userId: number): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .where('user.userId = :userId', { userId })
      .addSelect('user.tokenVersion')
      .getOne();
  }

  async incrementTokenVersion(userId: number): Promise<void> {
    await this.userRepository.increment({ userId }, 'tokenVersion', 1);
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phone },
    });
  }

  async update(userId: number, data: Partial<User>): Promise<void> {
    await this.userRepository.update(userId, data);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async create(user: RegisterRequestDto): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }
}