import type { Request, Response } from 'express';
import { currentUser } from '../../middleware/auth';
import { parse } from '../../lib/parse';
import { loginSchema, registerSchema } from './auth.schemas';
import * as authService from './auth.service';

export async function register(req: Request, res: Response) {
  const body = parse(registerSchema, req.body);
  res.status(201).json(await authService.register(body));
}

export async function login(req: Request, res: Response) {
  const body = parse(loginSchema, req.body);
  res.json(await authService.login(body));
}

export async function me(req: Request, res: Response) {
  res.json(await authService.getMe(currentUser(req).id));
}
