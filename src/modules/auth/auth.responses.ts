import { ApiProperty } from '@nestjs/swagger';

export class TokenPairResponse {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;
}

