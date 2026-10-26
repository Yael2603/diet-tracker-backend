import type { Request, Response } from 'express';
import { parse } from '../../lib/parse';
import { idParam } from '../../lib/validation';
import { statusSchema } from '../../lib/common-schemas';
import { userMealsQuerySchema, usersQuerySchema } from './admin.schemas';
import * as service from './admin.service';

export async function listUsers(req: Request, res: Response) {
  const { search } = parse(usersQuerySchema, req.query);
  res.json(await service.listUsers(search));
}

export async function getUser(req: Request, res: Response) {
  const { id } = parse(idParam, req.params);
  res.json(await service.getUserDetails(id));
}

export async function setUserStatus(req: Request, res: Response) {
  const { id } = parse(idParam, req.params);
  const { isActive } = parse(statusSchema, req.body);
  res.json(await service.setUserStatus(id, isActive));
}

export async function getUserMeals(req: Request, res: Response) {
  const { id } = parse(idParam, req.params);
  const { date, source } = parse(userMealsQuerySchema, req.query);
  res.json(await service.getUserMeals(id, date, source));
}
