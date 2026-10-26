import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import * as controller from './meals.controller';

// יומן האכילה של המשתמש המחובר בלבד
export const mealsRouter = Router();

mealsRouter.use(authenticate, requireRole('USER'));

mealsRouter.get('/', controller.getDay);
mealsRouter.post('/', controller.create);
mealsRouter.post('/from-menu', controller.createFromMenu);
mealsRouter.put('/:id', controller.update);
mealsRouter.delete('/:id', controller.remove);
