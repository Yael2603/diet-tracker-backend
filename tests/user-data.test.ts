import { beforeAll, describe, expect, it } from 'vitest';
import { todayString } from '../src/lib/dates';
import { api, bearer, foodId, prisma, resetDb, tokens, trackId } from './helpers';

let t: Awaited<ReturnType<typeof tokens>>;
const today = todayString();
const daysAgo = (n: number) => {
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
};
const tomorrow = (() => {
  const d = new Date(`${today}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
})();

beforeAll(async () => {
  await resetDb();
  t = await tokens();
});

describe('לוח בקרה ופרופיל', () => {
  it('לוח הבקרה מחזיר מסלול, תפריט, התקדמות ותקציר היום', async () => {
    const res = await api().get('/api/me/dashboard').set(bearer(t.user));
    expect(res.status).toBe(200);
    expect(res.body.track.name).toBe('ירידה מתונה');
    expect(res.body.menu.name).toBe('תפריט חלבי');
    // התחלה 88, יעד 78, נוכחי 85.1 => 29%
    expect(res.body.progress).toMatchObject({ startWeightKg: 88, targetWeightKg: 78, currentWeightKg: 85.1, percent: 29, changeKg: -2.9 });
    expect(res.body.today.date).toBe(today);
    expect(res.body.today.targetCalories).toBe(1800);
    expect(res.body.today.menuAdherence.total).toBe(12);
  });

  it('עדכון חלקי של הפרופיל', async () => {
    const res = await api().put('/api/me/profile').set(bearer(t.user)).send({ heightCm: 176 });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ heightCm: 176, startWeightKg: 88, fullName: 'ישראל ישראלי' });
  });

  it('גיל מתחת ל-18 מחזיר 400', async () => {
    const res = await api().put('/api/me/profile').set(bearer(t.user)).send({ birthDate: daysAgo(365 * 10) });
    expect(res.status).toBe(400);
    expect(res.body.details[0].field).toBe('birthDate');
  });

  it('גוף ריק מחזיר 400', async () => {
    const res = await api().put('/api/me/profile').set(bearer(t.user)).send({});
    expect(res.status).toBe(400);
  });

  it('לא ניתן לשנות תפקיד דרך הפרופיל', async () => {
    const res = await api().put('/api/me/profile').set(bearer(t.user)).send({ role: 'ADMIN' });
    expect(res.status).toBe(400);
  });
});

describe('בחירת מסלול ותפריט', () => {
  it('תפריט שאינו שייך למסלול מחזיר 400', async () => {
    const fast = await trackId('ירידה מהירה');
    const moderate = await trackId('ירידה מתונה');
    const menu = await prisma.menu.findFirstOrThrow({ where: { trackId: moderate, isActive: true } });
    const res = await api().put('/api/me/plan').set(bearer(t.user)).send({ trackId: fast, menuId: menu.id });
    expect(res.status).toBe(400);
  });

  it('מסלול מושבת מחזיר 404', async () => {
    const res = await api().put('/api/me/plan').set(bearer(t.user)).send({ trackId: await trackId('מסלול ניסיוני') });
    expect(res.status).toBe(404);
  });

  it('תפריט מושבת מחזיר 404', async () => {
    const moderate = await trackId('ירידה מתונה');
    const old = await prisma.menu.findFirstOrThrow({ where: { trackId: moderate, name: 'תפריט ישן' } });
    const res = await api().put('/api/me/plan').set(bearer(t.user)).send({ trackId: moderate, menuId: old.id });
    expect(res.status).toBe(404);
  });

  it('בחירה תקינה של מסלול ותפריט', async () => {
    const maintain = await trackId('שמירה על משקל');
    const menus = await api().get(`/api/tracks/${maintain}/menus`).set(bearer(t.user));
    const res = await api().put('/api/me/plan').set(bearer(t.user)).send({ trackId: maintain, menuId: menus.body[0].id });
    expect(res.status).toBe(200);
    expect(res.body.track.name).toBe('שמירה על משקל');
    expect(res.body.menu.id).toBe(menus.body[0].id);
    expect(res.body.user.menuId).toBe(menus.body[0].id);

    // מחזירים למסלול המקורי לשאר הבדיקות
    const moderate = await trackId('ירידה מתונה');
    const dairy = await prisma.menu.findFirstOrThrow({ where: { trackId: moderate, name: 'תפריט חלבי' } });
    await api().put('/api/me/plan').set(bearer(t.user)).send({ trackId: moderate, menuId: dairy.id });
  });
});

describe('שקילות', () => {
  let id: number;

  it('רשימה ממוינת מהחדשה לישנה', async () => {
    const res = await api().get('/api/weights').set(bearer(t.user));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(5);
    expect(res.body[0].date).toBe(today);
    expect(res.body[0].date > res.body[1].date).toBe(true);
  });

  it('הוספה', async () => {
    const res = await api().post('/api/weights').set(bearer(t.user)).send({ date: daysAgo(3), weightKg: 85.5, note: 'בבוקר' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ date: daysAgo(3), weightKg: 85.5, note: 'בבוקר' });
    id = res.body.id;
  });

  it('שקילה שנייה באותו יום מחזירה 409', async () => {
    const res = await api().post('/api/weights').set(bearer(t.user)).send({ date: daysAgo(3), weightKg: 85 });
    expect(res.status).toBe(409);
  });

  it('תאריך עתידי מחזיר 400', async () => {
    const res = await api().post('/api/weights').set(bearer(t.user)).send({ date: tomorrow, weightKg: 85 });
    expect(res.status).toBe(400);
  });

  it('תאריך לא קיים ומשקל לא הגיוני מחזירים 400', async () => {
    const res = await api().post('/api/weights').set(bearer(t.user)).send({ date: '2026-02-30', weightKg: 5 });
    expect(res.status).toBe(400);
    expect(res.body.details).toHaveLength(2);
  });

  it('עריכה, והעברה לתאריך תפוס מחזירה 409', async () => {
    const ok = await api().put(`/api/weights/${id}`).set(bearer(t.user)).send({ date: daysAgo(3), weightKg: 85.4 });
    expect(ok.status).toBe(200);
    expect(ok.body.weightKg).toBe(85.4);
    const clash = await api().put(`/api/weights/${id}`).set(bearer(t.user)).send({ date: today, weightKg: 85.4 });
    expect(clash.status).toBe(409);
  });

  it('משתמש אחר לא יכול לערוך או למחוק את השקילה (404)', async () => {
    expect((await api().put(`/api/weights/${id}`).set(bearer(t.user2)).send({ date: daysAgo(3), weightKg: 50 })).status).toBe(404);
    expect((await api().delete(`/api/weights/${id}`).set(bearer(t.user2))).status).toBe(404);
    const mine = await api().get('/api/weights').set(bearer(t.user2));
    expect(mine.body.map((w: { id: number }) => w.id)).not.toContain(id);
  });

  it('מחיקה', async () => {
    expect((await api().delete(`/api/weights/${id}`).set(bearer(t.user))).status).toBe(204);
    expect((await api().delete(`/api/weights/${id}`).set(bearer(t.user))).status).toBe(404);
  });
});

describe('יומן אכילה', () => {
  let offMenuId: number;

  it('יום עם ארוחות, ציון ו"התפריט שלי להיום"', async () => {
    const res = await api().get('/api/meals').query({ date: daysAgo(1) }).set(bearer(t.user));
    expect(res.status).toBe(200);
    expect(res.body.date).toBe(daysAgo(1));
    expect(res.body.meals.length).toBe(12); // 11 מהתפריט + שוקולד
    expect(res.body.menuAdherence).toEqual({ eaten: 11, total: 12 });
    const sum = res.body.meals.reduce((s: number, m: { calories: number }) => s + m.calories, 0);
    expect(res.body.totalCalories).toBe(sum);
    expect(res.body.targetCalories).toBe(1800);
    expect(res.body.score).toBeTypeOf('number');
    expect(res.body.menuItems.filter((i: { eaten: boolean }) => !i.eaten)).toHaveLength(1);
  });

  it('ללא תאריך מוחזר היום', async () => {
    const res = await api().get('/api/meals').set(bearer(t.user));
    expect(res.body.date).toBe(today);
  });

  it('סינון מהתפריט / מחוץ לתפריט - הסיכום נשאר על כל היום', async () => {
    const all = await api().get('/api/meals').query({ date: daysAgo(1) }).set(bearer(t.user));
    const menu = await api().get('/api/meals').query({ date: daysAgo(1), source: 'MENU' }).set(bearer(t.user));
    const other = await api().get('/api/meals').query({ date: daysAgo(1), source: 'OTHER' }).set(bearer(t.user));
    expect(menu.body.meals.every((m: { fromMenu: boolean }) => m.fromMenu)).toBe(true);
    expect(other.body.meals.map((m: { food: { name: string } }) => m.food.name)).toEqual(['שוקולד מריר']);
    expect(menu.body.meals.length + other.body.meals.length).toBe(all.body.meals.length);
    expect(menu.body.totalCalories).toBe(all.body.totalCalories);
  });

  it('source לא חוקי מחזיר 400', async () => {
    const res = await api().get('/api/meals').query({ source: 'X' }).set(bearer(t.user));
    expect(res.status).toBe(400);
  });

  it('יום ללא ארוחות - סטטוס NO_DATA', async () => {
    const res = await api().get('/api/meals').query({ date: daysAgo(30) }).set(bearer(t.user));
    expect(res.body).toMatchObject({ totalCalories: 0, score: null, status: 'NO_DATA', meals: [] });
  });

  it('הוספת ארוחה מחוץ לתפריט - קלוריות מחושבות בשרת', async () => {
    const res = await api()
      .post('/api/meals')
      .set(bearer(t.user))
      .send({ date: daysAgo(2), mealType: 'SNACK', foodId: await foodId('פופקורן'), servings: 1.5 });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ calories: 150, fromMenu: false, source: 'OTHER', mealTypeLabel: 'ביניים' });
    offMenuId = res.body.id;
  });

  it('מאכל וסוג ארוחה שמופיעים בתפריט - מסומן אוטומטית "מהתפריט"', async () => {
    const res = await api()
      .post('/api/meals')
      .set(bearer(t.user))
      .send({ date: daysAgo(2), mealType: 'SNACK', foodId: await foodId('בננה'), servings: 1 });
    expect(res.status).toBe(201);
    expect(res.body.fromMenu).toBe(true);
    expect(res.body.menuItemId).not.toBeNull();
  });

  it('מאכל מושבת אי אפשר להוסיף', async () => {
    const res = await api()
      .post('/api/meals')
      .set(bearer(t.user))
      .send({ date: today, mealType: 'SNACK', foodId: await foodId('עוגת קרם'), servings: 1 });
    expect(res.status).toBe(400);
  });

  it('ולידציה: מנות 0 ותאריך עתידי', async () => {
    const res = await api()
      .post('/api/meals')
      .set(bearer(t.user))
      .send({ date: tomorrow, mealType: 'LUNCH', foodId: await foodId('תפוח'), servings: 0 });
    expect(res.status).toBe(400);
    expect(res.body.details.map((d: { field: string }) => d.field).sort()).toEqual(['date', 'servings']);
  });

  it('"אכלתי ✓" מוסיף פריט מהתפריט, ופעם שנייה מחזיר 409', async () => {
    const day = await api().get('/api/meals').set(bearer(t.user));
    const notEaten = day.body.menuItems.find((i: { eaten: boolean }) => !i.eaten);
    const res = await api().post('/api/meals/from-menu').set(bearer(t.user)).send({ menuItemId: notEaten.id });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ fromMenu: true, menuItemId: notEaten.id, date: today, calories: notEaten.calories });

    const again = await api().post('/api/meals/from-menu').set(bearer(t.user)).send({ menuItemId: notEaten.id });
    expect(again.status).toBe(409);

    const after = await api().get('/api/meals').set(bearer(t.user));
    expect(after.body.menuAdherence.eaten).toBe(day.body.menuAdherence.eaten + 1);
  });

  it('"אכלתי ✓" על פריט מתפריט של מישהו אחר מחזיר 404', async () => {
    const other = await prisma.user.findUniqueOrThrow({ where: { email: 'user2@example.com' } });
    const item = await prisma.menuItem.findFirstOrThrow({ where: { menuId: other.menuId! } });
    const res = await api().post('/api/meals/from-menu').set(bearer(t.user)).send({ menuItemId: item.id });
    expect(res.status).toBe(404);
  });

  it('עריכה מחשבת קלוריות מחדש', async () => {
    const res = await api()
      .put(`/api/meals/${offMenuId}`)
      .set(bearer(t.user))
      .send({ date: daysAgo(2), mealType: 'SNACK', foodId: await foodId('פופקורן'), servings: 3 });
    expect(res.status).toBe(200);
    expect(res.body.calories).toBe(300);
  });

  it('משתמש אחר לא יכול לערוך או למחוק את הארוחה (404)', async () => {
    const body = { date: daysAgo(2), mealType: 'SNACK', foodId: await foodId('פופקורן'), servings: 1 };
    expect((await api().put(`/api/meals/${offMenuId}`).set(bearer(t.user2)).send(body)).status).toBe(404);
    expect((await api().delete(`/api/meals/${offMenuId}`).set(bearer(t.user2))).status).toBe(404);
  });

  it('מחיקה', async () => {
    expect((await api().delete(`/api/meals/${offMenuId}`).set(bearer(t.user))).status).toBe(204);
  });

  it('כל משתמש רואה רק את היומן שלו', async () => {
    const mine = await api().get('/api/meals').set(bearer(t.user2));
    const u2 = await prisma.user.findUniqueOrThrow({ where: { email: 'user2@example.com' } });
    const dbMeals = await prisma.mealEntry.findMany({ where: { userId: u2.id, date: new Date(`${today}T00:00:00Z`) } });
    expect(mine.body.meals).toHaveLength(dbMeals.length);
    expect(mine.body.menu.name).toBe('תפריט קליל');
  });
});
