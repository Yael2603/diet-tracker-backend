import { z } from 'zod';
import { isValidDateString, todayString } from './dates';

// הודעות שגיאה בעברית כברירת מחדל לכל הסכמות
z.config({
  customError: (issue) => {
    switch (issue.code) {
      case 'invalid_type':
        return issue.input === undefined ? 'שדה חובה' : 'סוג הערך אינו תקין';
      case 'too_small':
        if (issue.origin === 'string') return `יש להזין לפחות ${issue.minimum} תווים`;
        if (issue.origin === 'array') return `יש להזין לפחות ${issue.minimum} פריטים`;
        return `הערך חייב להיות לפחות ${issue.minimum}`;
      case 'too_big':
        if (issue.origin === 'string') return `ניתן להזין עד ${issue.maximum} תווים`;
        if (issue.origin === 'array') return `ניתן להזין עד ${issue.maximum} פריטים`;
        return `הערך חייב להיות לכל היותר ${issue.maximum}`;
      case 'invalid_value':
        return 'ערך לא חוקי';
      case 'invalid_format':
        return 'פורמט לא תקין';
      case 'unrecognized_keys':
        return `שדות לא מוכרים: ${issue.keys.join(', ')}`;
      default:
        return 'ערך לא תקין';
    }
  },
});

export const idParam = z.object({
  id: z.coerce.number({ error: 'מזהה לא תקין' }).int('מזהה לא תקין').positive('מזהה לא תקין'),
});

export const dateString = z
  .string()
  .refine(isValidDateString, 'תאריך לא תקין, יש להשתמש בפורמט YYYY-MM-DD');

/** תאריך שאינו בעתיד */
export const pastOrTodayDate = dateString.refine(
  (v) => v <= todayString(),
  'לא ניתן להזין תאריך עתידי',
);

/** מחרוזת שעוברת trim לפני הבדיקה */
export const text = (min: number, max: number) => z.string().trim().min(min).max(max);

export { z };
