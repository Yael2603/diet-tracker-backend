import bcrypt from 'bcryptjs';
import { prisma } from '../../db/prisma';
import { signToken } from '../../lib/auth-tokens';
import { conflict, forbidden, notFound, unauthorized } from '../../lib/errors';
import { presentUser } from '../../lib/presenters';

const SALT_ROUNDS = 10;

export const hashPassword = (password: string) => bcrypt.hash(password, SALT_ROUNDS);

export async function register(input: { fullName: string; email: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw conflict('כתובת האימייל כבר רשומה במערכת');

  // הרשמה עצמית יוצרת תמיד משתמש רגיל - אי אפשר להירשם כמנהל
  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      role: 'USER',
    },
  });
  return { token: signToken(user.id, user.role), user: presentUser(user) };
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  // אותה הודעה למייל לא קיים ולסיסמה שגויה - כדי לא לחשוף אילו מיילים רשומים
  const valid = user ? await bcrypt.compare(input.password, user.passwordHash) : false;
  if (!user || !valid) throw unauthorized('אימייל או סיסמה שגויים');
  if (!user.isActive) throw forbidden('החשבון חסום. יש לפנות לדיאטן');

  return { token: signToken(user.id, user.role), user: presentUser(user) };
}

export async function getMe(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound('המשתמש לא נמצא');
  return presentUser(user);
}
