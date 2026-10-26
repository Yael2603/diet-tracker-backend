import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../../config/env';
import { authenticate } from '../../middleware/auth';
import * as controller from './auth.controller';

export const authRouter = Router();

// הגבלת ניסיונות התחברות/הרשמה כדי להקשות על ניחוש סיסמאות
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.NODE_ENV === 'test' ? 1000 : 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { status: 429, code: 'TOO_MANY_REQUESTS', message: 'יותר מדי ניסיונות. נסו שוב בעוד כמה דקות' },
});

authRouter.post('/register', authLimiter, controller.register);
authRouter.post('/login', authLimiter, controller.login);
authRouter.get('/me', authenticate, controller.me);
