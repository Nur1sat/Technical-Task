import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtPayload } from '../auth/jwt.types';

import { Task } from './task.entity';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private readonly tasksRepo: Repository<Task>) {}

  async create(user: JwtPayload, dto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepo.create({
      userId: user.sub,
      description: dto.description,
      comment: dto.comment,
    });
    return this.tasksRepo.save(task);
  }

  async findAll(): Promise<Task[]> {
    return this.tasksRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.tasksRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(user: JwtPayload, id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    if (task.userId !== user.sub) throw new ForbiddenException('Only owner can edit task');
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.comment !== undefined) task.comment = dto.comment;
    return this.tasksRepo.save(task);
  }

  async remove(user: JwtPayload, id: string): Promise<void> {
    const task = await this.findOne(id);
    if (task.userId !== user.sub) throw new ForbiddenException('Only owner can delete task');
    await this.tasksRepo.delete({ id });
  }
}
