import { beforeAll, describe, expect, it } from 'vitest';
import { api, bearer, resetDb, tokens } from './helpers';

let t: Awaited<ReturnType<typeof tokens>>;

beforeAll(async () => {
  await resetDb();
  t = await tokens();
});

describe('הרשאות לפי תפקיד', () => {
  const adminOnly: [string, string][] = [
    ['post', '/api/tracks'],
    ['put', '/api/tracks/1'],
    ['patch', '/api/tracks/1/status'],
    ['post', '/api/menus'],
    ['put', '/api/menus/1'],
    ['patch', '/api/menus/1/status'],
    ['post', '/api/foods'],
    ['put', '/api/foods/1'],
    ['patch', '/api/foods/1/status'],
    ['patch', '/api/consultations/1/answer'],
    ['get', '/api/admin/users'],
    ['get', '/api/admin/users/2'],
    ['patch', '/api/admin/users/2/status'],
    ['get', '/api/admin/users/2/meals'],
  ];

  const userOnly: [string, string][] = [
    ['get', '/api/me/dashboard'],
    ['put', '/api/me/profile'],
    ['put', '/api/me/plan'],
    ['get', '/api/weights'],
    ['post', '/api/weights'],
    ['put', '/api/weights/1'],
    ['delete', '/api/weights/1'],
    ['get', '/api/meals'],
    ['post', '/api/meals'],
    ['post', '/api/meals/from-menu'],
    ['put', '/api/meals/1'],
    ['delete', '/api/meals/1'],
    ['post', '/api/consultations'],
  ];

  const call = (method: string, url: string) =>
    (api() as unknown as Record<string, (u: string) => ReturnType<ReturnType<typeof api>['get']>>)[method]!(url);

  it.each(adminOnly)('%s %s - משתמש רגיל מקבל 403', async (method, url) => {
    const res = await call(method, url).set(bearer(t.user)).send({});
    expect(res.status).toBe(403);
  });

  it.each(userOnly)('%s %s - דיאטן מקבל 403', async (method, url) => {
    const res = await call(method, url).set(bearer(t.admin)).send({});
    expect(res.status).toBe(403);
  });

  it.each([...adminOnly, ...userOnly, ['get', '/api/tracks'], ['get', '/api/foods'], ['get', '/api/consultations'], ['get', '/api/tracks/1/menus']] as [string, string][])(
    '%s %s - ללא Token מקבל 401',
    async (method, url) => {
      const res = await call(method, url).send({});
      expect(res.status).toBe(401);
    },
  );
});

describe('מה כל תפקיד רואה', () => {
  it('משתמש רגיל רואה רק מסלולים פעילים, דיאטן רואה הכל', async () => {
    const user = await api().get('/api/tracks').set(bearer(t.user));
    const admin = await api().get('/api/tracks').set(bearer(t.admin));
    expect(user.body.every((x: { isActive: boolean }) => x.isActive)).toBe(true);
    expect(admin.body.some((x: { isActive: boolean }) => !x.isActive)).toBe(true);
    expect(admin.body.length).toBeGreaterThan(user.body.length);
  });

  it('משתמש רגיל לא רואה מאכלים מושבתים', async () => {
    const user = await api().get('/api/foods').set(bearer(t.user));
    const admin = await api().get('/api/foods').set(bearer(t.admin));
    expect(user.body.find((f: { name: string }) => f.name === 'עוגת קרם')).toBeUndefined();
    expect(admin.body.find((f: { name: string }) => f.name === 'עוגת קרם')).toBeDefined();
  });

  it('משתמש רגיל לא רואה תפריטים מושבתים', async () => {
    const tracks = await api().get('/api/tracks').set(bearer(t.admin));
    const moderate = tracks.body.find((x: { name: string }) => x.name === 'ירידה מתונה');
    const user = await api().get(`/api/tracks/${moderate.id}/menus`).set(bearer(t.user));
    const admin = await api().get(`/api/tracks/${moderate.id}/menus`).set(bearer(t.admin));
    expect(user.body.map((m: { name: string }) => m.name)).not.toContain('תפריט ישן');
    expect(admin.body.map((m: { name: string }) => m.name)).toContain('תפריט ישן');
  });

  it('משתמש רגיל לא רואה תפריטים של מסלול מושבת', async () => {
    const tracks = await api().get('/api/tracks').set(bearer(t.admin));
    const inactive = tracks.body.find((x: { isActive: boolean }) => !x.isActive);
    const res = await api().get(`/api/tracks/${inactive.id}/menus`).set(bearer(t.user));
    expect(res.status).toBe(404);
  });
});

describe('כללי', () => {
  it('כתובת לא קיימת מחזירה 404', async () => {
    const res = await api().get('/api/nothing-here');
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('ROUTE_NOT_FOUND');
  });

  it('מזהה לא מספרי מחזיר 400', async () => {
    const res = await api().put('/api/weights/abc').set(bearer(t.user)).send({ date: '2026-01-01', weightKg: 80 });
    expect(res.status).toBe(400);
  });

  it('CORS מאפשר את כתובת ה-React שהוגדרה', async () => {
    const res = await api().options('/api/tracks').set('Origin', 'http://localhost:5173').set('Access-Control-Request-Method', 'GET');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('CORS לא מאפשר כתובת אחרת', async () => {
    const res = await api().get('/api/health').set('Origin', 'http://evil.example.com');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});
