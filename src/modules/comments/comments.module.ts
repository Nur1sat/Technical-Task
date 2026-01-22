import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TasksModule } from '../tasks/tasks.module';

import { Comment } from './comment.entity';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment]), TasksModule],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
