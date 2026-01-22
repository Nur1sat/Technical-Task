import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID, Length } from 'class-validator';

import { UserRole } from '../users/user.types';

export class RegisterDto {
  @ApiProperty({ example: 'StrongPassword123' })
  @IsString()
  @Length(6, 200)
  password!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  @IsEnum(UserRole)
  role!: UserRole;
}

export class LoginDto {
  @ApiProperty({ example: 'StrongPassword123' })
  @IsString()
  @Length(6, 200)
  password!: string;

  @ApiProperty({ description: 'User UUID' })
  @IsUUID()
  id!: string;
}

export class RefreshDto {
  @ApiProperty({ description: 'Refresh token JWT' })
  @IsString()
  refreshToken!: string;
}
