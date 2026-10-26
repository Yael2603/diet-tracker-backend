import { beforeAll, describe, expect, it } from 'vitest';
import jwt from 'jsonwebtoken';
import { api, bearer, login, prisma, resetDb, userId } from './helpers';

beforeAll(resetDb);

describe('POST /api/auth/login', () => {
  it('התחברות תקינה מחזירה Token ומשתמש ללא סיסמה', async () => {
    const res = await api().post('/api/auth/login').send({ email: 'user@example.com', password: 'User1234' });
    expect(res.status).toBe(200);
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user).toMatchObject({ email: 'user@example.com', role: 'USER' });
    expect(res.body.user.passwordHash).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('$2');
  });

  it('אימייל לא תלוי באותיות גדולות/קטנות', async () => {
    const res = await api().post('/api/auth/login').send({ email: 'USER@Example.com', password: 'User1234' });
    expect(res.status).toBe(200);
  });

  it('סיסמה שגויה מחזירה 401', async () => {
    const res = await api().post('/api/auth/login').send({ email: 'user@example.com', password: 'Wrong1234' });
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ status: 401, code: 'UNAUTHORIZED', message: 'אימייל או סיסמה שגויים' });
  });

  it('אימייל לא קיים מחזיר 401 עם אותה הודעה', async () => {
    const res = await api().post('/api/auth/login').send({ email: 'nobody@example.com', password: 'User1234' });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('אימייל או סיסמה שגויים');
  });

  it('נתונים חסרים מחזירים 400 עם פירוט', async () => {
    const res = await api().post('/api/auth/login').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
    const fields = res.body.details.map((d: { field: string }) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['email', 'password']));
  });

  it('JSON שבור מחזיר 400', async () => {
    const res = await api().post('/api/auth/login').set('Content-Type', 'application/json').send('{bad json');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_JSON');
  });
});

describe('POST /api/auth/register', () => {
  it('הרשמה יוצרת משתמש רגיל ומחזירה Token', async () => {
    const res = await api().post('/api/auth/register').send({ fullName: 'דוד כהן', email: 'David@Example.com', password: 'Pass1234' });
    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ email: 'david@example.com', role: 'USER', shareWithDietitian: false });
    expect(res.body.user.passwordHash).toBeUndefined();

    const me = await api().get('/api/auth/me').set(bearer(res.body.token));
    expect(me.status).toBe(200);
    expect(me.body.email).toBe('david@example.com');

    const stored = await prisma.user.findUniqueOrThrow({ where: { email: 'david@example.com' } });
    expect(stored.passwordHash).not.toBe('Pass1234');
  });

  it('אימייל קיים מחזיר 409', async () => {
    const res = await api().post('/api/auth/register').send({ fullName: 'כפול', email: 'user@example.com', password: 'Pass1234' });
    expect(res.status).toBe(409);
  });

  it('סיסמה חלשה מחזירה 400', async () => {
    const res = await api().post('/api/auth/register').send({ fullName: 'חלש', email: 'weak@example.com', password: 'abc' });
    expect(res.status).toBe(400);
    expect(res.body.details[0].field).toBe('password');
  });

  it('אי אפשר להירשם כמנהל', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ fullName: 'מנסה', email: 'hacker@example.com', password: 'Pass1234', role: 'ADMIN' });
    expect(res.status).toBe(400);
    expect(await prisma.user.findUnique({ where: { email: 'hacker@example.com' } })).toBeNull();
  });
});

describe('GET /api/auth/me ו-Token', () => {
  it('ללא Token מחזיר 401', async () => {
    const res = await api().get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('Token לא תקין מחזיר 401', async () => {
    const res = await api().get('/api/auth/me').set(bearer('not.a.token'));
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token לא תקין');
  });

  it('Token שנחתם בסוד אחר מחזיר 401', async () => {
    const fake = jwt.sign({ sub: '1', role: 'ADMIN' }, 'some-other-secret-some-other-secret');
    const res = await api().get('/api/auth/me').set(bearer(fake));
    expect(res.status).toBe(401);
  });

  it('Token שפג תוקפו מחזיר 401 עם הודעה מתאימה', async () => {
    const id = await userId('user@example.com');
    const expired = jwt.sign({ sub: String(id), role: 'USER', exp: Math.floor(Date.now() / 1000) - 60 }, process.env.JWT_SECRET!);
    const res = await api().get('/api/auth/me').set(bearer(expired));
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('פג');
  });

  it('תפקיד נקבע לפי מסד הנתונים ולא לפי ה-Token', async () => {
    // Token חתום נכון אבל עם role=ADMIN למשתמש רגיל - עדיין אין גישת מנהל
    const id = await userId('user@example.com');
    const forged = jwt.sign({ sub: String(id), role: 'ADMIN' }, process.env.JWT_SECRET!);
    const res = await api().get('/api/admin/users').set(bearer(forged));
    expect(res.status).toBe(403);
  });
});

describe('משתמש חסום', () => {
  it('לא יכול להתחבר, וה-Token הקיים שלו מפסיק לעבוד', async () => {
    const userToken = await login('user2@example.com', 'User1234');
    const adminToken = await login('admin@example.com', 'Admin1234');
    const id = await userId('user2@example.com');

    const block = await api().patch(`/api/admin/users/${id}/status`).set(bearer(adminToken)).send({ isActive: false });
    expect(block.status).toBe(200);
    expect(block.body.isActive).toBe(false);

    expect((await api().get('/api/auth/me').set(bearer(userToken))).status).toBe(403);
    const res = await api().post('/api/auth/login').send({ email: 'user2@example.com', password: 'User1234' });
    expect(res.status).toBe(403);

    await api().patch(`/api/admin/users/${id}/status`).set(bearer(adminToken)).send({ isActive: true });
    expect((await api().get('/api/auth/me').set(bearer(userToken))).status).toBe(200);
  });
});
