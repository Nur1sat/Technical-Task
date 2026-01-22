import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtPayload } from '../auth/jwt.types';
import { UserRole } from '../users/user.types';

import { Comment } from './comment.entity';
import { CreateCommentDto, ListCommentsQueryDto, UpdateCommentDto } from './comments.dto';
import { CommentsService } from './comments.service';

@ApiTags('comments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Roles(UserRole.AUTHOR)
  @UseGuards(RolesGuard)
  @Post()
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCommentDto,
  ): Promise<Comment> {
    return this.commentsService.create(user, dto);
  }

  @Get()
  async list(@Query() query: ListCommentsQueryDto): Promise<Comment[]> {
    return this.commentsService.findByTaskId(query.task_id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Comment> {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
  ): Promise<Comment> {
    return this.commentsService.update(user, id, dto);
  }

  @Delete(':id')
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ ok: true }> {
    await this.commentsService.remove(user, id);
    return { ok: true };
  }
}
