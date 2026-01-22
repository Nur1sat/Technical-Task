import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtPayload } from '../auth/jwt.types';
import { TasksService } from '../tasks/tasks.service';

import { Comment } from './comment.entity';
import { CreateCommentDto, UpdateCommentDto } from './comments.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private readonly commentsRepo: Repository<Comment>,
    private readonly tasksService: TasksService,
  ) {}

  async create(user: JwtPayload, dto: CreateCommentDto): Promise<Comment> {
    await this.tasksService.findOne(dto.taskId);
    const comment = this.commentsRepo.create({
      taskId: dto.taskId,
      userId: user.sub,
      text: dto.text,
    });
    return this.commentsRepo.save(comment);
  }

  async findByTaskId(taskId: string): Promise<Comment[]> {
    return this.commentsRepo.find({
      where: { taskId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentsRepo.findOne({ where: { id } });
    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async update(user: JwtPayload, id: string, dto: UpdateCommentDto): Promise<Comment> {
    const comment = await this.findOne(id);
    if (comment.userId !== user.sub) {
      throw new ForbiddenException('Only owner can edit comment');
    }
    if (dto.text !== undefined) comment.text = dto.text;
    return this.commentsRepo.save(comment);
  }

  async remove(user: JwtPayload, id: string): Promise<void> {
    const comment = await this.findOne(id);
    if (comment.userId !== user.sub) {
      throw new ForbiddenException('Only owner can delete comment');
    }
    await this.commentsRepo.delete({ id });
  }
}
