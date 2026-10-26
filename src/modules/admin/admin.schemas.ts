import { dateString, z } from '../../lib/validation';

export const usersQuerySchema = z.object({
  search: z.string().trim().max(120).optional(),
});

export const userMealsQuerySchema = z.object({
  date: dateString.optional(),
  source: z.enum(['MENU', 'OTHER'], { error: 'ערך source חייב להיות MENU או OTHER' }).optional(),
});
