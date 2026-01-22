import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ minLength: 1, maxLength: 1000 })
  @IsString()
  @Length(1, 1000)
  description!: string;

  @ApiProperty({ minLength: 1, maxLength: 1000 })
  @IsString()
  @Length(1, 1000)
  comment!: string;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  description?: string;

  @ApiPropertyOptional({ minLength: 1, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  comment?: string;
}
