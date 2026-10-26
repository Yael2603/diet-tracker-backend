import { Router } from 'express';
import { generalRouter } from './modules/general/general.routes';
import { authRouter } from './modules/auth/auth.routes';
import { meRouter } from './modules/me/me.routes';
import { tracksRouter } from './modules/tracks/tracks.routes';
import { menusRouter } from './modules/menus/menus.routes';
import { foodsRouter } from './modules/foods/foods.routes';
import { weightsRouter } from './modules/weights/weights.routes';
import { mealsRouter } from './modules/meals/meals.routes';
import { consultationsRouter } from './modules/consultations/consultations.routes';
import { adminRouter } from './modules/admin/admin.routes';

// כל הנתיבים של ה-API, תחת הקידומת /api
export const apiRouter = Router();

apiRouter.use('/', generalRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/me', meRouter);
apiRouter.use('/tracks', tracksRouter);
apiRouter.use('/menus', menusRouter);
apiRouter.use('/foods', foodsRouter);
apiRouter.use('/weights', weightsRouter);
apiRouter.use('/meals', mealsRouter);
apiRouter.use('/consultations', consultationsRouter);
apiRouter.use('/admin', adminRouter);
