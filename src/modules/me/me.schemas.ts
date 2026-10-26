import { ageFromBirthDate } from '../../lib/dates';
import { dateString, text, z } from '../../lib/validation';

// כל השדות אופציונליים: שולחים רק את מה שרוצים לעדכן.
// אפשר לשלוח null כדי למחוק ערך (חוץ משם ומתג השיתוף).
export const updateProfileSchema = z
  .strictObject({
    fullName: text(2, 60).optional(),
    heightCm: z.number().int('יש להזין מספר שלם').min(100).max(250).nullable().optional(),
    startWeightKg: z.number().min(30).max(300).nullable().optional(),
    targetWeightKg: z.number().min(30).max(300).nullable().optional(),
    birthDate: dateString
      .refine((v) => ageFromBirthDate(v) >= 18, 'המערכת מיועדת לבני 18 ומעלה')
      .refine((v) => ageFromBirthDate(v) <= 120, 'תאריך לידה לא סביר')
      .nullable()
      .optional(),
    shareWithDietitian: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'יש לשלוח לפחות שדה אחד לעדכון' });

export const updatePlanSchema = z.strictObject({
  trackId: z.number().int().positive(),
  menuId: z.number().int().positive().nullable().optional(),
});
