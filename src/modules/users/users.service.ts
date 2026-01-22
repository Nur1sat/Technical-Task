import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly usersRepo: Repository<User>) {}

  async create(dto: CreateUserDto): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      password: passwordHash,
      role: dto.role,
      taskId: dto.taskId ?? null,
      refreshTokenHash: null,
    });
    return this.usersRepo.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }
    if (dto.role) user.role = dto.role;
    if (dto.taskId !== undefined) user.taskId = dto.taskId ?? null;
    return this.usersRepo.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepo.delete({ id });
    if (!result.affected) throw new NotFoundException('User not found');
  }
}
