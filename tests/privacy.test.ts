import { beforeAll, describe, expect, it } from 'vitest';
import { api, bearer, resetDb, tokens, userId } from './helpers';

let t: Awaited<ReturnType<typeof tokens>>;

beforeAll(async () => {
  await resetDb();
  t = await tokens();
});

describe('הדיאטן ומשתמשים', () => {
  it('רשימת משתמשים - רק משתמשים רגילים, בלי סיסמאות ובלי משקלים', async () => {
    const res = await api().get('/api/admin/users').set(bearer(t.admin));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const text = JSON.stringify(res.body);
    expect(text).not.toContain('passwordHash');
    expect(text).not.toContain('weightKg');
    expect(res.body.find((u: { email: string }) => u.email === 'user@example.com')).toMatchObject({
      shareWithDietitian: true,
      pendingConsultations: 1,
      track: { name: 'ירידה מתונה' },
    });
  });

  it('חיפוש לפי שם או אימייל', async () => {
    const byName = await api().get('/api/admin/users').query({ search: 'משה' }).set(bearer(t.admin));
    expect(byName.body.map((u: { email: string }) => u.email)).toEqual(['user2@example.com']);
    const byEmail = await api().get('/api/admin/users').query({ search: 'USER@example' }).set(bearer(t.admin));
    expect(byEmail.body.map((u: { email: string }) => u.email)).toEqual(['user@example.com']);
  });

  it('משתמש משתף - הדיאטן רואה התקדמות, שקילות ויומן', async () => {
    const id = await userId('user@example.com');
    const res = await api().get(`/api/admin/users/${id}`).set(bearer(t.admin));
    expect(res.status).toBe(200);
    expect(res.body.sharing).toBe(true);
    expect(res.body.weights).toHaveLength(5);
    expect(res.body.overview.progress.percent).toBe(29);

    const meals = await api().get(`/api/admin/users/${id}/meals`).set(bearer(t.admin));
    expect(meals.status).toBe(200);
    expect(meals.body.meals.length).toBeGreaterThan(0);
  });

  it('משתמש שלא משתף - הדיאטן לא רואה נתונים אישיים', async () => {
    const id = await userId('user2@example.com');
    const res = await api().get(`/api/admin/users/${id}`).set(bearer(t.admin));
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ sharing: false, overview: null, weights: null });
    expect(res.body.user.startWeightKg).toBeUndefined();
    expect(res.body.user.heightCm).toBeUndefined();

    const meals = await api().get(`/api/admin/users/${id}/meals`).set(bearer(t.admin));
    expect(meals.status).toBe(403);
  });

  it('כיבוי שיתוף חוסם מיד את הגישה של הדיאטן', async () => {
    const id = await userId('user@example.com');
    await api().put('/api/me/profile').set(bearer(t.user)).send({ shareWithDietitian: false });
    expect((await api().get(`/api/admin/users/${id}/meals`).set(bearer(t.admin))).status).toBe(403);
    expect((await api().get(`/api/admin/users/${id}`).set(bearer(t.admin))).body.weights).toBeNull();
    await api().put('/api/me/profile').set(bearer(t.user)).send({ shareWithDietitian: true });
    expect((await api().get(`/api/admin/users/${id}/meals`).set(bearer(t.admin))).status).toBe(200);
  });

  it('לא ניתן לגשת לחשבון הדיאטן דרך ניהול משתמשים', async () => {
    const id = await userId('admin@example.com');
    expect((await api().get(`/api/admin/users/${id}`).set(bearer(t.admin))).status).toBe(404);
    expect((await api().patch(`/api/admin/users/${id}/status`).set(bearer(t.admin)).send({ isActive: false })).status).toBe(404);
  });
});

describe('פניות', () => {
  it('משתמש רואה רק את הפניות שלו', async () => {
    const u1 = await api().get('/api/consultations').set(bearer(t.user));
    const u2 = await api().get('/api/consultations').set(bearer(t.user2));
    expect(u1.body).toHaveLength(2);
    expect(u2.body).toHaveLength(0);
    expect(u1.body[0].user).toBeUndefined();
  });

  it('משתמש שלא משתף לא יכול לשלוח פנייה (403)', async () => {
    const res = await api().post('/api/consultations').set(bearer(t.user2)).send({ subject: 'שאלה', message: 'שאלה כלשהי לדיאטן' });
    expect(res.status).toBe(403);
    expect(res.body.message).toContain('שיתוף');
  });

  it('שליחת פנייה, סינון ומענה', async () => {
    const created = await api().post('/api/consultations').set(bearer(t.user)).send({ subject: 'שאלה חדשה', message: 'מה אפשר לאכול לפני אימון?' });
    expect(created.status).toBe(201);
    expect(created.body).toMatchObject({ status: 'PENDING', statusLabel: 'ממתינה לתשובה', answer: null });

    const pending = await api().get('/api/consultations').query({ status: 'PENDING' }).set(bearer(t.admin));
    expect(pending.body.every((c: { status: string }) => c.status === 'PENDING')).toBe(true);
    expect(pending.body[0]).toMatchObject({ id: created.body.id, user: { email: 'user@example.com' } });

    const answered = await api()
      .patch(`/api/consultations/${created.body.id}/answer`)
      .set(bearer(t.admin))
      .send({ answer: 'בננה או פרוסת לחם מלא.' });
    expect(answered.status).toBe(200);
    expect(answered.body).toMatchObject({ status: 'ANSWERED', answer: 'בננה או פרוסת לחם מלא.' });
    expect(answered.body.answeredAt).not.toBeNull();

    const mine = await api().get('/api/consultations').query({ status: 'ANSWERED' }).set(bearer(t.user));
    expect(mine.body.map((c: { id: number }) => c.id)).toContain(created.body.id);
  });

  it('ולידציה של פנייה ותשובה', async () => {
    expect((await api().post('/api/consultations').set(bearer(t.user)).send({ subject: 'א', message: '' })).status).toBe(400);
    expect((await api().patch('/api/consultations/1/answer').set(bearer(t.admin)).send({ answer: '' })).status).toBe(400);
    expect((await api().patch('/api/consultations/9999/answer').set(bearer(t.admin)).send({ answer: 'תשובה' })).status).toBe(404);
  });
});
