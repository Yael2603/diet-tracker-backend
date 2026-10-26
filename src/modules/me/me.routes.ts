import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import * as controller from './me.controller';

// האזור האישי - למשתמש רגיל בלבד
export const meRouter = Router();

meRouter.use(authenticate, requireRole('USER'));

meRouter.get('/dashboard', controller.dashboard);
meRouter.put('/profile', controller.updateProfile);
meRouter.put('/plan', controller.updatePlan);
