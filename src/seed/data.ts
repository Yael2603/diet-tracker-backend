// נתוני הדגמה מומצאים בלבד
import type { Difficulty, FoodCategory, MealType, TrackType } from '@prisma/client';

export const FOODS: { name: string; category: FoodCategory; servingDescription: string; caloriesPerServing: number; isActive?: boolean }[] = [
  { name: 'לחם מלא', category: 'GRAINS', servingDescription: '2 פרוסות', caloriesPerServing: 140 },
  { name: 'אורז מלא מבושל', category: 'GRAINS', servingDescription: 'כוס', caloriesPerServing: 215 },
  { name: 'פסטה מבושלת', category: 'GRAINS', servingDescription: 'כוס', caloriesPerServing: 200 },
  { name: 'שיבולת שועל', category: 'GRAINS', servingDescription: 'חצי כוס', caloriesPerServing: 150 },
  { name: 'פיתה', category: 'GRAINS', servingDescription: 'יחידה', caloriesPerServing: 250 },
  { name: 'קוסקוס מבושל', category: 'GRAINS', servingDescription: 'כוס', caloriesPerServing: 175 },
  { name: 'סלט ירקות', category: 'VEGETABLES', servingDescription: 'קערה בינונית', caloriesPerServing: 60 },
  { name: 'מלפפון', category: 'VEGETABLES', servingDescription: 'יחידה', caloriesPerServing: 15 },
  { name: 'עגבנייה', category: 'VEGETABLES', servingDescription: 'יחידה', caloriesPerServing: 22 },
  { name: 'ברוקולי מאודה', category: 'VEGETABLES', servingDescription: 'כוס', caloriesPerServing: 55 },
  { name: 'גזר', category: 'VEGETABLES', servingDescription: 'יחידה', caloriesPerServing: 25 },
  { name: 'תפוח אדמה אפוי', category: 'VEGETABLES', servingDescription: 'יחידה בינונית', caloriesPerServing: 160 },
  { name: 'תפוח', category: 'FRUITS', servingDescription: 'יחידה', caloriesPerServing: 80 },
  { name: 'בננה', category: 'FRUITS', servingDescription: 'יחידה', caloriesPerServing: 105 },
  { name: 'תפוז', category: 'FRUITS', servingDescription: 'יחידה', caloriesPerServing: 60 },
  { name: 'ענבים', category: 'FRUITS', servingDescription: 'כוס', caloriesPerServing: 105 },
  { name: 'אבטיח', category: 'FRUITS', servingDescription: 'פרוסה', caloriesPerServing: 85 },
  { name: 'חזה עוף בגריל', category: 'PROTEINS', servingDescription: '150 גרם', caloriesPerServing: 250 },
  { name: 'ביצה קשה', category: 'PROTEINS', servingDescription: 'יחידה', caloriesPerServing: 78 },
  { name: 'טונה במים', category: 'PROTEINS', servingDescription: 'קופסה', caloriesPerServing: 120 },
  { name: 'סלמון אפוי', category: 'PROTEINS', servingDescription: '150 גרם', caloriesPerServing: 300 },
  { name: 'עדשים מבושלות', category: 'PROTEINS', servingDescription: 'כוס', caloriesPerServing: 230 },
  { name: 'חומוס', category: 'PROTEINS', servingDescription: '3 כפות', caloriesPerServing: 150 },
  { name: 'יוגורט 3%', category: 'DAIRY', servingDescription: 'גביע', caloriesPerServing: 120 },
  { name: 'גבינה לבנה 5%', category: 'DAIRY', servingDescription: '100 גרם', caloriesPerServing: 95 },
  { name: "קוטג' 5%", category: 'DAIRY', servingDescription: '100 גרם', caloriesPerServing: 100 },
  { name: 'חלב 1%', category: 'DAIRY', servingDescription: 'כוס', caloriesPerServing: 100 },
  { name: 'גבינה צהובה 9%', category: 'DAIRY', servingDescription: '2 פרוסות', caloriesPerServing: 140 },
  { name: 'שמן זית', category: 'FATS', servingDescription: 'כף', caloriesPerServing: 120 },
  { name: 'אבוקדו', category: 'FATS', servingDescription: 'חצי יחידה', caloriesPerServing: 160 },
  { name: 'אגוזי מלך', category: 'FATS', servingDescription: 'חופן', caloriesPerServing: 185 },
  { name: 'טחינה גולמית', category: 'FATS', servingDescription: 'כף', caloriesPerServing: 90 },
  { name: 'מים', category: 'DRINKS', servingDescription: 'כוס', caloriesPerServing: 0 },
  { name: 'קפה עם חלב', category: 'DRINKS', servingDescription: 'כוס', caloriesPerServing: 40 },
  { name: 'מיץ תפוזים טבעי', category: 'DRINKS', servingDescription: 'כוס', caloriesPerServing: 110 },
  { name: 'עוגייה', category: 'SNACKS', servingDescription: 'יחידה', caloriesPerServing: 80 },
  { name: 'חטיף אנרגיה', category: 'SNACKS', servingDescription: 'יחידה', caloriesPerServing: 190 },
  { name: 'שוקולד מריר', category: 'SNACKS', servingDescription: '2 קוביות', caloriesPerServing: 110 },
  { name: 'פופקורן', category: 'SNACKS', servingDescription: 'קערה', caloriesPerServing: 100 },
  // מאכל לא פעיל - לבדיקה שמשתמשים לא רואים אותו
  { name: 'עוגת קרם', category: 'SNACKS', servingDescription: 'פרוסה', caloriesPerServing: 350, isActive: false },
];

type MenuSeed = {
  name: string;
  description: string;
  isActive?: boolean;
  items: { mealType: MealType; food: string; servings: number }[];
};

export const TRACKS: {
  name: string;
  description: string;
  type: TrackType;
  difficulty: Difficulty;
  dailyCalories: number;
  durationWeeks: number;
  isActive?: boolean;
  menus: MenuSeed[];
}[] = [
  {
    name: 'ירידה מהירה',
    description: 'ירידה של כקילו בשבוע. מתאים למי שמוכן להקפדה גבוהה לתקופה קצרה.',
    type: 'LOSE',
    difficulty: 'HARD',
    dailyCalories: 1500,
    durationWeeks: 8,
    menus: [
      {
        name: 'תפריט קליל',
        description: 'ארוחות קטנות ומשביעות',
        items: [
          { mealType: 'BREAKFAST', food: 'שיבולת שועל', servings: 1 },
          { mealType: 'BREAKFAST', food: 'חלב 1%', servings: 1 },
          { mealType: 'LUNCH', food: 'חזה עוף בגריל', servings: 1 },
          { mealType: 'LUNCH', food: 'ברוקולי מאודה', servings: 2 },
          { mealType: 'DINNER', food: 'טונה במים', servings: 1 },
          { mealType: 'DINNER', food: 'סלט ירקות', servings: 1 },
          { mealType: 'DINNER', food: 'לחם מלא', servings: 1 },
          { mealType: 'SNACK', food: 'תפוח', servings: 1 },
        ],
      },
      {
        name: 'תפריט צמחי',
        description: 'מבוסס קטניות וירקות',
        items: [
          { mealType: 'BREAKFAST', food: 'לחם מלא', servings: 1 },
          { mealType: 'BREAKFAST', food: 'חומוס', servings: 1 },
          { mealType: 'LUNCH', food: 'עדשים מבושלות', servings: 1 },
          { mealType: 'LUNCH', food: 'סלט ירקות', servings: 1 },
          { mealType: 'DINNER', food: 'תפוח אדמה אפוי', servings: 1 },
          { mealType: 'DINNER', food: 'ברוקולי מאודה', servings: 1 },
          { mealType: 'SNACK', food: 'תפוז', servings: 1 },
        ],
      },
    ],
  },
  {
    name: 'ירידה מתונה',
    description: 'ירידה הדרגתית של כחצי קילו בשבוע, בלי לוותר על ארוחות מלאות.',
    type: 'LOSE',
    difficulty: 'MEDIUM',
    dailyCalories: 1800,
    durationWeeks: 12,
    menus: [
      {
        name: 'תפריט חלבי',
        description: 'בוקר וערב חלביים, צהריים בשרי',
        items: [
          { mealType: 'BREAKFAST', food: 'לחם מלא', servings: 1 },
          { mealType: 'BREAKFAST', food: 'גבינה לבנה 5%', servings: 1 },
          { mealType: 'BREAKFAST', food: 'סלט ירקות', servings: 1 },
          { mealType: 'BREAKFAST', food: 'קפה עם חלב', servings: 1 },
          { mealType: 'LUNCH', food: 'חזה עוף בגריל', servings: 1 },
          { mealType: 'LUNCH', food: 'אורז מלא מבושל', servings: 1 },
          { mealType: 'LUNCH', food: 'סלט ירקות', servings: 1 },
          { mealType: 'DINNER', food: 'יוגורט 3%', servings: 1 },
          { mealType: 'DINNER', food: 'ביצה קשה', servings: 2 },
          { mealType: 'DINNER', food: 'לחם מלא', servings: 1 },
          { mealType: 'SNACK', food: 'בננה', servings: 1 },
          { mealType: 'SNACK', food: 'אגוזי מלך', servings: 1 },
        ],
      },
      {
        name: 'תפריט בשרי',
        description: 'שתי ארוחות בשריות ביום',
        items: [
          { mealType: 'BREAKFAST', food: 'שיבולת שועל', servings: 1 },
          { mealType: 'BREAKFAST', food: 'חלב 1%', servings: 1 },
          { mealType: 'LUNCH', food: 'חזה עוף בגריל', servings: 1 },
          { mealType: 'LUNCH', food: 'קוסקוס מבושל', servings: 1 },
          { mealType: 'LUNCH', food: 'גזר', servings: 1 },
          { mealType: 'DINNER', food: 'סלמון אפוי', servings: 1 },
          { mealType: 'DINNER', food: 'ברוקולי מאודה', servings: 1 },
          { mealType: 'SNACK', food: 'ענבים', servings: 1 },
          { mealType: 'SNACK', food: 'אבוקדו', servings: 1 },
        ],
      },
      {
        name: 'תפריט ישן',
        description: 'תפריט שהושבת - לבדיקה',
        isActive: false,
        items: [{ mealType: 'LUNCH', food: 'פסטה מבושלת', servings: 1 }],
      },
    ],
  },
  {
    name: 'שמירה על משקל',
    description: 'אכילה מאוזנת לשמירה על המשקל הנוכחי לאורך זמן.',
    type: 'MAINTAIN',
    difficulty: 'EASY',
    dailyCalories: 2200,
    durationWeeks: 26,
    menus: [
      {
        name: 'תפריט מאוזן',
        description: 'שילוב של כל קבוצות המזון',
        items: [
          { mealType: 'BREAKFAST', food: 'פיתה', servings: 1 },
          { mealType: 'BREAKFAST', food: 'ביצה קשה', servings: 2 },
          { mealType: 'BREAKFAST', food: 'עגבנייה', servings: 1 },
          { mealType: 'LUNCH', food: 'סלמון אפוי', servings: 1 },
          { mealType: 'LUNCH', food: 'אורז מלא מבושל', servings: 1 },
          { mealType: 'LUNCH', food: 'סלט ירקות', servings: 1 },
          { mealType: 'DINNER', food: 'גבינה צהובה 9%', servings: 1 },
          { mealType: 'DINNER', food: 'לחם מלא', servings: 1 },
          { mealType: 'DINNER', food: 'אבוקדו', servings: 1 },
          { mealType: 'SNACK', food: 'יוגורט 3%', servings: 1 },
          { mealType: 'SNACK', food: 'אגוזי מלך', servings: 1 },
        ],
      },
    ],
  },
  {
    name: 'עלייה מבוקרת',
    description: 'עלייה הדרגתית במשקל באמצעות ארוחות עשירות ומזינות.',
    type: 'GAIN',
    difficulty: 'MEDIUM',
    dailyCalories: 2700,
    durationWeeks: 12,
    menus: [
      {
        name: 'תפריט עשיר',
        description: 'מנות גדולות וחטיפים מזינים',
        items: [
          { mealType: 'BREAKFAST', food: 'שיבולת שועל', servings: 2 },
          { mealType: 'BREAKFAST', food: 'חלב 1%', servings: 1 },
          { mealType: 'BREAKFAST', food: 'בננה', servings: 1 },
          { mealType: 'LUNCH', food: 'חזה עוף בגריל', servings: 1.5 },
          { mealType: 'LUNCH', food: 'פסטה מבושלת', servings: 1.5 },
          { mealType: 'DINNER', food: 'פיתה', servings: 1 },
          { mealType: 'DINNER', food: 'חומוס', servings: 2 },
          { mealType: 'SNACK', food: 'חטיף אנרגיה', servings: 1 },
          { mealType: 'SNACK', food: 'אגוזי מלך', servings: 1 },
        ],
      },
    ],
  },
  {
    name: 'מסלול ניסיוני',
    description: 'מסלול שהושבת - לא מוצג למשתמשים חדשים.',
    type: 'LOSE',
    difficulty: 'EASY',
    dailyCalories: 2000,
    durationWeeks: 4,
    isActive: false,
    menus: [],
  },
];

// סיסמאות לסביבת פיתוח ובדיקות בלבד. בפרודקשן לא נוצרות סיסמאות קבועות.
export const DEV_ACCOUNTS = {
  admin: { fullName: 'הדיאטן של המערכת', email: 'admin@example.com', password: 'Admin1234' },
  user: { fullName: 'ישראל ישראלי', email: 'user@example.com', password: 'User1234' },
  user2: { fullName: 'משה לוי', email: 'user2@example.com', password: 'User1234' },
};
