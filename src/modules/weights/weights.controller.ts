import type { Request, Response } from 'express';
import { currentUser } from '../../middleware/auth';
import { parse } from '../../lib/parse';
import { idParam } from '../../lib/validation';
import { weightSchema } from './weights.schemas';
import * as service from './weights.service';

export async function list(req: Request, res: Response) {
  res.json(await service.listWeights(currentUser(req).id));
}

export async function create(req: Request, res: Response) {
  const body = parse(weightSchema, req.body);
  res.status(201).json(await service.createWeight(currentUser(req).id, body));
}

export async function update(req: Request, res: Response) {
  const { id } = parse(idParam, req.params);
  const body = parse(weightSchema, req.body);
  res.json(await service.updateWeight(currentUser(req).id, id, body));
}

export async function remove(req: Request, res: Response) {
  const { id } = parse(idParam, req.params);
  await service.deleteWeight(currentUser(req).id, id);
  res.status(204).end();
}
