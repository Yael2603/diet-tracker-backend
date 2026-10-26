import { text, z } from '../../lib/validation';

export const createConsultationSchema = z.strictObject({
  subject: text(3, 100),
  message: text(5, 2000),
});

export const answerSchema = z.strictObject({
  answer: text(2, 2000),
});

export const consultationQuerySchema = z.object({
  status: z.enum(['PENDING', 'ANSWERED'], { error: 'סטטוס חייב להיות PENDING או ANSWERED' }).optional(),
});
