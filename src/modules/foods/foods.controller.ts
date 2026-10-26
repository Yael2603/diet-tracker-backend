import type { Request, Response } from 'express';
import { currentUser } from '../../middleware/auth';
import { parse } from '../../lib/parse';
import { idParam } from '../../lib/validation';
import { statusSchema } from '../../lib/common-schemas';
import { foodQuerySchema, foodSchema } from './foods.schemas';
import * as service from './foods.service';

export async function list(req: Request, res: Response) {
  const query = parse(foodQuerySchema, req.query);
  res.json(await service.listFoods(currentUser(req).role, query));
}

export async function create(req: Request, res: Response) {
  const body = parse(foodSchema, req.body);
  res.status(201).json(await service.createFood(body));
}

export async function update(req: Request, res: Response) {
  const { id } = parse(idParam, req.params);
  const body = parse(foodSchema, req.body);
  res.json(await service.updateFood(id, body));
}

export async function setStatus(req: Request, res: Response) {
  const { id } = parse(idParam, req.params);
  const { isActive } = parse(statusSchema, req.body);
  res.json(await service.setFoodStatus(id, isActive));
}
