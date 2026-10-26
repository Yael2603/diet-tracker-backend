import type { MealType } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { badRequest, conflict, notFound } from '../../lib/errors';
import { toDbDate, todayString } from '../../lib/dates';
import { mealCalories } from '../../lib/calculations';
import { presentMeal } from '../../lib/presenters';
import { findMatchingMenuItem, getDaySummary, type MealSource } from '../shared/overview.service';

type MealInput = { date: string; mealType: MealType; foodId: number; servings: number };

export const getDay = (userId: number, date: string | undefined, source?: MealSource) =>
  getDaySummary(userId, date ?? todayString(), source);

async function findOwn(userId: number, id: number) {
  const entry = await prisma.mealEntry.findFirst({ where: { id, userId } });
  if (!entry) throw notFound('הארוחה לא נמצאה');
  return entry;
}

async function getUsableFood(foodId: number, allowInactiveId?: number) {
  const food = await prisma.food.findUnique({ where: { id: foodId } });
  // מאכל לא פעיל מותר רק אם הוא כבר היה בארוחה שעורכים
  if (!food || (!food.isActive && food.id !== allowInactiveId)) {
    throw badRequest('המאכל לא נמצא או שאינו פעיל', [{ field: 'foodId', message: 'יש לבחור מאכל מהמאגר' }]);
  }
  return food;
}

async function userMenuId(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { menuId: true } });
  return user?.menuId ?? null;
}

export async function createMeal(userId: number, input: MealInput) {
  const food = await getUsableFood(input.foodId);
  // אם המאכל וסוג הארוחה מופיעים בתפריט שלי - הארוחה מסומנת "מהתפריט"
  const menuItem = await findMatchingMenuItem(await userMenuId(userId), food.id, input.mealType);

  const entry = await prisma.mealEntry.create({
    data: {
      userId,
      foodId: food.id,
      date: toDbDate(input.date),
      mealType: input.mealType,
      servings: input.servings,
      calories: mealCalories(input.servings, food.caloriesPerServing),
      fromMenu: menuItem != null,
      menuItemId: menuItem?.id ?? null,
    },
    include: { food: true },
  });
  return presentMeal(entry);
}

/** לחיצה על "אכלתי ✓" ליד פריט מהתפריט */
export async function createFromMenu(userId: number, input: { menuItemId: number; date?: string }) {
  const date = input.date ?? todayString();
  const menuId = await userMenuId(userId);
  const item = await prisma.menuItem.findUnique({ where: { id: input.menuItemId }, include: { food: true } });
  if (!item || item.menuId !== menuId) throw notFound('הפריט לא נמצא בתפריט שלך');

  const already = await prisma.mealEntry.findFirst({
    where: { userId, menuItemId: item.id, date: toDbDate(date) },
  });
  if (already) throw conflict('הפריט הזה כבר סומן כנאכל בתאריך הזה');

  const entry = await prisma.mealEntry.create({
    data: {
      userId,
      foodId: item.foodId,
      date: toDbDate(date),
      mealType: item.mealType,
      servings: item.servings,
      calories: mealCalories(item.servings, item.food.caloriesPerServing),
      fromMenu: true,
      menuItemId: item.id,
    },
    include: { food: true },
  });
  return presentMeal(entry);
}

export async function updateMeal(userId: number, id: number, input: MealInput) {
  const existing = await findOwn(userId, id);
  const food = await getUsableFood(input.foodId, existing.foodId);
  const menuItem = await findMatchingMenuItem(await userMenuId(userId), food.id, input.mealType);

  const entry = await prisma.mealEntry.update({
    where: { id },
    data: {
      foodId: food.id,
      date: toDbDate(input.date),
      mealType: input.mealType,
      servings: input.servings,
      calories: mealCalories(input.servings, food.caloriesPerServing),
      fromMenu: menuItem != null,
      menuItemId: menuItem?.id ?? null,
    },
    include: { food: true },
  });
  return presentMeal(entry);
}

export async function deleteMeal(userId: number, id: number) {
  await findOwn(userId, id);
  await prisma.mealEntry.delete({ where: { id } });
}
