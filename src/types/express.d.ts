import type { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      /** המשתמש המחובר - נקבע אך ורק לפי ה-Token */
      user?: { id: number; role: Role };
    }
  }
}

export {};
