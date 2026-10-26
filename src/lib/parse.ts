import type { z } from 'zod';
import { badRequest } from './errors';

/** בודק נתונים מול סכמת Zod. אם הם לא תקינים - נזרקת שגיאת 400 עם פירוט לפי שדה */
export function parse<T extends z.ZodType>(schema: T, data: unknown): z.infer<T> {
  const result = schema.safeParse(data ?? {});
  if (!result.success) {
    throw badRequest(
      'הנתונים שנשלחו אינם תקינים',
      result.error.issues.map((i) => ({
        field: i.path.join('.') || '_',
        message: i.message,
      })),
    );
  }
  return result.data;
}
