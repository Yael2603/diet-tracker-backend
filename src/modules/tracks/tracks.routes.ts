import { Router } from 'express';
import { authenticate, requireRole } from '../../middleware/auth';
import * as controller from './tracks.controller';
import * as menusController from '../menus/menus.controller';

export const tracksRouter = Router();

tracksRouter.use(authenticate);

tracksRouter.get('/', controller.list);
tracksRouter.get('/:id/menus', menusController.listOfTrack);
tracksRouter.post('/', requireRole('ADMIN'), controller.create);
tracksRouter.put('/:id', requireRole('ADMIN'), controller.update);
tracksRouter.patch('/:id/status', requireRole('ADMIN'), controller.setStatus);
