import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import * as controller from './foods.controller';

export const foodsRouter = Router();

foodsRouter.use(authenticate);

foodsRouter.get('/', controller.list);
foodsRouter.post('/', requireRole('ADMIN'), controller.create);
foodsRouter.put('/:id', requireRole('ADMIN'), controller.update);
foodsRouter.patch('/:id/status', requireRole('ADMIN'), controller.setStatus);
