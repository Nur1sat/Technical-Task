import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  @IsUUID()
  taskId!: string;

  @ApiProperty({ minLength: 1, maxLength: 1000 })
  @IsString()
  @Length(1, 1000)
  text!: string;
}

export class UpdateCommentDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  text?: string;
}

export class ListCommentsQueryDto {
  @ApiProperty({ name: 'task_id' })
  @IsUUID()
  task_id!: string;
}

