import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, Length, ValidateIf } from 'class-validator';

import { UserRole } from './user.types';

export class CreateUserDto {
  @ApiProperty({ example: 'StrongPassword123' })
  @IsString()
  @Length(6, 200)
  password!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  @IsEnum(UserRole)
  role!: UserRole;

  @ApiPropertyOptional({ description: 'Optional legacy field from test spec' })
  @IsOptional()
  @IsUUID()
  taskId?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'NewStrongPassword123' })
  @IsOptional()
  @IsString()
  @Length(6, 200)
  password?: string;

  @ApiPropertyOptional({ enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  taskId?: string | null;
}
