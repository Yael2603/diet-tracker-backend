// תיעוד OpenAPI 3 של כל ה-API - מוצג ב-Swagger UI בכתובת /api-docs
// הקובץ docs/openapi.json נוצר מכאן באמצעות: npm run openapi:export

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const arrayOf = (name: string) => ({ type: 'array', items: ref(name) });
const secured = [{ bearerAuth: [] }];

const json = (schema: object, example?: unknown) => ({
  'application/json': { schema, ...(example !== undefined ? { example } : {}) },
});
const body = (schema: object, example?: unknown) => ({ required: true, content: json(schema, example) });
const ok = (description: string, schema: object, example?: unknown) => ({ description, content: json(schema, example) });

const R = (name: string) => ({ $ref: `#/components/responses/${name}` });
const authErrors = { 401: R('Unauthorized'), 403: R('Forbidden') };

const idPath = (description: string) => ({
  name: 'id',
  in: 'path',
  required: true,
  description,
  schema: { type: 'integer', minimum: 1 },
  example: 1,
});
const dateQuery = {
  name: 'date',
  in: 'query',
  required: false,
  description: 'תאריך בפורמט YYYY-MM-DD. ברירת מחדל: היום',
  schema: { type: 'string', format: 'date' },
  example: '2026-10-22',
};
const sourceQuery = {
  name: 'source',
  in: 'query',
  required: false,
  description: 'סינון הארוחות: MENU = מהתפריט, OTHER = מחוץ לתפריט. בלי ערך = הכל. (הסיכומים תמיד על כל היום)',
  schema: { type: 'string', enum: ['MENU', 'OTHER'] },
};

// ---------- דוגמאות ----------
const exUser = {
  id: 2,
  fullName: 'ישראל ישראלי',
  email: 'user@example.com',
  role: 'USER',
  isActive: true,
  heightCm: 175,
  startWeightKg: 88,
  targetWeightKg: 78,
  birthDate: '1990-05-10',
  shareWithDietitian: true,
  trackId: 2,
  menuId: 3,
  createdAt: '2026-10-01T08:00:00.000Z',
};
const exTrack = {
  id: 2,
  name: 'ירידה מתונה',
  description: 'ירידה הדרגתית של כחצי קילו בשבוע, בלי לוותר על ארוחות מלאות.',
  type: 'LOSE',
  typeLabel: 'ירידה במשקל',
  difficulty: 'MEDIUM',
  difficultyLabel: 'בינוני',
  dailyCalories: 1800,
  durationWeeks: 12,
  isActive: true,
  menusCount: 2,
  createdAt: '2026-10-01T08:00:00.000Z',
  updatedAt: '2026-10-01T08:00:00.000Z',
};
const exFoodShort = {
  id: 1,
  name: 'לחם מלא',
  category: 'GRAINS',
  categoryLabel: 'דגנים',
  servingDescription: '2 פרוסות',
  caloriesPerServing: 140,
};
const exFood = { ...exFoodShort, isActive: true, createdAt: '2026-10-01T08:00:00.000Z', updatedAt: '2026-10-01T08:00:00.000Z' };
const exMenuItem = { id: 11, mealType: 'BREAKFAST', mealTypeLabel: 'בוקר', servings: 1, calories: 140, food: exFoodShort };
const exMenu = {
  id: 3,
  trackId: 2,
  name: 'תפריט חלבי',
  description: 'בוקר וערב חלביים, צהריים בשרי',
  isActive: true,
  totalCalories: 1586,
  items: [exMenuItem],
  createdAt: '2026-10-01T08:00:00.000Z',
  updatedAt: '2026-10-01T08:00:00.000Z',
};
const exProgress = { startWeightKg: 88, targetWeightKg: 78, currentWeightKg: 85.1, changeKg: -2.9, remainingKg: 7.1, percent: 29 };
const exToday = {
  date: '2026-10-22',
  totalCalories: 1450,
  targetCalories: 1800,
  remainingCalories: 350,
  score: 100,
  status: 'ON_TARGET',
  statusLabel: 'עמדת ביעד 🎯',
  percentOfTarget: 81,
  menuAdherence: { eaten: 4, total: 12 },
};
const exMeal = {
  id: 40,
  date: '2026-10-22',
  mealType: 'BREAKFAST',
  mealTypeLabel: 'בוקר',
  servings: 1,
  calories: 140,
  fromMenu: true,
  source: 'MENU',
  sourceLabel: 'מהתפריט',
  menuItemId: 11,
  food: exFoodShort,
  createdAt: '2026-10-22T06:30:00.000Z',
  updatedAt: '2026-10-22T06:30:00.000Z',
};
const exWeight = { id: 5, date: '2026-10-22', weightKg: 85.1, note: null, createdAt: '2026-10-22T06:00:00.000Z' };
const exConsultation = {
  id: 2,
  subject: 'ירידה איטית',
  message: 'השבוע ירדתי פחות מבשבוע שעבר. האם זה תקין?',
  status: 'PENDING',
  statusLabel: 'ממתינה לתשובה',
  answer: null,
  answeredAt: null,
  createdAt: '2026-10-21T18:00:00.000Z',
};
const exDay = {
  date: '2026-10-22',
  source: 'ALL',
  totalCalories: 1450,
  targetCalories: 1800,
  remainingCalories: 350,
  score: 100,
  status: 'ON_TARGET',
  statusLabel: 'עמדת ביעד 🎯',
  percentOfTarget: 81,
  caloriesByMealType: { BREAKFAST: 335, LUNCH: 525, DINNER: 410, SNACK: 180 },
  menu: { id: 3, name: 'תפריט חלבי' },
  menuAdherence: { eaten: 4, total: 12 },
  menuItems: [{ ...exMenuItem, eaten: true }],
  meals: [exMeal],
};

// ---------- סכמות ----------
const dateStr = { type: 'string', format: 'date', example: '2026-10-22' };
const dateTime = { type: 'string', format: 'date-time' };
const nullable = (schema: object) => ({ ...schema, nullable: true });

const schemas = {
  Error: {
    type: 'object',
    required: ['status', 'code', 'message'],
    properties: {
      status: { type: 'integer', example: 400 },
      code: { type: 'string', example: 'VALIDATION_ERROR' },
      message: { type: 'string', example: 'הנתונים שנשלחו אינם תקינים' },
      details: {
        type: 'array',
        description: 'פירוט שגיאות לפי שדה (רק בשגיאות ולידציה)',
        items: {
          type: 'object',
          properties: { field: { type: 'string', example: 'email' }, message: { type: 'string', example: 'כתובת אימייל לא תקינה' } },
        },
      },
    },
  },
  Health: {
    type: 'object',
    properties: {
      status: { type: 'string', enum: ['ok', 'error'] },
      database: { type: 'string', enum: ['up', 'down'] },
      timestamp: dateTime,
    },
  },
  Option: { type: 'object', properties: { value: { type: 'string' }, label: { type: 'string' } } },
  Options: {
    type: 'object',
    properties: {
      trackTypes: arrayOf('Option'),
      difficulties: arrayOf('Option'),
      foodCategories: arrayOf('Option'),
      mealTypes: arrayOf('Option'),
      consultationStatuses: arrayOf('Option'),
      mealSources: arrayOf('Option'),
    },
  },
  User: {
    type: 'object',
    description: 'משתמש. סיסמה ו-Hash לעולם אינם מוחזרים.',
    properties: {
      id: { type: 'integer' },
      fullName: { type: 'string' },
      email: { type: 'string', format: 'email' },
      role: { type: 'string', enum: ['USER', 'ADMIN'] },
      isActive: { type: 'boolean' },
      heightCm: nullable({ type: 'integer' }),
      startWeightKg: nullable({ type: 'number' }),
      targetWeightKg: nullable({ type: 'number' }),
      birthDate: nullable(dateStr),
      shareWithDietitian: { type: 'boolean' },
      trackId: nullable({ type: 'integer' }),
      menuId: nullable({ type: 'integer' }),
      createdAt: dateTime,
    },
    example: exUser,
  },
  RegisterRequest: {
    type: 'object',
    required: ['fullName', 'email', 'password'],
    properties: {
      fullName: { type: 'string', minLength: 2, maxLength: 60 },
      email: { type: 'string', format: 'email', maxLength: 120 },
      password: { type: 'string', minLength: 8, maxLength: 72, description: 'לפחות 8 תווים, אות באנגלית וספרה' },
    },
  },
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } },
  },
  AuthResponse: {
    type: 'object',
    properties: { token: { type: 'string', description: 'JWT - יש לשלוח בכותרת Authorization: Bearer <token>' }, user: ref('User') },
  },
  ProfileUpdate: {
    type: 'object',
    description: 'כל השדות אופציונליים - שולחים רק מה שרוצים לשנות. null מוחק ערך.',
    properties: {
      fullName: { type: 'string', minLength: 2, maxLength: 60 },
      heightCm: nullable({ type: 'integer', minimum: 100, maximum: 250 }),
      startWeightKg: nullable({ type: 'number', minimum: 30, maximum: 300 }),
      targetWeightKg: nullable({ type: 'number', minimum: 30, maximum: 300 }),
      birthDate: nullable({ ...dateStr, description: 'גיל 18 ומעלה' }),
      shareWithDietitian: { type: 'boolean' },
    },
  },
  PlanUpdate: {
    type: 'object',
    required: ['trackId'],
    properties: {
      trackId: { type: 'integer', description: 'מסלול פעיל' },
      menuId: nullable({ type: 'integer', description: 'תפריט פעיל ששייך למסלול. null/חסר = ללא תפריט' }),
    },
  },
  PlanResponse: {
    type: 'object',
    properties: { user: ref('User'), track: ref('Track'), menu: nullable(ref('Menu')) },
  },
  Progress: {
    type: 'object',
    properties: {
      startWeightKg: nullable({ type: 'number' }),
      targetWeightKg: nullable({ type: 'number' }),
      currentWeightKg: nullable({ type: 'number', description: 'השקילה האחרונה, או המשקל ההתחלתי אם אין שקילות' }),
      changeKg: nullable({ type: 'number', description: 'שינוי מההתחלה (שלילי = ירידה)' }),
      remainingKg: nullable({ type: 'number' }),
      percent: nullable({ type: 'integer', minimum: 0, maximum: 100, description: 'אחוז התקדמות לעבר היעד' }),
    },
    example: exProgress,
  },
  DailyStatus: {
    type: 'string',
    enum: ['NO_TRACK', 'NO_DATA', 'UNDER', 'ON_TARGET', 'SLIGHTLY_OVER', 'FAR_OVER'],
    description: 'NO_TRACK=לא נבחר מסלול, NO_DATA=אין ארוחות, UNDER=פחות מ-80%, ON_TARGET=80%-110%, SLIGHTLY_OVER=110%-125%, FAR_OVER=מעל 125%',
  },
  MenuAdherence: {
    type: 'object',
    nullable: true,
    properties: { eaten: { type: 'integer' }, total: { type: 'integer' } },
  },
  TodaySummary: {
    type: 'object',
    properties: {
      date: dateStr,
      totalCalories: { type: 'integer' },
      targetCalories: nullable({ type: 'integer' }),
      remainingCalories: nullable({ type: 'integer' }),
      score: nullable({ type: 'integer', minimum: 0, maximum: 100 }),
      status: ref('DailyStatus'),
      statusLabel: { type: 'string' },
      percentOfTarget: nullable({ type: 'integer' }),
      menuAdherence: ref('MenuAdherence'),
    },
    example: exToday,
  },
  Dashboard: {
    type: 'object',
    properties: {
      user: ref('User'),
      track: nullable(ref('Track')),
      menu: nullable(ref('Menu')),
      progress: ref('Progress'),
      today: ref('TodaySummary'),
    },
  },
  Track: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      description: { type: 'string' },
      type: { type: 'string', enum: ['LOSE', 'MAINTAIN', 'GAIN'] },
      typeLabel: { type: 'string' },
      difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
      difficultyLabel: { type: 'string' },
      dailyCalories: { type: 'integer' },
      durationWeeks: { type: 'integer' },
      isActive: { type: 'boolean' },
      menusCount: { type: 'integer', description: 'מספר התפריטים (למשתמש רגיל - רק פעילים)' },
      createdAt: dateTime,
      updatedAt: dateTime,
    },
    example: exTrack,
  },
  TrackInput: {
    type: 'object',
    required: ['name', 'description', 'type', 'difficulty', 'dailyCalories', 'durationWeeks'],
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 60 },
      description: { type: 'string', minLength: 5, maxLength: 500 },
      type: { type: 'string', enum: ['LOSE', 'MAINTAIN', 'GAIN'] },
      difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
      dailyCalories: { type: 'integer', minimum: 1000, maximum: 4500 },
      durationWeeks: { type: 'integer', minimum: 1, maximum: 104 },
    },
  },
  StatusInput: {
    type: 'object',
    required: ['isActive'],
    properties: { isActive: { type: 'boolean' } },
  },
  FoodShort: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      category: { type: 'string' },
      categoryLabel: { type: 'string' },
      servingDescription: { type: 'string' },
      caloriesPerServing: { type: 'integer' },
    },
  },
  Food: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      name: { type: 'string' },
      category: { type: 'string', enum: ['GRAINS', 'VEGETABLES', 'FRUITS', 'PROTEINS', 'DAIRY', 'FATS', 'DRINKS', 'SNACKS'] },
      categoryLabel: { type: 'string' },
      servingDescription: { type: 'string' },
      caloriesPerServing: { type: 'integer' },
      isActive: { type: 'boolean' },
      createdAt: dateTime,
      updatedAt: dateTime,
    },
    example: exFood,
  },
  FoodInput: {
    type: 'object',
    required: ['name', 'category', 'servingDescription', 'caloriesPerServing'],
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 60 },
      category: { type: 'string', enum: ['GRAINS', 'VEGETABLES', 'FRUITS', 'PROTEINS', 'DAIRY', 'FATS', 'DRINKS', 'SNACKS'] },
      servingDescription: { type: 'string', minLength: 1, maxLength: 60 },
      caloriesPerServing: { type: 'integer', minimum: 0, maximum: 2000 },
    },
  },
  MenuItem: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      mealType: { type: 'string', enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] },
      mealTypeLabel: { type: 'string' },
      servings: { type: 'number' },
      calories: { type: 'integer' },
      food: ref('FoodShort'),
    },
  },
  Menu: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      trackId: { type: 'integer' },
      name: { type: 'string' },
      description: nullable({ type: 'string' }),
      isActive: { type: 'boolean' },
      totalCalories: { type: 'integer', description: 'סך הקלוריות בתפריט - מחושב בשרת' },
      items: arrayOf('MenuItem'),
      createdAt: dateTime,
      updatedAt: dateTime,
    },
    example: exMenu,
  },
  MenuItemInput: {
    type: 'object',
    required: ['mealType', 'foodId', 'servings'],
    properties: {
      mealType: { type: 'string', enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] },
      foodId: { type: 'integer', description: 'מאכל פעיל מהמאגר' },
      servings: { type: 'number', minimum: 0.25, maximum: 20 },
    },
  },
  MenuCreate: {
    type: 'object',
    required: ['trackId', 'name', 'items'],
    properties: {
      trackId: { type: 'integer' },
      name: { type: 'string', minLength: 2, maxLength: 60, description: 'ייחודי בתוך המסלול' },
      description: nullable({ type: 'string', maxLength: 500 }),
      items: { type: 'array', minItems: 1, maxItems: 40, items: ref('MenuItemInput') },
    },
  },
  MenuUpdate: {
    type: 'object',
    required: ['name', 'items'],
    description: 'רשימת items מחליפה את כל הפריטים הקודמים',
    properties: {
      name: { type: 'string', minLength: 2, maxLength: 60 },
      description: nullable({ type: 'string', maxLength: 500 }),
      items: { type: 'array', minItems: 1, maxItems: 40, items: ref('MenuItemInput') },
    },
  },
  Weight: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      date: dateStr,
      weightKg: { type: 'number' },
      note: nullable({ type: 'string' }),
      createdAt: dateTime,
    },
    example: exWeight,
  },
  WeightInput: {
    type: 'object',
    required: ['date', 'weightKg'],
    description: 'שקילה אחת בלבד לכל יום',
    properties: {
      date: { ...dateStr, description: 'לא תאריך עתידי' },
      weightKg: { type: 'number', minimum: 30, maximum: 300 },
      note: nullable({ type: 'string', maxLength: 200 }),
    },
  },
  Meal: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      date: dateStr,
      mealType: { type: 'string', enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] },
      mealTypeLabel: { type: 'string' },
      servings: { type: 'number' },
      calories: { type: 'integer', description: 'מחושב בשרת: מנות × קלוריות למנה' },
      fromMenu: { type: 'boolean' },
      source: { type: 'string', enum: ['MENU', 'OTHER'] },
      sourceLabel: { type: 'string' },
      menuItemId: nullable({ type: 'integer' }),
      food: ref('FoodShort'),
      createdAt: dateTime,
      updatedAt: dateTime,
    },
    example: exMeal,
  },
  MealInput: {
    type: 'object',
    required: ['date', 'mealType', 'foodId', 'servings'],
    properties: {
      date: { ...dateStr, description: 'לא תאריך עתידי' },
      mealType: { type: 'string', enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'] },
      foodId: { type: 'integer', description: 'מאכל פעיל מהמאגר' },
      servings: { type: 'number', minimum: 0.25, maximum: 20 },
    },
  },
  FromMenuInput: {
    type: 'object',
    required: ['menuItemId'],
    properties: {
      menuItemId: { type: 'integer', description: 'מזהה פריט מהתפריט שלי (menuItems[].id)' },
      date: { ...dateStr, description: 'ברירת מחדל: היום' },
    },
  },
  DaySummary: {
    type: 'object',
    properties: {
      date: dateStr,
      source: { type: 'string', enum: ['ALL', 'MENU', 'OTHER'] },
      totalCalories: { type: 'integer' },
      targetCalories: nullable({ type: 'integer' }),
      remainingCalories: nullable({ type: 'integer' }),
      score: nullable({ type: 'integer' }),
      status: ref('DailyStatus'),
      statusLabel: { type: 'string' },
      percentOfTarget: nullable({ type: 'integer' }),
      caloriesByMealType: {
        type: 'object',
        properties: {
          BREAKFAST: { type: 'integer' },
          LUNCH: { type: 'integer' },
          DINNER: { type: 'integer' },
          SNACK: { type: 'integer' },
        },
      },
      menu: nullable({ type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' } } }),
      menuAdherence: ref('MenuAdherence'),
      menuItems: {
        type: 'array',
        description: '"התפריט שלי להיום" - כל פריט עם eaten=true אם כבר נאכל',
        items: { allOf: [ref('MenuItem'), { type: 'object', properties: { eaten: { type: 'boolean' } } }] },
      },
      meals: arrayOf('Meal'),
    },
    example: exDay,
  },
  Consultation: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      subject: { type: 'string' },
      message: { type: 'string' },
      status: { type: 'string', enum: ['PENDING', 'ANSWERED'] },
      statusLabel: { type: 'string' },
      answer: nullable({ type: 'string' }),
      answeredAt: nullable(dateTime),
      createdAt: dateTime,
      user: {
        type: 'object',
        description: 'מוחזר רק לדיאטן',
        properties: { id: { type: 'integer' }, fullName: { type: 'string' }, email: { type: 'string' } },
      },
    },
    example: exConsultation,
  },
  ConsultationCreate: {
    type: 'object',
    required: ['subject', 'message'],
    properties: {
      subject: { type: 'string', minLength: 3, maxLength: 100 },
      message: { type: 'string', minLength: 5, maxLength: 2000 },
    },
  },
  AnswerInput: {
    type: 'object',
    required: ['answer'],
    properties: { answer: { type: 'string', minLength: 2, maxLength: 2000 } },
  },
  AdminUserListItem: {
    type: 'object',
    properties: {
      id: { type: 'integer' },
      fullName: { type: 'string' },
      email: { type: 'string' },
      isActive: { type: 'boolean' },
      shareWithDietitian: { type: 'boolean' },
      track: nullable({ type: 'object', properties: { id: { type: 'integer' }, name: { type: 'string' } } }),
      pendingConsultations: { type: 'integer' },
      createdAt: dateTime,
    },
  },
  AdminUserDetails: {
    type: 'object',
    description: 'אם sharing=false - מוחזרים רק פרטים בסיסיים, overview ו-weights הם null',
    properties: {
      user: { type: 'object', description: 'פרטי המשתמש (מלאים רק כשהוא משתף)' },
      sharing: { type: 'boolean' },
      message: nullable({ type: 'string' }),
      overview: nullable({
        type: 'object',
        properties: {
          track: nullable(ref('Track')),
          menu: nullable(ref('Menu')),
          progress: ref('Progress'),
          today: ref('TodaySummary'),
        },
      }),
      weights: nullable(arrayOf('Weight')),
    },
  },
};

const errorExample = (status: number, code: string, message: string) => ({
  description: message,
  content: json(ref('Error'), { status, code, message }),
});

const responses = {
  BadRequest: {
    description: 'שגיאת ולידציה',
    content: json(ref('Error'), {
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'הנתונים שנשלחו אינם תקינים',
      details: [{ field: 'weightKg', message: 'הערך חייב להיות לפחות 30' }],
    }),
  },
  Unauthorized: errorExample(401, 'UNAUTHORIZED', 'חסר Token, ה-Token לא תקין או שפג תוקפו'),
  Forbidden: errorExample(403, 'FORBIDDEN', 'אין לך הרשאה לבצע פעולה זו'),
  NotFound: errorExample(404, 'NOT_FOUND', 'הפריט לא נמצא'),
  Conflict: errorExample(409, 'CONFLICT', 'קיימת כבר רשומה עם אותם ערכים'),
};

// ---------- נתיבים ----------
const paths = {
  '/api/health': {
    get: {
      tags: ['כללי'],
      summary: 'בדיקת בריאות השרת',
      description: 'מחזיר 200 אם השרת ומסד הנתונים פעילים. ציבורי.',
      responses: {
        200: ok('השרת פעיל', ref('Health'), { status: 'ok', database: 'up', timestamp: '2026-10-22T10:00:00.000Z' }),
        503: ok('מסד הנתונים אינו זמין', ref('Health')),
      },
    },
  },
  '/api/options': {
    get: {
      tags: ['כללי'],
      summary: 'רשימות לתיבות בחירה',
      description: 'כל ערכי הבחירה (קטגוריות, סוגי ארוחות וכו\') עם תוויות בעברית. ציבורי.',
      responses: {
        200: ok('הרשימות', ref('Options'), {
          foodCategories: [{ value: 'GRAINS', label: 'דגנים' }],
          mealTypes: [{ value: 'BREAKFAST', label: 'בוקר' }],
        }),
      },
    },
  },
  '/api/auth/register': {
    post: {
      tags: ['התחברות'],
      summary: 'הרשמה',
      description: 'יוצר משתמש רגיל (USER) ומחזיר Token. ציבורי.',
      requestBody: body(ref('RegisterRequest'), { fullName: 'דוד כהן', email: 'david@example.com', password: 'Pass1234' }),
      responses: {
        201: ok('נרשם בהצלחה', ref('AuthResponse')),
        400: R('BadRequest'),
        409: errorExample(409, 'CONFLICT', 'כתובת האימייל כבר רשומה במערכת'),
      },
    },
  },
  '/api/auth/login': {
    post: {
      tags: ['התחברות'],
      summary: 'התחברות',
      description: 'מחזיר JWT. העתיקו את ה-token ולחצו על Authorize למעלה. ציבורי.',
      requestBody: body(ref('LoginRequest'), { email: 'user@example.com', password: 'User1234' }),
      responses: {
        200: ok('התחברות הצליחה', ref('AuthResponse'), { token: 'eyJhbGciOiJIUzI1NiIs...', user: exUser }),
        400: R('BadRequest'),
        401: errorExample(401, 'UNAUTHORIZED', 'אימייל או סיסמה שגויים'),
        403: errorExample(403, 'FORBIDDEN', 'החשבון חסום. יש לפנות לדיאטן'),
      },
    },
  },
  '/api/auth/me': {
    get: {
      tags: ['התחברות'],
      summary: 'המשתמש המחובר',
      description: 'מחזיר את פרטי המשתמש לפי ה-Token. כל משתמש מחובר.',
      security: secured,
      responses: { 200: ok('פרטי המשתמש', ref('User')), ...authErrors },
    },
  },
  '/api/me/dashboard': {
    get: {
      tags: ['האזור האישי'],
      summary: 'לוח הבקרה',
      description: 'כל נתוני מסך "הבית שלי" בקריאה אחת: פרופיל, מסלול, תפריט, התקדמות ותקציר היום. משתמש רגיל בלבד.',
      security: secured,
      responses: { 200: ok('נתוני לוח הבקרה', ref('Dashboard')), ...authErrors },
    },
  },
  '/api/me/profile': {
    put: {
      tags: ['האזור האישי'],
      summary: 'עדכון פרופיל ושיתוף',
      description: 'עדכון חלקי: שולחים רק את השדות שרוצים לשנות, כולל shareWithDietitian. משתמש רגיל בלבד.',
      security: secured,
      requestBody: body(ref('ProfileUpdate'), { heightCm: 175, startWeightKg: 88, targetWeightKg: 78, birthDate: '1990-05-10', shareWithDietitian: true }),
      responses: { 200: ok('הפרופיל עודכן', ref('User')), 400: R('BadRequest'), ...authErrors },
    },
  },
  '/api/me/plan': {
    put: {
      tags: ['האזור האישי'],
      summary: 'בחירת מסלול ותפריט',
      description: 'בוחרים מסלול פעיל ותפריט פעיל מתוך התפריטים שלו. משתמש רגיל בלבד.',
      security: secured,
      requestBody: body(ref('PlanUpdate'), { trackId: 2, menuId: 3 }),
      responses: { 200: ok('המסלול נבחר', ref('PlanResponse')), 400: R('BadRequest'), ...authErrors, 404: R('NotFound') },
    },
  },
  '/api/tracks': {
    get: {
      tags: ['מסלולים'],
      summary: 'רשימת מסלולים',
      description: 'משתמש רגיל: רק מסלולים פעילים. דיאטן: כל המסלולים. ממוין לפי יעד קלוריות.',
      security: secured,
      responses: { 200: ok('רשימת מסלולים', arrayOf('Track'), [exTrack]), 401: R('Unauthorized') },
    },
    post: {
      tags: ['מסלולים'],
      summary: 'הוספת מסלול',
      description: 'דיאטן בלבד.',
      security: secured,
      requestBody: body(ref('TrackInput'), { name: 'ירידה עדינה', description: 'ירידה איטית ונוחה', type: 'LOSE', difficulty: 'EASY', dailyCalories: 2000, durationWeeks: 16 }),
      responses: { 201: ok('המסלול נוצר', ref('Track')), 400: R('BadRequest'), ...authErrors, 409: R('Conflict') },
    },
  },
  '/api/tracks/{id}': {
    put: {
      tags: ['מסלולים'],
      summary: 'עריכת מסלול',
      description: 'שולחים את כל השדות. דיאטן בלבד.',
      security: secured,
      parameters: [idPath('מזהה המסלול')],
      requestBody: body(ref('TrackInput')),
      responses: { 200: ok('המסלול עודכן', ref('Track')), 400: R('BadRequest'), ...authErrors, 404: R('NotFound'), 409: R('Conflict') },
    },
  },
  '/api/tracks/{id}/status': {
    patch: {
      tags: ['מסלולים'],
      summary: 'הפעלה / השבתה של מסלול',
      description: 'מסלול מושבת לא מוצג למשתמשים חדשים. דיאטן בלבד.',
      security: secured,
      parameters: [idPath('מזהה המסלול')],
      requestBody: body(ref('StatusInput'), { isActive: false }),
      responses: { 200: ok('הסטטוס עודכן', ref('Track')), 400: R('BadRequest'), ...authErrors, 404: R('NotFound') },
    },
  },
  '/api/tracks/{id}/menus': {
    get: {
      tags: ['תפריטים'],
      summary: 'התפריטים של מסלול',
      description: 'משתמש רגיל: רק תפריטים פעילים. דיאטן: כולם. כולל פריטים וסך קלוריות.',
      security: secured,
      parameters: [idPath('מזהה המסלול')],
      responses: { 200: ok('רשימת תפריטים', arrayOf('Menu'), [exMenu]), 401: R('Unauthorized'), 404: R('NotFound') },
    },
  },
  '/api/menus': {
    post: {
      tags: ['תפריטים'],
      summary: 'הוספת תפריט',
      description: 'יוצרים תפריט עם כל הפריטים בקריאה אחת. דיאטן בלבד.',
      security: secured,
      requestBody: body(ref('MenuCreate'), {
        trackId: 2,
        name: 'תפריט צמחוני',
        description: 'ללא בשר',
        items: [
          { mealType: 'BREAKFAST', foodId: 1, servings: 1 },
          { mealType: 'LUNCH', foodId: 22, servings: 1 },
        ],
      }),
      responses: { 201: ok('התפריט נוצר', ref('Menu')), 400: R('BadRequest'), ...authErrors, 404: R('NotFound'), 409: R('Conflict') },
    },
  },
  '/api/menus/{id}': {
    put: {
      tags: ['תפריטים'],
      summary: 'עריכת תפריט',
      description: 'שולחים שם, תיאור ואת כל רשימת הפריטים (מחליפה את הקודמת). דיאטן בלבד.',
      security: secured,
      parameters: [idPath('מזהה התפריט')],
      requestBody: body(ref('MenuUpdate')),
      responses: { 200: ok('התפריט עודכן', ref('Menu')), 400: R('BadRequest'), ...authErrors, 404: R('NotFound'), 409: R('Conflict') },
    },
  },
  '/api/menus/{id}/status': {
    patch: {
      tags: ['תפריטים'],
      summary: 'הפעלה / השבתה של תפריט',
      description: 'דיאטן בלבד.',
      security: secured,
      parameters: [idPath('מזהה התפריט')],
      requestBody: body(ref('StatusInput'), { isActive: false }),
      responses: { 200: ok('הסטטוס עודכן', ref('Menu')), 400: R('BadRequest'), ...authErrors, 404: R('NotFound') },
    },
  },
  '/api/foods': {
    get: {
      tags: ['מאכלים'],
      summary: 'חיפוש וסינון מאכלים',
      description: 'משתמש רגיל: רק מאכלים פעילים. דיאטן: כולם. ממוין לפי שם.',
      security: secured,
      parameters: [
        { name: 'search', in: 'query', required: false, description: 'חיפוש בשם המאכל', schema: { type: 'string' }, example: 'לחם' },
        {
          name: 'category',
          in: 'query',
          required: false,
          description: 'סינון לפי קטגוריה',
          schema: { type: 'string', enum: ['GRAINS', 'VEGETABLES', 'FRUITS', 'PROTEINS', 'DAIRY', 'FATS', 'DRINKS', 'SNACKS'] },
        },
      ],
      responses: { 200: ok('רשימת מאכלים', arrayOf('Food'), [exFood]), 400: R('BadRequest'), 401: R('Unauthorized') },
    },
    post: {
      tags: ['מאכלים'],
      summary: 'הוספת מאכל',
      description: 'דיאטן בלבד.',
      security: secured,
      requestBody: body(ref('FoodInput'), { name: 'כוסמת מבושלת', category: 'GRAINS', servingDescription: 'כוס', caloriesPerServing: 155 }),
      responses: { 201: ok('המאכל נוצר', ref('Food')), 400: R('BadRequest'), ...authErrors, 409: R('Conflict') },
    },
  },
  '/api/foods/{id}': {
    put: {
      tags: ['מאכלים'],
      summary: 'עריכת מאכל',
      description: 'שולחים את כל השדות. ארוחות שכבר נרשמו לא משתנות. דיאטן בלבד.',
      security: secured,
      parameters: [idPath('מזהה המאכל')],
      requestBody: body(ref('FoodInput')),
      responses: { 200: ok('המאכל עודכן', ref('Food')), 400: R('BadRequest'), ...authErrors, 404: R('NotFound'), 409: R('Conflict') },
    },
  },
  '/api/foods/{id}/status': {
    patch: {
      tags: ['מאכלים'],
      summary: 'הפעלה / השבתה של מאכל',
      description: 'דיאטן בלבד.',
      security: secured,
      parameters: [idPath('מזהה המאכל')],
      requestBody: body(ref('StatusInput'), { isActive: false }),
      responses: { 200: ok('הסטטוס עודכן', ref('Food')), 400: R('BadRequest'), ...authErrors, 404: R('NotFound') },
    },
  },
  '/api/weights': {
    get: {
      tags: ['שקילות'],
      summary: 'השקילות שלי',
      description: 'מהחדשה לישנה. משתמש רגיל בלבד.',
      security: secured,
      responses: { 200: ok('רשימת שקילות', arrayOf('Weight'), [exWeight]), ...authErrors },
    },
    post: {
      tags: ['שקילות'],
      summary: 'הוספת שקילה',
      description: 'שקילה אחת לכל יום. משתמש רגיל בלבד.',
      security: secured,
      requestBody: body(ref('WeightInput'), { date: '2026-10-22', weightKg: 85.1, note: 'אחרי שבוע טוב' }),
      responses: {
        201: ok('השקילה נוספה', ref('Weight')),
        400: R('BadRequest'),
        ...authErrors,
        409: errorExample(409, 'CONFLICT', 'כבר קיימת שקילה בתאריך הזה. אפשר לערוך את השקילה הקיימת'),
      },
    },
  },
  '/api/weights/{id}': {
    put: {
      tags: ['שקילות'],
      summary: 'עריכת שקילה',
      description: 'רק שקילה שלי (שקילה של אחר מחזירה 404). משתמש רגיל בלבד.',
      security: secured,
      parameters: [idPath('מזהה השקילה')],
      requestBody: body(ref('WeightInput')),
      responses: { 200: ok('השקילה עודכנה', ref('Weight')), 400: R('BadRequest'), ...authErrors, 404: R('NotFound'), 409: R('Conflict') },
    },
    delete: {
      tags: ['שקילות'],
      summary: 'מחיקת שקילה',
      description: 'רק שקילה שלי. משתמש רגיל בלבד.',
      security: secured,
      parameters: [idPath('מזהה השקילה')],
      responses: { 204: { description: 'נמחקה (ללא תוכן)' }, ...authErrors, 404: R('NotFound') },
    },
  },
  '/api/meals': {
    get: {
      tags: ['יומן אכילה'],
      summary: 'יום ביומן האכילה',
      description: 'ארוחות היום, סך קלוריות, ציון יומי, "התפריט שלי להיום" ועמידה בתפריט. משתמש רגיל בלבד.',
      security: secured,
      parameters: [dateQuery, sourceQuery],
      responses: { 200: ok('סיכום היום', ref('DaySummary')), 400: R('BadRequest'), ...authErrors },
    },
    post: {
      tags: ['יומן אכילה'],
      summary: 'הוספת ארוחה',
      description: 'בוחרים מאכל מהמאגר ומספר מנות. הקלוריות מחושבות בשרת. אם המאכל וסוג הארוחה מופיעים בתפריט - מסומן "מהתפריט". משתמש רגיל בלבד.',
      security: secured,
      requestBody: body(ref('MealInput'), { date: '2026-10-22', mealType: 'LUNCH', foodId: 18, servings: 1 }),
      responses: { 201: ok('הארוחה נוספה', ref('Meal')), 400: R('BadRequest'), ...authErrors },
    },
  },
  '/api/meals/from-menu': {
    post: {
      tags: ['יומן אכילה'],
      summary: '"אכלתי ✓" - הוספה מהתפריט',
      description: 'מוסיף ליומן פריט מהתפריט שלי בלחיצה אחת. אי אפשר לסמן אותו פריט פעמיים באותו יום. משתמש רגיל בלבד.',
      security: secured,
      requestBody: body(ref('FromMenuInput'), { menuItemId: 11 }),
      responses: {
        201: ok('הארוחה נוספה', ref('Meal')),
        400: R('BadRequest'),
        ...authErrors,
        404: errorExample(404, 'NOT_FOUND', 'הפריט לא נמצא בתפריט שלך'),
        409: errorExample(409, 'CONFLICT', 'הפריט הזה כבר סומן כנאכל בתאריך הזה'),
      },
    },
  },
  '/api/meals/{id}': {
    put: {
      tags: ['יומן אכילה'],
      summary: 'עריכת ארוחה',
      description: 'שולחים את כל השדות. הקלוריות מחושבות מחדש. רק ארוחה שלי. משתמש רגיל בלבד.',
      security: secured,
      parameters: [idPath('מזהה הארוחה')],
      requestBody: body(ref('MealInput')),
      responses: { 200: ok('הארוחה עודכנה', ref('Meal')), 400: R('BadRequest'), ...authErrors, 404: R('NotFound') },
    },
    delete: {
      tags: ['יומן אכילה'],
      summary: 'מחיקת ארוחה',
      description: 'רק ארוחה שלי. משתמש רגיל בלבד.',
      security: secured,
      parameters: [idPath('מזהה הארוחה')],
      responses: { 204: { description: 'נמחקה (ללא תוכן)' }, ...authErrors, 404: R('NotFound') },
    },
  },
  '/api/consultations': {
    get: {
      tags: ['פניות'],
      summary: 'רשימת פניות',
      description: 'משתמש רגיל: רק הפניות שלו. דיאטן: כל הפניות (כולל פרטי השולח). מהחדשה לישנה.',
      security: secured,
      parameters: [
        { name: 'status', in: 'query', required: false, description: 'סינון לפי סטטוס', schema: { type: 'string', enum: ['PENDING', 'ANSWERED'] } },
      ],
      responses: { 200: ok('רשימת פניות', arrayOf('Consultation'), [exConsultation]), 400: R('BadRequest'), 401: R('Unauthorized') },
    },
    post: {
      tags: ['פניות'],
      summary: 'שליחת פנייה לדיאטן',
      description: 'אפשרי רק כשהשיתוף עם הדיאטן פעיל. משתמש רגיל בלבד.',
      security: secured,
      requestBody: body(ref('ConsultationCreate'), { subject: 'שאלה על התפריט', message: 'אפשר להחליף את האורז בקוסקוס?' }),
      responses: {
        201: ok('הפנייה נשלחה', ref('Consultation')),
        400: R('BadRequest'),
        401: R('Unauthorized'),
        403: errorExample(403, 'FORBIDDEN', 'כדי לשלוח פנייה יש להפעיל קודם שיתוף מידע עם הדיאטן'),
      },
    },
  },
  '/api/consultations/{id}/answer': {
    patch: {
      tags: ['פניות'],
      summary: 'מענה לפנייה',
      description: 'משנה את הסטטוס ל-ANSWERED. אפשר גם לעדכן תשובה קיימת. דיאטן בלבד.',
      security: secured,
      parameters: [idPath('מזהה הפנייה')],
      requestBody: body(ref('AnswerInput'), { answer: 'כן, כמות קלוריות דומה.' }),
      responses: { 200: ok('התשובה נשמרה', ref('Consultation')), 400: R('BadRequest'), ...authErrors, 404: R('NotFound') },
    },
  },
  '/api/admin/users': {
    get: {
      tags: ['ניהול משתמשים'],
      summary: 'רשימת משתמשים',
      description: 'משתמשים רגילים בלבד, ללא משקלים ויומן. חיפוש לפי שם או אימייל. דיאטן בלבד.',
      security: secured,
      parameters: [{ name: 'search', in: 'query', required: false, description: 'חיפוש בשם או באימייל', schema: { type: 'string' } }],
      responses: { 200: ok('רשימת משתמשים', arrayOf('AdminUserListItem')), 400: R('BadRequest'), ...authErrors },
    },
  },
  '/api/admin/users/{id}': {
    get: {
      tags: ['ניהול משתמשים'],
      summary: 'פרטי משתמש',
      description: 'אם המשתמש משתף: פרופיל, מסלול, תפריט, התקדמות, היום ושקילות. אם לא: פרטים בסיסיים בלבד. דיאטן בלבד.',
      security: secured,
      parameters: [idPath('מזהה המשתמש')],
      responses: { 200: ok('פרטי משתמש', ref('AdminUserDetails')), ...authErrors, 404: R('NotFound') },
    },
  },
  '/api/admin/users/{id}/status': {
    patch: {
      tags: ['ניהול משתמשים'],
      summary: 'חסימה / הפעלה של משתמש',
      description: 'משתמש חסום לא יכול להתחבר, וה-Token הקיים שלו מפסיק לעבוד. דיאטן בלבד.',
      security: secured,
      parameters: [idPath('מזהה המשתמש')],
      requestBody: body(ref('StatusInput'), { isActive: false }),
      responses: { 200: ok('הסטטוס עודכן', ref('User')), 400: R('BadRequest'), ...authErrors, 404: R('NotFound') },
    },
  },
  '/api/admin/users/{id}/meals': {
    get: {
      tags: ['ניהול משתמשים'],
      summary: 'יומן האכילה של משתמש',
      description: 'רק אם המשתמש משתף - אחרת 403. דיאטן בלבד.',
      security: secured,
      parameters: [idPath('מזהה המשתמש'), dateQuery, sourceQuery],
      responses: {
        200: ok('סיכום היום', ref('DaySummary')),
        400: R('BadRequest'),
        401: R('Unauthorized'),
        403: errorExample(403, 'FORBIDDEN', 'המשתמש לא שיתף את המידע שלו עם הדיאטן'),
        404: R('NotFound'),
      },
    },
  },
};

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'מסלול בריא - API',
    version: '1.0.0',
    description: [
      'שרת למערכת ליווי דיאטה: מסלולים, תפריטים, מעקב משקל, יומן אכילה ופניות לדיאטן.',
      '',
      '**איך בודקים קריאות מוגנות:**',
      '1. פתחו את `POST /api/auth/login` ← Try it out ← Execute.',
      '2. העתיקו את הערך של `token` מהתשובה (בלי מירכאות).',
      '3. לחצו על **Authorize** למעלה, הדביקו את ה-token ולחצו Authorize.',
      '',
      '**חשבונות הדגמה (סביבת פיתוח):** `admin@example.com` / `Admin1234` (דיאטן), `user@example.com` / `User1234` (משתמש משתף), `user2@example.com` / `User1234` (משתמש שאינו משתף).',
      '',
      'כל השגיאות מוחזרות במבנה `{ status, code, message, details? }` עם הודעה בעברית.',
    ].join('\n'),
  },
  // כתובת יחסית - עובד גם מקומית וגם בענן
  servers: [{ url: '/', description: 'השרת הנוכחי' }],
  tags: [
    { name: 'כללי' },
    { name: 'התחברות' },
    { name: 'האזור האישי', description: 'משתמש רגיל בלבד' },
    { name: 'מסלולים' },
    { name: 'תפריטים' },
    { name: 'מאכלים' },
    { name: 'שקילות', description: 'משתמש רגיל בלבד' },
    { name: 'יומן אכילה', description: 'משתמש רגיל בלבד' },
    { name: 'פניות' },
    { name: 'ניהול משתמשים', description: 'דיאטן בלבד' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'הדביקו כאן את ה-token שהתקבל מ-login' },
    },
    schemas,
    responses,
  },
  paths,
};
