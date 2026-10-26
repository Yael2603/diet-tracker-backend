import { prisma } from '../../db/prisma';
import { conflict, notFound } from '../../lib/errors';
import { toDbDate } from '../../lib/dates';
import { presentWeight } from '../../lib/presenters';

type WeightInput = { date: string; weightKg: number; note?: string | null };

const DUPLICATE_MESSAGE = 'כבר קיימת שקילה בתאריך הזה. אפשר לערוך את השקילה הקיימת';

export async function listWeights(userId: number) {
  const entries = await prisma.weightEntry.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  });
  return entries.map(presentWeight);
}

async function ensureNoOtherOnDate(userId: number, date: string, exceptId?: number) {
  const existing = await prisma.weightEntry.findUnique({
    where: { userId_date: { userId, date: toDbDate(date) } },
  });
  if (existing && existing.id !== exceptId) throw conflict(DUPLICATE_MESSAGE);
}

/** מוצא שקילה ששייכת למשתמש. שקילה של משתמש אחר מחזירה 404 - כאילו אינה קיימת */
async function findOwn(userId: number, id: number) {
  const entry = await prisma.weightEntry.findFirst({ where: { id, userId } });
  if (!entry) throw notFound('השקילה לא נמצאה');
  return entry;
}

export async function createWeight(userId: number, input: WeightInput) {
  await ensureNoOtherOnDate(userId, input.date);
  const entry = await prisma.weightEntry.create({
    data: { userId, date: toDbDate(input.date), weightKg: input.weightKg, note: input.note || null },
  });
  return presentWeight(entry);
}

export async function updateWeight(userId: number, id: number, input: WeightInput) {
  await findOwn(userId, id);
  await ensureNoOtherOnDate(userId, input.date, id);
  const entry = await prisma.weightEntry.update({
    where: { id },
    data: { date: toDbDate(input.date), weightKg: input.weightKg, note: input.note || null },
  });
  return presentWeight(entry);
}

export async function deleteWeight(userId: number, id: number) {
  await findOwn(userId, id);
  await prisma.weightEntry.delete({ where: { id } });
}
