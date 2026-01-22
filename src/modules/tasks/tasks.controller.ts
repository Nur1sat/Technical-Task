import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { JwtPayload } from '../auth/jwt.types';
import { UserRole } from '../users/user.types';

import { Task } from './task.entity';
import { CreateTaskDto, UpdateTaskDto } from './tasks.dto';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Roles(UserRole.USER)
  @UseGuards(RolesGuard)
  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(user, dto);
  }

  @Get()
  async findAll(): Promise<Task[]> {
    return this.tasksService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  @Roles(UserRole.USER)
  @UseGuards(RolesGuard)
  @Patch(':id')
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(user, id, dto);
  }

  @Roles(UserRole.USER)
  @UseGuards(RolesGuard)
  @Delete(':id')
  async remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<{ ok: true }> {
    await this.tasksService.remove(user, id);
    return { ok: true };
  }
}
