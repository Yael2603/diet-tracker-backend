import type { Request, Response } from 'express';
import { currentUser } from '../../middleware/auth';
import { parse } from '../../lib/parse';
import { idParam } from '../../lib/validation';
import { statusSchema } from '../../lib/common-schemas';
import { createMenuSchema, updateMenuSchema } from './menus.schemas';
import * as service from './menus.service';

export async function listOfTrack(req: Request, res: Response) {
  const { id } = parse(idParam, req.params);
  res.json(await service.listMenusOfTrack(id, currentUser(req)));
}

export async function create(req: Request, res: Response) {
  const body = parse(createMenuSchema, req.body);
  res.status(201).json(await service.createMenu(body));
}

export async function update(req: Request, res: Response) {
  const { id } = parse(idParam, req.params);
  const body = parse(updateMenuSchema, req.body);
  res.json(await service.updateMenu(id, body));
}

export async function setStatus(req: Request, res: Response) {
  const { id } = parse(idParam, req.params);
  const { isActive } = parse(statusSchema, req.body);
  res.json(await service.setMenuStatus(id, isActive));
}
