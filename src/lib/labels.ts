// תוויות בעברית לכל ערכי הבחירה - מוחזרות ב-GET /api/options
export const LABELS = {
  role: { USER: 'משתמש', ADMIN: 'דיאטן/מנהל' },
  trackType: { LOSE: 'ירידה במשקל', MAINTAIN: 'שמירה על משקל', GAIN: 'עלייה במשקל' },
  difficulty: { EASY: 'קל', MEDIUM: 'בינוני', HARD: 'מאתגר' },
  foodCategory: {
    GRAINS: 'דגנים',
    VEGETABLES: 'ירקות',
    FRUITS: 'פירות',
    PROTEINS: 'חלבונים',
    DAIRY: 'מוצרי חלב',
    FATS: 'שומנים',
    DRINKS: 'משקאות',
    SNACKS: 'חטיפים',
  },
  mealType: { BREAKFAST: 'בוקר', LUNCH: 'צהריים', DINNER: 'ערב', SNACK: 'ביניים' },
  consultationStatus: { PENDING: 'ממתינה לתשובה', ANSWERED: 'נענתה' },
} as const;

export function toOptions<T extends Record<string, string>>(map: T) {
  return Object.entries(map).map(([value, label]) => ({ value, label }));
}
