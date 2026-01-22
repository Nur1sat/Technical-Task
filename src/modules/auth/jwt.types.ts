import { UserRole } from '../users/user.types';

export type JwtPayload = {
  sub: string;
  role: UserRole;
};

