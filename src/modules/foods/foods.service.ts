import type { FoodCategory, Prisma, Role } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { conflict, notFound } from '../../lib/errors';
import { presentFood } from '../../lib/presenters';

type FoodInput = {
  name: string;
  category: FoodCategory;
  servingDescription: string;
  caloriesPerServing: number;
};

export async function listFoods(role: Role, query: { search?: string; category?: FoodCategory }) {
  const where: Prisma.FoodWhereInput = {
    ...(role === 'ADMIN' ? {} : { isActive: true }),
    ...(query.category ? { category: query.category } : {}),
    ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
  };
  const foods = await prisma.food.findMany({ where, orderBy: [{ name: 'asc' }, { id: 'asc' }] });
  return foods.map(presentFood);
}

async function ensureUniqueName(name: string, exceptId?: number) {
  const existing = await prisma.food.findUnique({ where: { name } });
  if (existing && existing.id !== exceptId) throw conflict('כבר קיים מאכל בשם הזה');
}

export async function createFood(input: FoodInput) {
  await ensureUniqueName(input.name);
  return presentFood(await prisma.food.create({ data: input }));
}

// עריכת קלוריות לא משנה ארוחות שכבר נרשמו ביומן - הקלוריות שלהן נשמרו ביום הרישום
export async function updateFood(id: number, input: FoodInput) {
  const food = await prisma.food.findUnique({ where: { id } });
  if (!food) throw notFound('המאכל לא נמצא');
  await ensureUniqueName(input.name, id);
  return presentFood(await prisma.food.update({ where: { id }, data: input }));
}

export async function setFoodStatus(id: number, isActive: boolean) {
  const food = await prisma.food.findUnique({ where: { id } });
  if (!food) throw notFound('המאכל לא נמצא');
  return presentFood(await prisma.food.update({ where: { id }, data: { isActive } }));
}
