import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import * as controller from './consultations.controller';

export const consultationsRouter = Router();

consultationsRouter.use(authenticate);

consultationsRouter.get('/', controller.list);
consultationsRouter.post('/', requireRole('USER'), controller.create);
consultationsRouter.patch('/:id/answer', requireRole('ADMIN'), controller.answer);
