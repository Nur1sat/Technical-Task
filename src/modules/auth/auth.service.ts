import { createHash, randomUUID } from 'crypto';

import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';

import { User } from '../users/user.entity';
import { UserRole } from '../users/user.types';
import { UsersService } from '../users/users.service';

import { LoginDto, RegisterDto, RefreshDto } from './auth.dto';
import { JwtPayload } from './jwt.types';
import { parseTtlToSeconds } from './ttl';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.usersService.create({
      password: dto.password,
      role: dto.role,
    });
    return this.issueTokensAndPersistRefresh(user.id, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepo.findOne({ where: { id: dto.id } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokensAndPersistRefresh(user.id, user.role);
  }

  async refresh(dto: RefreshDto) {
    const payload = await this.verifyRefresh(dto.refreshToken);
    const user = await this.usersRepo.findOne({ where: { id: payload.sub } });
    if (!user || !user.refreshTokenHash) {
      throw new ForbiddenException('Refresh token is not valid');
    }

    const ok = await bcrypt.compare(
      this.refreshTokenDigest(dto.refreshToken),
      user.refreshTokenHash,
    );
    if (!ok) throw new ForbiddenException('Refresh token is not valid');

    return this.issueTokensAndPersistRefresh(user.id, user.role);
  }

  async logout(dto: RefreshDto) {
    const payload = await this.verifyRefresh(dto.refreshToken);
    await this.usersRepo.update({ id: payload.sub }, { refreshTokenHash: null });
  }

  private async issueTokensAndPersistRefresh(userId: string, role: UserRole) {
    const accessToken = await this.signAccess({ sub: userId, role });
    const refreshToken = await this.signRefresh({ sub: userId, role });
    const refreshTokenHash = await bcrypt.hash(this.refreshTokenDigest(refreshToken), 10);

    await this.usersRepo.update({ id: userId }, { refreshTokenHash });

    return { accessToken, refreshToken };
  }

  private async signAccess(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  private async signRefresh(payload: JwtPayload): Promise<string> {
    const secret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    const ttl = parseTtlToSeconds(this.config.getOrThrow<string>('JWT_REFRESH_TTL'));
    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn: ttl,
      jwtid: randomUUID(),
    });
  }

  private async verifyRefresh(token: string): Promise<JwtPayload> {
    const secret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, { secret });
    } catch {
      throw new ForbiddenException('Refresh token is not valid');
    }
  }

  private refreshTokenDigest(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
