import type { Request, Response } from 'express';
import { currentUser } from '../../middleware/auth';
import { parse } from '../../lib/parse';
import { idParam } from '../../lib/validation';
import { answerSchema, consultationQuerySchema, createConsultationSchema } from './consultations.schemas';
import * as service from './consultations.service';

export async function list(req: Request, res: Response) {
  const { status } = parse(consultationQuerySchema, req.query);
  res.json(await service.listConsultations(currentUser(req), status));
}

export async function create(req: Request, res: Response) {
  const body = parse(createConsultationSchema, req.body);
  res.status(201).json(await service.createConsultation(currentUser(req).id, body));
}

export async function answer(req: Request, res: Response) {
  const { id } = parse(idParam, req.params);
  const body = parse(answerSchema, req.body);
  res.json(await service.answerConsultation(id, body.answer));
}
