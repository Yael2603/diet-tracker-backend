import { text, z } from '../../lib/validation';

const category = z.enum(['GRAINS', 'VEGETABLES', 'FRUITS', 'PROTEINS', 'DAIRY', 'FATS', 'DRINKS', 'SNACKS'], {
  error: 'קטגוריה לא חוקית',
});

export const foodSchema = z.strictObject({
  name: text(2, 60),
  category,
  servingDescription: text(1, 60),
  caloriesPerServing: z.number().int('יש להזין מספר שלם').min(0).max(2000),
});

export const foodQuerySchema = z.object({
  search: z.string().trim().max(60).optional(),
  category: category.optional(),
});
