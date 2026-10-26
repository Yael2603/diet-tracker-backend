import { execSync } from 'node:child_process';

// לפני כל הבדיקות: מחילים את כל ה-Migrations על מסד הבדיקות.
// הנתונים עצמם מתאפסים בכל קובץ בדיקות (resetDb ב-helpers.ts).
export default function setup() {
  const url = process.env.TEST_DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/diet_test?schema=public';
  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: { ...process.env, DATABASE_URL: url } });
}
