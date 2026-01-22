import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { LoginDto, RefreshDto, RegisterDto } from './auth.dto';
import { TokenPairResponse } from './auth.responses';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<TokenPairResponse> {
    return this.authService.register(dto);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<TokenPairResponse> {
    return this.authService.login(dto);
  }

  @HttpCode(200)
  @Post('refresh')
  async refresh(@Body() dto: RefreshDto): Promise<TokenPairResponse> {
    return this.authService.refresh(dto);
  }

  @HttpCode(200)
  @Post('logout')
  async logout(@Body() dto: RefreshDto): Promise<{ ok: true }> {
    await this.authService.logout(dto);
    return { ok: true };
  }
}
