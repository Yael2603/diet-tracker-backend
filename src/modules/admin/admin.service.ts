import type { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { forbidden, notFound } from '../../lib/errors';
import { todayString } from '../../lib/dates';
import { presentUser, presentWeight } from '../../lib/presenters';
import { getDaySummary, getUserOverview, type MealSource } from '../shared/overview.service';

const NOT_SHARING_MESSAGE = 'המשתמש לא שיתף את המידע שלו עם הדיאטן';

export async function listUsers(search?: string) {
  const where: Prisma.UserWhereInput = {
    role: 'USER',
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
  const users = await prisma.user.findMany({
    where,
    include: {
      track: { select: { id: true, name: true } },
      _count: { select: { consultations: { where: { status: 'PENDING' } } } },
    },
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
  });

  // ברשימה מוצגים רק פרטים כלליים - בלי משקלים ובלי יומן
  return users.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    isActive: u.isActive,
    shareWithDietitian: u.shareWithDietitian,
    track: u.track,
    pendingConsultations: u._count.consultations,
    createdAt: u.createdAt,
  }));
}

async function findRegularUser(id: number) {
  const user = await prisma.user.findFirst({ where: { id, role: 'USER' } });
  if (!user) throw notFound('המשתמש לא נמצא');
  return user;
}

export async function getUserDetails(id: number) {
  const user = await findRegularUser(id);

  if (!user.shareWithDietitian) {
    const basic = presentUser(user);
    return {
      user: {
        id: basic.id,
        fullName: basic.fullName,
        email: basic.email,
        isActive: basic.isActive,
        shareWithDietitian: false,
        createdAt: basic.createdAt,
      },
      sharing: false,
      message: NOT_SHARING_MESSAGE,
      overview: null,
      weights: null,
    };
  }

  const overview = await getUserOverview(id);
  const weights = await prisma.weightEntry.findMany({ where: { userId: id }, orderBy: { date: 'desc' } });
  return {
    user: overview.user,
    sharing: true,
    message: null,
    overview: { track: overview.track, menu: overview.menu, progress: overview.progress, today: overview.today },
    weights: weights.map(presentWeight),
  };
}

export async function setUserStatus(id: number, isActive: boolean) {
  await findRegularUser(id);
  const user = await prisma.user.update({ where: { id }, data: { isActive } });
  return presentUser(user);
}

export async function getUserMeals(id: number, date?: string, source?: MealSource) {
  const user = await findRegularUser(id);
  if (!user.shareWithDietitian) throw forbidden(NOT_SHARING_MESSAGE);
  return getDaySummary(id, date ?? todayString(), source);
}
