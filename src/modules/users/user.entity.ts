import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Comment } from '../comments/comment.entity';
import { Task } from '../tasks/task.entity';

import { UserRole } from './user.types';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Exclude()
  @Column({ type: 'text' })
  password!: string;

  @Column({ type: 'text' })
  role!: UserRole;

  @Column({ type: 'uuid', name: 'task_id', nullable: true })
  taskId!: string | null;

  @Exclude()
  @Column({ type: 'text', name: 'refresh_token_hash', nullable: true })
  refreshTokenHash!: string | null;

  @OneToMany(() => Task, (task) => task.user)
  tasks!: Task[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
