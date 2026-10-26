import { pastOrTodayDate, z } from '../../lib/validation';

export const weightSchema = z.strictObject({
  date: pastOrTodayDate,
  weightKg: z.number().min(30).max(300),
  note: z.string().trim().max(200).nullable().optional(),
});
