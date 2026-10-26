import type { ConsultationStatus, Role } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { forbidden, notFound } from '../../lib/errors';
import { presentConsultation } from '../../lib/presenters';

export async function listConsultations(viewer: { id: number; role: Role }, status?: ConsultationStatus) {
  const isAdmin = viewer.role === 'ADMIN';
  const list = await prisma.consultation.findMany({
    // משתמש רגיל רואה רק את הפניות שלו
    where: { ...(isAdmin ? {} : { userId: viewer.id }), ...(status ? { status } : {}) },
    include: isAdmin ? { user: { select: { id: true, fullName: true, email: true } } } : undefined,
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });
  return list.map(presentConsultation);
}

export async function createConsultation(userId: number, input: { subject: string; message: string }) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { shareWithDietitian: true } });
  if (!user?.shareWithDietitian) {
    throw forbidden('כדי לשלוח פנייה יש להפעיל קודם שיתוף מידע עם הדיאטן');
  }
  const consultation = await prisma.consultation.create({ data: { userId, ...input } });
  return presentConsultation(consultation);
}

export async function answerConsultation(id: number, answer: string) {
  const existing = await prisma.consultation.findUnique({ where: { id } });
  if (!existing) throw notFound('הפנייה לא נמצאה');
  // אפשר גם לעדכן תשובה קיימת
  const updated = await prisma.consultation.update({
    where: { id },
    data: { answer, status: 'ANSWERED', answeredAt: new Date() },
    include: { user: { select: { id: true, fullName: true, email: true } } },
  });
  return presentConsultation(updated);
}
