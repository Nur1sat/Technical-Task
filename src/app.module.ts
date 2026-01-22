import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from './modules/auth/auth.module';
import { Comment } from './modules/comments/comment.entity';
import { CommentsModule } from './modules/comments/comments.module';
import { Task } from './modules/tasks/task.entity';
import { TasksModule } from './modules/tasks/tasks.module';
import { User } from './modules/users/user.entity';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('POSTGRES_HOST'),
        port: Number(config.getOrThrow<string>('POSTGRES_PORT')),
        username: config.getOrThrow<string>('POSTGRES_USER'),
        password: config.getOrThrow<string>('POSTGRES_PASSWORD'),
        database: config.getOrThrow<string>('POSTGRES_DB'),
        entities: [User, Task, Comment],
        synchronize: config.get<string>('TYPEORM_SYNCHRONIZE')
          ? config.get<string>('TYPEORM_SYNCHRONIZE') === 'true'
          : true,
        dropSchema: config.get<string>('TYPEORM_DROP_SCHEMA') === 'true',
      }),
    }),
    AuthModule,
    UsersModule,
    TasksModule,
    CommentsModule,
  ],
})
export class AppModule {}
