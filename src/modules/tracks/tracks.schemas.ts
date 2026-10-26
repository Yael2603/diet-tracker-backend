import { text, z } from '../../lib/validation';

export const trackSchema = z.strictObject({
  name: text(2, 60),
  description: text(5, 500),
  type: z.enum(['LOSE', 'MAINTAIN', 'GAIN'], { error: 'סוג מסלול לא חוקי' }),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], { error: 'רמת קושי לא חוקית' }),
  dailyCalories: z.number().int('יש להזין מספר שלם').min(1000).max(4500),
  durationWeeks: z.number().int('יש להזין מספר שלם').min(1).max(104),
});
