import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../lib/errors';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    status: 404,
    code: 'ROUTE_NOT_FOUND',
    message: `הכתובת ${req.method} ${req.originalUrl} לא קיימת`,
  });
}

// מטפל מרכזי בשגיאות - כל שגיאה מוחזרת באותו מבנה JSON
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.status).json({
      status: err.status,
      code: err.code,
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    });
    return;
  }

  // JSON שבור בגוף הבקשה
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ status: 400, code: 'INVALID_JSON', message: 'גוף הבקשה אינו JSON תקין' });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ status: 409, code: 'CONFLICT', message: 'קיימת כבר רשומה עם אותם ערכים' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ status: 404, code: 'NOT_FOUND', message: 'הפריט לא נמצא' });
      return;
    }
  }

  console.error('Unexpected error:', err);
  res.status(500).json({ status: 500, code: 'INTERNAL_ERROR', message: 'אירעה שגיאה בשרת, נסו שוב מאוחר יותר' });
}
