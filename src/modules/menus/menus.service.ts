import type { MealType, Role } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { badRequest, conflict, notFound } from '../../lib/errors';
import { presentMenu } from '../../lib/presenters';

type MenuItemInput = { mealType: MealType; foodId: number; servings: number };

const menuInclude = { items: { include: { food: true } } } as const;

export async function listMenusOfTrack(trackId: number, viewer: { id: number; role: Role }) {
  const track = await prisma.track.findUnique({ where: { id: trackId } });
  if (!track) throw notFound('המסלול לא נמצא');

  if (viewer.role !== 'ADMIN' && !track.isActive) {
    // משתמש רגיל רואה מסלול לא פעיל רק אם הוא כבר נמצא בו
    const me = await prisma.user.findUnique({ where: { id: viewer.id }, select: { trackId: true } });
    if (me?.trackId !== track.id) throw notFound('המסלול לא נמצא');
  }

  const menus = await prisma.menu.findMany({
    where: { trackId, ...(viewer.role === 'ADMIN' ? {} : { isActive: true }) },
    include: menuInclude,
    orderBy: { id: 'asc' },
  });
  return menus.map(presentMenu);
}

async function validateFoods(items: MenuItemInput[]) {
  const foodIds = [...new Set(items.map((i) => i.foodId))];
  const foods = await prisma.food.findMany({ where: { id: { in: foodIds }, isActive: true } });
  const found = new Set(foods.map((f) => f.id));
  const details = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !found.has(item.foodId))
    .map(({ index }) => ({ field: `items.${index}.foodId`, message: 'המאכל לא נמצא או שאינו פעיל' }));
  if (details.length) throw badRequest('חלק מהמאכלים בתפריט אינם תקינים', details);
}

async function ensureUniqueName(trackId: number, name: string, exceptId?: number) {
  const existing = await prisma.menu.findUnique({ where: { trackId_name: { trackId, name } } });
  if (existing && existing.id !== exceptId) throw conflict('כבר קיים תפריט בשם הזה במסלול');
}

export async function createMenu(input: {
  trackId: number;
  name: string;
  description?: string | null;
  items: MenuItemInput[];
}) {
  const track = await prisma.track.findUnique({ where: { id: input.trackId } });
  if (!track) throw notFound('המסלול לא נמצא');
  await ensureUniqueName(input.trackId, input.name);
  await validateFoods(input.items);

  const menu = await prisma.menu.create({
    data: {
      trackId: input.trackId,
      name: input.name,
      description: input.description || null,
      items: { create: input.items },
    },
    include: menuInclude,
  });
  return presentMenu(menu);
}

export async function updateMenu(
  id: number,
  input: { name: string; description?: string | null; items: MenuItemInput[] },
) {
  const menu = await prisma.menu.findUnique({ where: { id } });
  if (!menu) throw notFound('התפריט לא נמצא');
  await ensureUniqueName(menu.trackId, input.name, id);
  await validateFoods(input.items);

  // מחליפים את כל הפריטים בבת אחת. ארוחות ישנות ביומן נשארות מסומנות "מהתפריט".
  const updated = await prisma.$transaction(async (tx) => {
    await tx.menuItem.deleteMany({ where: { menuId: id } });
    return tx.menu.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description || null,
        items: { create: input.items },
      },
      include: menuInclude,
    });
  });
  return presentMenu(updated);
}

export async function setMenuStatus(id: number, isActive: boolean) {
  const menu = await prisma.menu.findUnique({ where: { id } });
  if (!menu) throw notFound('התפריט לא נמצא');
  return presentMenu(await prisma.menu.update({ where: { id }, data: { isActive }, include: menuInclude }));
}
