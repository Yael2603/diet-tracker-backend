// שירותים משותפים: סיכום יום אכילה וסקירת משתמש.
// משמשים גם את המשתמש עצמו וגם את הדיאטן (כשהמשתמש משתף).
import type { MealType } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { calculateDailyScore, calculateProgress } from '../../lib/calculations';
import { toDbDate, todayString } from '../../lib/dates';
import { notFound } from '../../lib/errors';
import {
  presentMeal,
  presentMenu,
  presentMenuItem,
  presentTrack,
  presentUser,
  sortMenuItems,
} from '../../lib/presenters';

export type MealSource = 'MENU' | 'OTHER';

const menuInclude = { items: { include: { food: true } } } as const;

/** סיכום של יום אחד ביומן האכילה: ארוחות, קלוריות, ציון ועמידה בתפריט */
export async function getDaySummary(userId: number, date: string, source?: MealSource) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { track: true, menu: { include: menuInclude } },
  });
  if (!user) throw notFound('המשתמש לא נמצא');

  const allMeals = await prisma.mealEntry.findMany({
    where: { userId, date: toDbDate(date) },
    include: { food: true },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });

  const totalCalories = allMeals.reduce((sum, m) => sum + m.calories, 0);
  const targetCalories = user.track?.dailyCalories ?? null;
  const daily = calculateDailyScore(totalCalories, targetCalories, allMeals.length);

  // "התפריט שלי להיום": כל פריט בתפריט + האם כבר סומן כנאכל
  const eatenMenuItemIds = new Set(allMeals.map((m) => m.menuItemId).filter((id): id is number => id != null));
  const menuItems = user.menu
    ? sortMenuItems(user.menu.items).map((item) => ({
        ...presentMenuItem(item),
        eaten: eatenMenuItemIds.has(item.id),
      }))
    : [];
  const menuAdherence = user.menu
    ? { eaten: menuItems.filter((i) => i.eaten).length, total: menuItems.length }
    : null;

  // הסינון משפיע רק על רשימת הארוחות - הסיכומים מחושבים תמיד על כל היום
  const meals = allMeals
    .filter((m) => (source === 'MENU' ? m.fromMenu : source === 'OTHER' ? !m.fromMenu : true))
    .map(presentMeal);

  const mealTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];
  const caloriesByMealType = Object.fromEntries(
    mealTypes.map((t) => [t, allMeals.filter((m) => m.mealType === t).reduce((s, m) => s + m.calories, 0)]),
  ) as Record<MealType, number>;

  return {
    date,
    source: source ?? 'ALL',
    totalCalories,
    targetCalories,
    remainingCalories: targetCalories != null ? targetCalories - totalCalories : null,
    ...daily,
    caloriesByMealType,
    menu: user.menu ? { id: user.menu.id, name: user.menu.name } : null,
    menuAdherence,
    menuItems,
    meals,
  };
}

/** סקירה מלאה של משתמש: פרופיל, מסלול, תפריט, התקדמות ותקציר היום */
export async function getUserOverview(userId: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { track: true, menu: { include: menuInclude } },
  });
  if (!user) throw notFound('המשתמש לא נמצא');

  const latestWeight = await prisma.weightEntry.findFirst({
    where: { userId },
    orderBy: { date: 'desc' },
  });

  const progress = calculateProgress(user.startWeightKg, user.targetWeightKg, latestWeight?.weightKg ?? null);
  const today = await getDaySummary(userId, todayString());

  return {
    user: presentUser(user),
    track: user.track ? presentTrack(user.track) : null,
    menu: user.menu ? presentMenu(user.menu) : null,
    progress,
    today: {
      date: today.date,
      totalCalories: today.totalCalories,
      targetCalories: today.targetCalories,
      remainingCalories: today.remainingCalories,
      score: today.score,
      status: today.status,
      statusLabel: today.statusLabel,
      percentOfTarget: today.percentOfTarget,
      menuAdherence: today.menuAdherence,
    },
  };
}

/** אם המאכל וסוג הארוחה תואמים לפריט בתפריט של המשתמש - מחזיר את הפריט */
export async function findMatchingMenuItem(menuId: number | null, foodId: number, mealType: MealType) {
  if (!menuId) return null;
  return prisma.menuItem.findFirst({ where: { menuId, foodId, mealType } });
}
