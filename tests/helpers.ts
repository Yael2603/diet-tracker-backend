import request from 'supertest';
import { createApp } from '../src/app';
import { prisma } from '../src/db/prisma';
import { runSeed } from '../src/seed/seed';

export const app = createApp();
export const api = () => request(app);

/** מאפס את כל הטבלאות ומכניס מחדש את נתוני ההדגמה */
export async function resetDb() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE meal_entries, weight_entries, consultations, menu_items, menus, users, foods, tracks RESTART IDENTITY CASCADE',
  );
  const log = console.log;
  console.log = () => {};
  try {
    await runSeed();
  } finally {
    console.log = log;
  }
}

export async function login(email: string, password: string): Promise<string> {
  const res = await api().post('/api/auth/login').send({ email, password });
  if (res.status !== 200) throw new Error(`login failed for ${email}: ${res.status}`);
  return res.body.token as string;
}

export const tokens = async () => ({
  admin: await login('admin@example.com', 'Admin1234'),
  user: await login('user@example.com', 'User1234'),
  user2: await login('user2@example.com', 'User1234'),
});

export const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

export const userId = async (email: string) => (await prisma.user.findUniqueOrThrow({ where: { email } })).id;
export const foodId = async (name: string) => (await prisma.food.findUniqueOrThrow({ where: { name } })).id;
export const trackId = async (name: string) => (await prisma.track.findUniqueOrThrow({ where: { name } })).id;

export { prisma };
