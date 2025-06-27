import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import { RegisterRequestDto } from 'src/auth/dto/request/register.request.dto';
import { UpdateUserDto } from './dto/request/update-user.request.dto';
import { Role } from '../common/enums/role.enum';

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

  async update(userId: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado.`);
    }
    const updatedUser = this.userRepository.merge(user, updateUserDto);
    return this.userRepository.save(updatedUser);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async create(user: RegisterRequestDto): Promise<User> {
    // Se o email terminar com @ohara.com, define como ADMIN
    const role = user.email.endsWith('@ohara.com') ? Role.ADMIN : Role.CUSTOMER;
    
    const newUser = this.userRepository.create({
      ...user,
      role
    });
    return this.userRepository.save(newUser);
  }

  async delete(userId: number): Promise<void> {
    const result = await this.userRepository.delete(userId);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado.`);
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }
}