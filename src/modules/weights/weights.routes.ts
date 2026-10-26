import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import * as controller from './weights.controller';

// השקילות של המשתמש המחובר בלבד
export const weightsRouter = Router();

weightsRouter.use(authenticate, requireRole('USER'));

weightsRouter.get('/', controller.list);
weightsRouter.post('/', controller.create);
weightsRouter.put('/:id', controller.update);
weightsRouter.delete('/:id', controller.remove);
