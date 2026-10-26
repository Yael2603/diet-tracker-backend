import type { Role } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { conflict, notFound } from '../../lib/errors';
import { presentTrack } from '../../lib/presenters';

type TrackInput = {
  name: string;
  description: string;
  type: 'LOSE' | 'MAINTAIN' | 'GAIN';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  dailyCalories: number;
  durationWeeks: number;
};

export async function listTracks(role: Role) {
  const tracks = await prisma.track.findMany({
    // משתמש רגיל רואה רק מסלולים פעילים, ורק תפריטים פעילים נספרים עבורו
    where: role === 'ADMIN' ? {} : { isActive: true },
    include: {
      _count: { select: { menus: role === 'ADMIN' ? true : { where: { isActive: true } } } },
    },
    orderBy: [{ dailyCalories: 'asc' }, { id: 'asc' }],
  });
  return tracks.map(presentTrack);
}

async function ensureUniqueName(name: string, exceptId?: number) {
  const existing = await prisma.track.findUnique({ where: { name } });
  if (existing && existing.id !== exceptId) throw conflict('כבר קיים מסלול בשם הזה');
}

export async function createTrack(input: TrackInput) {
  await ensureUniqueName(input.name);
  return presentTrack(await prisma.track.create({ data: input }));
}

export async function updateTrack(id: number, input: TrackInput) {
  const track = await prisma.track.findUnique({ where: { id } });
  if (!track) throw notFound('המסלול לא נמצא');
  await ensureUniqueName(input.name, id);
  return presentTrack(await prisma.track.update({ where: { id }, data: input }));
}

export async function setTrackStatus(id: number, isActive: boolean) {
  const track = await prisma.track.findUnique({ where: { id } });
  if (!track) throw notFound('המסלול לא נמצא');
  return presentTrack(await prisma.track.update({ where: { id }, data: { isActive } }));
}
