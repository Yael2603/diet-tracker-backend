import { dateString, pastOrTodayDate, z } from '../../lib/validation';

const mealType = z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'], { error: 'סוג ארוחה לא חוקי' });

export const mealSchema = z.strictObject({
  date: pastOrTodayDate,
  mealType,
  foodId: z.number().int().positive(),
  servings: z.number().min(0.25).max(20),
});

export const fromMenuSchema = z.strictObject({
  menuItemId: z.number().int().positive(),
  // אם לא נשלח תאריך - היום
  date: pastOrTodayDate.optional(),
});

export const dayQuerySchema = z.object({
  date: dateString.optional(),
  source: z.enum(['MENU', 'OTHER'], { error: 'ערך source חייב להיות MENU או OTHER' }).optional(),
});
