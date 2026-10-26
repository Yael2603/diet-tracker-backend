import type { Request, Response } from 'express';
import { currentUser } from '../../middleware/auth';
import { parse } from '../../lib/parse';
import { idParam } from '../../lib/validation';
import { statusSchema } from '../../lib/common-schemas';
import { trackSchema } from './tracks.schemas';
import * as service from './tracks.service';

export async function list(req: Request, res: Response) {
  res.json(await service.listTracks(currentUser(req).role));
}

export async function create(req: Request, res: Response) {
  const body = parse(trackSchema, req.body);
  res.status(201).json(await service.createTrack(body));
}

export async function update(req: Request, res: Response) {
  const { id } = parse(idParam, req.params);
  const body = parse(trackSchema, req.body);
  res.json(await service.updateTrack(id, body));
}

export async function setStatus(req: Request, res: Response) {
  const { id } = parse(idParam, req.params);
  const { isActive } = parse(statusSchema, req.body);
  res.json(await service.setTrackStatus(id, isActive));
}
