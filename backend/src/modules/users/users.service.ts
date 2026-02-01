import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from '../../common/enums/roles.enum';

export interface CreateUserInput {
  email: string;
  password: string;
  fullName: string;
  role: Role;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email: email.toLowerCase() } });
  }

  async create(data: CreateUserInput): Promise<User> {
    const user = this.userRepo.create({
      ...data,
      email: data.email.toLowerCase(),
    });
    return this.userRepo.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.userRepo.update(id, data as Record<string, unknown>);
    const updated = await this.findById(id);
    if (!updated) throw new Error('User not found after update');
    return updated;
  }
}
