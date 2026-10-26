import type { Request, Response } from 'express';
import { currentUser } from '../../middleware/auth';
import { parse } from '../../lib/parse';
import { updatePlanSchema, updateProfileSchema } from './me.schemas';
import * as service from './me.service';

export async function dashboard(req: Request, res: Response) {
  res.json(await service.getDashboard(currentUser(req).id));
}

export async function updateProfile(req: Request, res: Response) {
  const body = parse(updateProfileSchema, req.body);
  res.json(await service.updateProfile(currentUser(req).id, body));
}

export async function updatePlan(req: Request, res: Response) {
  const body = parse(updatePlanSchema, req.body);
  res.json(await service.updatePlan(currentUser(req).id, body));
}
