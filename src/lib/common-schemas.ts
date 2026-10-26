import { z } from './validation';

export const statusSchema = z.strictObject({
  isActive: z.boolean(),
});
