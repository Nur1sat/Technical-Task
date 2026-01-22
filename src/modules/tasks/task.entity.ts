import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Comment } from '../comments/comment.entity';
import { User } from '../users/user.entity';

@Entity({ name: 'tasks' })
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text' })
  comment!: string;

  @OneToMany(() => Comment, (comment) => comment.task)
  comments!: Comment[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
