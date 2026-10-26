// Seed - הכנסת נתוני התחלה.
// בטוח להריץ כמה פעמים: נתונים קיימים לא נמחקים ולא נדרסים.
import type { MealType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../db/prisma';
import { env } from '../config/env';
import { mealCalories } from '../lib/calculations';
import { toDbDate, todayString } from '../lib/dates';
import { DEV_ACCOUNTS, FOODS, TRACKS } from './data';

function daysAgo(days: number): string {
  const d = toDbDate(todayString());
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function seedCatalog() {
  for (const food of FOODS) {
    await prisma.food.upsert({
      where: { name: food.name },
      update: {},
      create: { ...food, isActive: food.isActive ?? true },
    });
  }
  const foods = await prisma.food.findMany();
  const foodId = (name: string) => {
    const f = foods.find((x) => x.name === name);
    if (!f) throw new Error(`Seed: food "${name}" not found`);
    return f.id;
  };

  for (const { menus, ...trackData } of TRACKS) {
    const track = await prisma.track.upsert({
      where: { name: trackData.name },
      update: {},
      create: { ...trackData, isActive: trackData.isActive ?? true },
    });
    for (const menu of menus) {
      const exists = await prisma.menu.findUnique({ where: { trackId_name: { trackId: track.id, name: menu.name } } });
      if (exists) continue;
      await prisma.menu.create({
        data: {
          trackId: track.id,
          name: menu.name,
          description: menu.description,
          isActive: menu.isActive ?? true,
          items: {
            create: menu.items.map((i) => ({ mealType: i.mealType, foodId: foodId(i.food), servings: i.servings })),
          },
        },
      });
    }
  }
}

/** יוצר משתמש אם אינו קיים. מחזיר את המשתמש ו-created=true אם נוצר עכשיו */
async function ensureUser(data: { fullName: string; email: string; password: string; role: 'USER' | 'ADMIN' }) {
  const email = data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { user: existing, created: false };
  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email,
      role: data.role,
      passwordHash: await bcrypt.hash(data.password, 10),
    },
  });
  return { user, created: true };
}

async function addMeal(userId: number, menuId: number | null, date: string, mealType: MealType, foodName: string, servings: number) {
  const food = await prisma.food.findUniqueOrThrow({ where: { name: foodName } });
  const menuItem = menuId
    ? await prisma.menuItem.findFirst({ where: { menuId, foodId: food.id, mealType } })
    : null;
  await prisma.mealEntry.create({
    data: {
      userId,
      foodId: food.id,
      date: toDbDate(date),
      mealType,
      servings,
      calories: mealCalories(servings, food.caloriesPerServing),
      fromMenu: menuItem != null,
      menuItemId: menuItem?.id ?? null,
    },
  });
}

/** נתוני הדגמה למשתמש: מסלול, תפריט, שקילות, ארוחות ופניות */
async function seedDemoUserData(userId: number, opts: { trackName: string; menuName: string; share: boolean; withConsultations: boolean; weights: number[]; profile: { heightCm: number; startWeightKg: number; targetWeightKg: number; birthDate: string } }) {
  const track = await prisma.track.findUniqueOrThrow({ where: { name: opts.trackName } });
  const menu = await prisma.menu.findUniqueOrThrow({ where: { trackId_name: { trackId: track.id, name: opts.menuName } } });

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...opts.profile,
      birthDate: toDbDate(opts.profile.birthDate),
      shareWithDietitian: opts.share,
      trackId: track.id,
      menuId: menu.id,
    },
  });

  // שקילה אחת בשבוע, האחרונה היום
  const count = opts.weights.length;
  for (const [i, weightKg] of opts.weights.entries()) {
    await prisma.weightEntry.create({
      data: { userId, date: toDbDate(daysAgo((count - 1 - i) * 7)), weightKg, note: i === 0 ? 'שקילה ראשונה' : null },
    });
  }

  // אתמול: יום כמעט מלא לפי התפריט + חטיף מחוץ לתפריט
  const yesterday = daysAgo(1);
  const items = await prisma.menuItem.findMany({ where: { menuId: menu.id }, include: { food: true }, orderBy: { id: 'asc' } });
  for (const item of items.slice(0, Math.max(1, items.length - 1))) {
    await addMeal(userId, menu.id, yesterday, item.mealType, item.food.name, item.servings);
  }
  await addMeal(userId, menu.id, yesterday, 'SNACK', 'שוקולד מריר', 1);

  // היום: ארוחת בוקר מהתפריט ועוד משהו מחוץ לתפריט
  const today = todayString();
  for (const item of items.filter((i) => i.mealType === 'BREAKFAST')) {
    await addMeal(userId, menu.id, today, item.mealType, item.food.name, item.servings);
  }
  await addMeal(userId, menu.id, today, 'SNACK', 'עוגייה', 2);

  if (opts.withConsultations) {
    await prisma.consultation.create({
      data: {
        userId,
        subject: 'החלפת ארוחת ערב',
        message: 'אפשר להחליף את היוגורט בארוחת הערב במשהו אחר?',
        status: 'ANSWERED',
        answer: 'כן, אפשר להחליף ב-100 גרם קוטג\' 5% - כמות קלוריות דומה.',
        answeredAt: new Date(),
      },
    });
    await prisma.consultation.create({
      data: {
        userId,
        subject: 'ירידה איטית',
        message: 'השבוע ירדתי פחות מבשבוע שעבר. האם זה תקין?',
      },
    });
  }
}

export async function runSeed() {
  await seedCatalog();
  console.log('  ✓ מאכלים, מסלולים ותפריטים');

  if (env.NODE_ENV === 'production') {
    // בפרודקשן: חשבונות נוצרים רק לפי משתני סביבה, אף פעם לא עם סיסמה קבועה
    if (env.SEED_ADMIN_EMAIL && env.SEED_ADMIN_PASSWORD) {
      if (env.SEED_ADMIN_PASSWORD.length < 10) throw new Error('SEED_ADMIN_PASSWORD must be at least 10 characters');
      const { created } = await ensureUser({ fullName: 'דיאטן', email: env.SEED_ADMIN_EMAIL, password: env.SEED_ADMIN_PASSWORD, role: 'ADMIN' });
      console.log(created ? '  ✓ נוצר חשבון דיאטן' : '  - חשבון הדיאטן כבר קיים');
    } else {
      console.log('  ! SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD לא הוגדרו - לא נוצר חשבון דיאטן');
    }
    if (env.SEED_DEMO_USER_EMAIL && env.SEED_DEMO_USER_PASSWORD) {
      const { user, created } = await ensureUser({ fullName: 'משתמש לדוגמה', email: env.SEED_DEMO_USER_EMAIL, password: env.SEED_DEMO_USER_PASSWORD, role: 'USER' });
      if (created) {
        await seedDemoUserData(user.id, { trackName: 'ירידה מתונה', menuName: 'תפריט חלבי', share: true, withConsultations: true, weights: [88, 87.2, 86.5, 85.9, 85.1], profile: { heightCm: 175, startWeightKg: 88, targetWeightKg: 78, birthDate: '1990-05-10' } });
      }
      console.log(created ? '  ✓ נוצר משתמש לדוגמה' : '  - המשתמש לדוגמה כבר קיים');
    }
    return;
  }

  // סביבת פיתוח ובדיקות
  await ensureUser({ ...DEV_ACCOUNTS.admin, role: 'ADMIN' });
  const u1 = await ensureUser({ ...DEV_ACCOUNTS.user, role: 'USER' });
  if (u1.created) {
    await seedDemoUserData(u1.user.id, { trackName: 'ירידה מתונה', menuName: 'תפריט חלבי', share: true, withConsultations: true, weights: [88, 87.2, 86.5, 85.9, 85.1], profile: { heightCm: 175, startWeightKg: 88, targetWeightKg: 78, birthDate: '1990-05-10' } });
  }
  const u2 = await ensureUser({ ...DEV_ACCOUNTS.user2, role: 'USER' });
  if (u2.created) {
    // משתמש שלא משתף - לבדיקת פרטיות
    await seedDemoUserData(u2.user.id, { trackName: 'ירידה מהירה', menuName: 'תפריט קליל', share: false, withConsultations: false, weights: [95, 94.1], profile: { heightCm: 180, startWeightKg: 95, targetWeightKg: 85, birthDate: '1985-11-02' } });
  }
  console.log('  ✓ חשבונות הדגמה: admin@example.com / Admin1234, user@example.com / User1234, user2@example.com / User1234');
}
