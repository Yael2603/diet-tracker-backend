import { text, z } from '../../lib/validation';

const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(120)
  .pipe(z.email({ error: 'כתובת אימייל לא תקינה' }));

export const registerSchema = z.strictObject({
  fullName: text(2, 60),
  email,
  password: z
    .string()
    .min(8, 'הסיסמה חייבת להכיל לפחות 8 תווים')
    .max(72, 'הסיסמה ארוכה מדי')
    .regex(/[A-Za-z]/, 'הסיסמה חייבת להכיל לפחות אות אחת באנגלית')
    .regex(/\d/, 'הסיסמה חייבת להכיל לפחות ספרה אחת'),
});

export const loginSchema = z.strictObject({
  email,
  password: z.string().min(1, 'יש להזין סיסמה'),
});
