import { Router } from 'express';
import { prisma } from '../../db/prisma';
import { LABELS, toOptions } from '../../lib/labels';

export const generalRouter = Router();

// בדיקת בריאות - משמשת גם את Render לבדיקה שהשרת חי
generalRouter.get('/health', async (_req, res) => {
  let database: 'up' | 'down' = 'up';
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    database = 'down';
  }
  res.status(database === 'up' ? 200 : 503).json({
    status: database === 'up' ? 'ok' : 'error',
    database,
    timestamp: new Date().toISOString(),
  });
});

// כל הרשימות לתיבות בחירה בטפסים, עם תוויות בעברית
generalRouter.get('/options', (_req, res) => {
  res.json({
    trackTypes: toOptions(LABELS.trackType),
    difficulties: toOptions(LABELS.difficulty),
    foodCategories: toOptions(LABELS.foodCategory),
    mealTypes: toOptions(LABELS.mealType),
    consultationStatuses: toOptions(LABELS.consultationStatus),
    mealSources: [
      { value: 'MENU', label: 'מהתפריט' },
      { value: 'OTHER', label: 'מחוץ לתפריט' },
    ],
  });
});
