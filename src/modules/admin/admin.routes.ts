import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import * as controller from './admin.controller';

// ניהול משתמשים - לדיאטן בלבד
export const adminRouter = Router();

adminRouter.use(authenticate, requireRole('ADMIN'));

adminRouter.get('/users', controller.listUsers);
adminRouter.get('/users/:id', controller.getUser);
adminRouter.patch('/users/:id/status', controller.setUserStatus);
adminRouter.get('/users/:id/meals', controller.getUserMeals);
