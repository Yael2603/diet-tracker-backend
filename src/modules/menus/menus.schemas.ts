import { text, z } from '../../lib/validation';

const menuItemSchema = z.strictObject({
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'], { error: 'סוג ארוחה לא חוקי' }),
  foodId: z.number().int().positive(),
  servings: z.number().min(0.25).max(20),
});

const items = z
  .array(menuItemSchema)
  .min(1, 'תפריט חייב להכיל לפחות פריט אחד')
  .max(40)
  .refine(
    (list) => new Set(list.map((i) => `${i.mealType}:${i.foodId}`)).size === list.length,
    'אותו מאכל מופיע פעמיים באותה ארוחה',
  );

const description = z.string().trim().max(500).nullable().optional();

export const createMenuSchema = z.strictObject({
  trackId: z.number().int().positive(),
  name: text(2, 60),
  description,
  items,
});

// בעריכה שולחים את כל רשימת הפריטים מחדש (היא מחליפה את הקודמת)
export const updateMenuSchema = z.strictObject({
  name: text(2, 60),
  description,
  items,
});
