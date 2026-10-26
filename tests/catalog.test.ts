import { beforeAll, describe, expect, it } from 'vitest';
import { api, bearer, foodId, resetDb, tokens, trackId } from './helpers';

let t: Awaited<ReturnType<typeof tokens>>;

beforeAll(async () => {
  await resetDb();
  t = await tokens();
});

const newTrack = {
  name: 'ירידה עדינה',
  description: 'ירידה איטית ונוחה',
  type: 'LOSE',
  difficulty: 'EASY',
  dailyCalories: 2000,
  durationWeeks: 16,
};

describe('מסלולים - CRUD (דיאטן)', () => {
  let id: number;

  it('יצירה', async () => {
    const res = await api().post('/api/tracks').set(bearer(t.admin)).send(newTrack);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ ...newTrack, typeLabel: 'ירידה במשקל', difficultyLabel: 'קל', isActive: true });
    id = res.body.id;
  });

  it('שם כפול מחזיר 409', async () => {
    const res = await api().post('/api/tracks').set(bearer(t.admin)).send(newTrack);
    expect(res.status).toBe(409);
  });

  it('ולידציה: קלוריות מחוץ לטווח וסוג לא חוקי', async () => {
    const res = await api().post('/api/tracks').set(bearer(t.admin)).send({ ...newTrack, name: 'אחר', dailyCalories: 50, type: 'XXX' });
    expect(res.status).toBe(400);
    const fields = res.body.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['dailyCalories', 'type']));
  });

  it('עריכה', async () => {
    const res = await api().put(`/api/tracks/${id}`).set(bearer(t.admin)).send({ ...newTrack, dailyCalories: 1900 });
    expect(res.status).toBe(200);
    expect(res.body.dailyCalories).toBe(1900);
  });

  it('השבתה מסתירה את המסלול ממשתמשים', async () => {
    const res = await api().patch(`/api/tracks/${id}/status`).set(bearer(t.admin)).send({ isActive: false });
    expect(res.status).toBe(200);
    const list = await api().get('/api/tracks').set(bearer(t.user));
    expect(list.body.map((x: { id: number }) => x.id)).not.toContain(id);
  });

  it('עריכת מסלול לא קיים מחזירה 404', async () => {
    const res = await api().put('/api/tracks/9999').set(bearer(t.admin)).send(newTrack);
    expect(res.status).toBe(404);
  });
});

describe('מאכלים - חיפוש, סינון ו-CRUD', () => {
  it('חיפוש לפי שם', async () => {
    const res = await api().get('/api/foods').query({ search: 'לחם' }).set(bearer(t.user));
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((f: { name: string }) => f.name.includes('לחם'))).toBe(true);
  });

  it('סינון לפי קטגוריה', async () => {
    const res = await api().get('/api/foods').query({ category: 'FRUITS' }).set(bearer(t.user));
    expect(res.body.length).toBe(5);
    expect(res.body.every((f: { category: string }) => f.category === 'FRUITS')).toBe(true);
  });

  it('חיפוש וקטגוריה יחד', async () => {
    const res = await api().get('/api/foods').query({ category: 'DAIRY', search: 'גבינה' }).set(bearer(t.user));
    expect(res.body.map((f: { name: string }) => f.name).sort()).toEqual(['גבינה לבנה 5%', 'גבינה צהובה 9%'].sort());
  });

  it('קטגוריה לא חוקית מחזירה 400', async () => {
    const res = await api().get('/api/foods').query({ category: 'PIZZA' }).set(bearer(t.user));
    expect(res.status).toBe(400);
  });

  it('הרשימה ממוינת לפי שם', async () => {
    const res = await api().get('/api/foods').set(bearer(t.user));
    const names = res.body.map((f: { name: string }) => f.name);
    expect(names).toEqual([...names].sort((a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0)));
  });

  it('יצירה, עריכה והשבתה', async () => {
    const created = await api()
      .post('/api/foods')
      .set(bearer(t.admin))
      .send({ name: 'כוסמת מבושלת', category: 'GRAINS', servingDescription: 'כוס', caloriesPerServing: 155 });
    expect(created.status).toBe(201);
    expect(created.body.categoryLabel).toBe('דגנים');

    const updated = await api()
      .put(`/api/foods/${created.body.id}`)
      .set(bearer(t.admin))
      .send({ name: 'כוסמת מבושלת', category: 'GRAINS', servingDescription: 'כוס', caloriesPerServing: 160 });
    expect(updated.body.caloriesPerServing).toBe(160);

    const disabled = await api().patch(`/api/foods/${created.body.id}/status`).set(bearer(t.admin)).send({ isActive: false });
    expect(disabled.body.isActive).toBe(false);
  });

  it('שם כפול מחזיר 409', async () => {
    const res = await api()
      .post('/api/foods')
      .set(bearer(t.admin))
      .send({ name: 'לחם מלא', category: 'GRAINS', servingDescription: 'פרוסה', caloriesPerServing: 70 });
    expect(res.status).toBe(409);
  });
});

describe('תפריטים - CRUD (דיאטן)', () => {
  let menuId: number;

  it('יצירה עם פריטים וחישוב סך קלוריות', async () => {
    const res = await api()
      .post('/api/menus')
      .set(bearer(t.admin))
      .send({
        trackId: await trackId('ירידה מתונה'),
        name: 'תפריט צמחוני',
        description: 'ללא בשר',
        items: [
          { mealType: 'BREAKFAST', foodId: await foodId('לחם מלא'), servings: 1 },
          { mealType: 'LUNCH', foodId: await foodId('עדשים מבושלות'), servings: 1.5 },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.totalCalories).toBe(140 + 345);
    menuId = res.body.id;
  });

  it('מאכל כפול באותה ארוחה מחזיר 400', async () => {
    const lechem = await foodId('לחם מלא');
    const res = await api()
      .post('/api/menus')
      .set(bearer(t.admin))
      .send({
        trackId: await trackId('ירידה מתונה'),
        name: 'כפול',
        items: [
          { mealType: 'BREAKFAST', foodId: lechem, servings: 1 },
          { mealType: 'BREAKFAST', foodId: lechem, servings: 2 },
        ],
      });
    expect(res.status).toBe(400);
  });

  it('מאכל מושבת אינו מותר בתפריט', async () => {
    const res = await api()
      .post('/api/menus')
      .set(bearer(t.admin))
      .send({
        trackId: await trackId('ירידה מתונה'),
        name: 'עם עוגה',
        items: [{ mealType: 'SNACK', foodId: await foodId('עוגת קרם'), servings: 1 }],
      });
    expect(res.status).toBe(400);
    expect(res.body.details[0].field).toBe('items.0.foodId');
  });

  it('תפריט ריק מחזיר 400', async () => {
    const res = await api()
      .post('/api/menus')
      .set(bearer(t.admin))
      .send({ trackId: await trackId('ירידה מתונה'), name: 'ריק', items: [] });
    expect(res.status).toBe(400);
  });

  it('שם כפול באותו מסלול מחזיר 409', async () => {
    const res = await api()
      .post('/api/menus')
      .set(bearer(t.admin))
      .send({
        trackId: await trackId('ירידה מתונה'),
        name: 'תפריט צמחוני',
        items: [{ mealType: 'SNACK', foodId: await foodId('תפוח'), servings: 1 }],
      });
    expect(res.status).toBe(409);
  });

  it('עריכה מחליפה את כל הפריטים', async () => {
    const res = await api()
      .put(`/api/menus/${menuId}`)
      .set(bearer(t.admin))
      .send({ name: 'תפריט צמחוני', items: [{ mealType: 'SNACK', foodId: await foodId('תפוח'), servings: 2 }] });
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.totalCalories).toBe(160);
  });

  it('השבתה', async () => {
    const res = await api().patch(`/api/menus/${menuId}/status`).set(bearer(t.admin)).send({ isActive: false });
    expect(res.status).toBe(200);
    expect(res.body.isActive).toBe(false);
  });
});
