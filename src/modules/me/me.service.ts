import { prisma } from '../../db/prisma';
import { badRequest, notFound } from '../../lib/errors';
import { toDbDate } from '../../lib/dates';
import { presentMenu, presentTrack, presentUser } from '../../lib/presenters';
import { getUserOverview } from '../shared/overview.service';

export const getDashboard = (userId: number) => getUserOverview(userId);

export async function updateProfile(
  userId: number,
  input: {
    fullName?: string;
    heightCm?: number | null;
    startWeightKg?: number | null;
    targetWeightKg?: number | null;
    birthDate?: string | null;
    shareWithDietitian?: boolean;
  },
) {
  const { birthDate, ...rest } = input;
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...rest,
      ...(birthDate !== undefined ? { birthDate: birthDate ? toDbDate(birthDate) : null } : {}),
    },
  });
  return presentUser(user);
}

export async function updatePlan(userId: number, input: { trackId: number; menuId?: number | null }) {
  const track = await prisma.track.findUnique({ where: { id: input.trackId } });
  if (!track || !track.isActive) throw notFound('המסלול לא נמצא או שאינו פעיל');

  let menu = null;
  if (input.menuId != null) {
    menu = await prisma.menu.findUnique({
      where: { id: input.menuId },
      include: { items: { include: { food: true } } },
    });
    if (!menu || !menu.isActive) throw notFound('התפריט לא נמצא או שאינו פעיל');
    if (menu.trackId !== track.id) throw badRequest('התפריט שנבחר אינו שייך למסלול שנבחר', [
      { field: 'menuId', message: 'יש לבחור תפריט מתוך התפריטים של המסלול' },
    ]);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { trackId: track.id, menuId: menu?.id ?? null },
  });

  return {
    user: presentUser(user),
    track: presentTrack(track),
    menu: menu ? presentMenu(menu) : null,
  };
}
