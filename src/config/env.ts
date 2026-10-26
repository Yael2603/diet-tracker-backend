import 'dotenv/config';
import { z } from 'zod';

// כל משתני הסביבה נבדקים כאן פעם אחת בעליית השרת.
// אם חסר משתנה חובה - השרת לא יעלה ויודפס הסבר ברור.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z
    .string({ error: 'DATABASE_URL חסר - יש להגדיר את כתובת מסד הנתונים' })
    .min(1, 'DATABASE_URL חסר - יש להגדיר את כתובת מסד הנתונים'),
  JWT_SECRET: z
    .string({ error: 'JWT_SECRET חסר - יש להגדיר מפתח סודי ארוך (לפחות 32 תווים)' })
    .min(32, 'JWT_SECRET חייב להכיל לפחות 32 תווים'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  // רשימת כתובות מופרדת בפסיקים, או * לכל הכתובות
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  APP_TIMEZONE: z.string().default('Asia/Jerusalem'),
  SEED_ON_START: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  SEED_ADMIN_EMAIL: z.string().optional(),
  SEED_ADMIN_PASSWORD: z.string().optional(),
  SEED_DEMO_USER_EMAIL: z.string().optional(),
  SEED_DEMO_USER_PASSWORD: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ שגיאה בהגדרות משתני הסביבה:');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;

export const corsOrigins: string[] | '*' =
  env.CORS_ORIGIN.trim() === '*'
    ? '*'
    : env.CORS_ORIGIN.split(',')
        .map((o) => o.trim())
        .filter(Boolean);
