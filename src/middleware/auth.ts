import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { prisma } from '../db/prisma';
import { forbidden, unauthorized } from '../lib/errors';
import { verifyToken } from '../lib/auth-tokens';

/** בודק שנשלח Bearer Token תקין, ושהמשתמש קיים ופעיל */
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw unauthorized('חסר Token. יש לשלוח כותרת Authorization: Bearer <token>');
  }

  let userId: number;
  try {
    const payload = verifyToken(header.slice('Bearer '.length).trim());
    userId = Number(payload.sub);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) throw unauthorized('תוקף ההתחברות פג, יש להתחבר מחדש');
    throw unauthorized('Token לא תקין');
  }

  // התפקיד והסטטוס נלקחים תמיד ממסד הנתונים - כך חסימה נכנסת לתוקף מיד
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isActive: true },
  });
  if (!user) throw unauthorized('המשתמש לא קיים');
  if (!user.isActive) throw forbidden('החשבון חסום. יש לפנות לדיאטן');

  req.user = { id: user.id, role: user.role };
  next();
}

/** מאפשר גישה רק לתפקידים שצוינו */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) throw unauthorized();
    if (!roles.includes(req.user.role)) throw forbidden();
    next();
  };
}

/** מחזיר את מזהה המשתמש המחובר (לשימוש בבקרים אחרי authenticate) */
export function currentUser(req: Request): { id: number; role: Role } {
  if (!req.user) throw unauthorized();
  return req.user;
}
