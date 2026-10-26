import { env } from '../config/env';

// כל התאריכים במערכת נשמרים כ"יום" בלבד (YYYY-MM-DD), ללא שעה.

export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** התאריך של היום לפי אזור הזמן של המערכת, בפורמט YYYY-MM-DD */
export function todayString(): string {
  // en-CA מחזיר פורמט YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: env.APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** האם מחרוזת היא תאריך אמיתי (למשל 2026-02-30 אינו תאריך אמיתי) */
export function isValidDateString(value: string): boolean {
  if (!DATE_REGEX.test(value)) return false;
  const d = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/** הופך מחרוזת YYYY-MM-DD לאובייקט Date לשמירה במסד הנתונים */
export function toDbDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

/** הופך תאריך ממסד הנתונים חזרה למחרוזת YYYY-MM-DD */
export function fromDbDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/** גיל בשנים שלמות לפי תאריך לידה */
export function ageFromBirthDate(birthDate: string, today = todayString()): number {
  const [by, bm, bd] = birthDate.split('-').map(Number) as [number, number, number];
  const [ty, tm, td] = today.split('-').map(Number) as [number, number, number];
  let age = ty - by;
  if (tm < bm || (tm === bm && td < bd)) age -= 1;
  return age;
}
