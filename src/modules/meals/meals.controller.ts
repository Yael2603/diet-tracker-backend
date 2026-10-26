import type { Request, Response } from 'express';
import { currentUser } from '../../middleware/auth';
import { parse } from '../../lib/parse';
import { idParam } from '../../lib/validation';
import { dayQuerySchema, fromMenuSchema, mealSchema } from './meals.schemas';
import * as service from './meals.service';

export async function getDay(req: Request, res: Response) {
  const query = parse(dayQuerySchema, req.query);
  res.json(await service.getDay(currentUser(req).id, query.date, query.source));
}

export async function create(req: Request, res: Response) {
  const body = parse(mealSchema, req.body);
  res.status(201).json(await service.createMeal(currentUser(req).id, body));
}

export async function createFromMenu(req: Request, res: Response) {
  const body = parse(fromMenuSchema, req.body);
  res.status(201).json(await service.createFromMenu(currentUser(req).id, body));
}

export async function update(req: Request, res: Response) {
  const { id } = parse(idParam, req.params);
  const body = parse(mealSchema, req.body);
  res.json(await service.updateMeal(currentUser(req).id, id, body));
}

export async function remove(req: Request, res: Response) {
  const { id } = parse(idParam, req.params);
  await service.deleteMeal(currentUser(req).id, id);
  res.status(204).end();
}
