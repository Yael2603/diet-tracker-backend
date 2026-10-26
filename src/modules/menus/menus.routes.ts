import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import * as controller from './menus.controller';

// ניהול תפריטים - לדיאטן בלבד. (רשימת התפריטים של מסלול נמצאת ב-/api/tracks/:id/menus)
export const menusRouter = Router();

menusRouter.use(authenticate, requireRole('ADMIN'));

menusRouter.post('/', controller.create);
menusRouter.put('/:id', controller.update);
menusRouter.patch('/:id/status', controller.setStatus);
