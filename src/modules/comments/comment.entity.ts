import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Task } from '../tasks/task.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'comments' })
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid', name: 'task_id' })
  taskId!: string;

  @ManyToOne(() => Task, (task) => task.comments, { onDelete: 'CASCADE' })
  task!: Task;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'text' })
  text!: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}

