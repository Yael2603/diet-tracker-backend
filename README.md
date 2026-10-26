# מסלול בריא – Backend

שרת API למערכת ליווי דיאטה: מסלולים, תפריטים, מעקב משקל, יומן אכילה עם ציון יומי, ופניות לדיאטן.

> 👋 **פעם ראשונה כאן?** התחילי בקובץ [START-HERE.md](START-HERE.md). שם מוסבר שלב אחרי שלב איך מעלים את השרת לאינטרנט.
> 🧩 **כותבת את ה-React?** כל מה שצריך נמצא ב-[FRONTEND-API-GUIDE.md](FRONTEND-API-GUIDE.md).
> 📋 **האפיון המלא:** [docs/SPEC.md](docs/SPEC.md)
> 🎤 **הכנה להצגה – איך השרת עובד:** [docs/HOW-IT-WORKS.md](docs/HOW-IT-WORKS.md)

## טכנולוגיות

| תחום | טכנולוגיה |
|---|---|
| שפה | TypeScript (strict) על Node.js 22 LTS |
| שרת | Express 5 |
| מסד נתונים | PostgreSQL + Prisma ORM 6 |
| ולידציה | Zod 4 |
| התחברות | JWT (jsonwebtoken) + bcrypt (bcryptjs) |
| תיעוד | Swagger UI / OpenAPI 3 |
| בדיקות | Vitest + Supertest, מול PostgreSQL אמיתי |

הפרויקט לא משתמש בשום שירות AI ולא צריך מפתחות בתשלום.

## מבנה התיקיות

```
backend-project/
├── prisma/
│   ├── schema.prisma          # הגדרת הטבלאות
│   └── migrations/            # קבצי Migration (יצירת הטבלאות במסד)
├── src/
│   ├── server.ts              # נקודת הכניסה – הפעלת השרת
│   ├── app.ts                 # הגדרת Express (CORS, Swagger, נתיבים, שגיאות)
│   ├── routes.ts              # חיבור כל המודולים תחת /api
│   ├── config/env.ts          # קריאה ובדיקה של משתני סביבה
│   ├── db/prisma.ts           # חיבור למסד הנתונים
│   ├── middleware/            # אימות (JWT), הרשאות, טיפול בשגיאות
│   ├── lib/                   # חישובי ציון/התקדמות, תאריכים, ולידציה, עיצוב תשובות
│   ├── modules/               # מודול לכל תחום:
│   │   └── <name>/            #   *.routes.ts → *.controller.ts → *.service.ts, *.schemas.ts
│   ├── docs/openapi.ts        # תיעוד Swagger
│   ├── seed/                  # נתוני הדגמה
│   └── scripts/               # יצוא openapi.json
├── tests/                     # בדיקות אוטומטיות
├── docs/
│   ├── openapi.json           # קובץ OpenAPI (נוצר אוטומטית)
│   └── SPEC.md                # מסמך האפיון
├── render.yaml                # הגדרות פריסה ל-Render
└── .env.example               # דוגמה למשתני סביבה
```

**איך בקשה עוברת בשרת:** Route (כתובת) ← Middleware (בדיקת Token והרשאה) ← Controller (בדיקת הנתונים עם Zod) ← Service (לוגיקה ומסד נתונים) ← תשובת JSON.

## הרצה מקומית (במחשב)

דרישות: Node.js 22 ו-PostgreSQL פעיל. אפשר גם להשתמש במסד בענן, כמו Neon, במקום התקנה מקומית.

```bash
npm install
cp .env.example .env          # ובו למלא DATABASE_URL ו-JWT_SECRET
npm run db:deploy             # יצירת הטבלאות
npm run db:seed               # נתוני הדגמה
npm run dev                   # השרת עולה על http://localhost:3000
```

- Swagger: http://localhost:3000/api-docs
- בדיקת בריאות: http://localhost:3000/api/health

### חשבונות הדגמה (רק בפיתוח מקומי)

| תפקיד | אימייל | סיסמה | הערה |
|---|---|---|---|
| דיאטן/מנהל | admin@example.com | Admin1234 | |
| משתמש | user@example.com | User1234 | **משתף** עם הדיאטן, יש לו נתונים ופניות |
| משתמש | user2@example.com | User1234 | **לא משתף**, לבדיקת פרטיות |

בפרודקשן (NODE_ENV=production) החשבונות האלה **לא נוצרים**. חשבון הדיאטן נוצר רק לפי `SEED_ADMIN_EMAIL` ו-`SEED_ADMIN_PASSWORD`.

## פקודות

| פקודה | מה עושה |
|---|---|
| `npm run dev` | הרצה בפיתוח, עם רענון אוטומטי |
| `npm run build` | Prisma Generate והידור ל-`dist/` |
| `npm start` | הרצת הגרסה המהודרת |
| `npm run start:prod` | Migrations והרצה (לענן) |
| `npm run typecheck` | בדיקת טיפוסים של TypeScript |
| `npm test` | בדיקות אוטומטיות (צריך מסד בדיקות, ראו למטה) |
| `npm run db:migrate` | יצירת Migration חדשה אחרי שינוי ב-schema.prisma |
| `npm run db:deploy` | החלת Migrations קיימות |
| `npm run db:seed` | הכנסת נתוני הדגמה |
| `npm run db:studio` | ממשק גרפי לצפייה בטבלאות |
| `npm run openapi:export` | יצירה מחדש של `docs/openapi.json` |

## בדיקות

הבדיקות רצות מול **מסד PostgreSQL נפרד**, כי הן מוחקות ויוצרות נתונים. כברירת מחדל:
`postgresql://postgres:postgres@localhost:5432/diet_test`.
אפשר לשנות דרך המשתנה `TEST_DATABASE_URL`.

```bash
TEST_DATABASE_URL="postgresql://..." npm test
```

> ⚠️ אל תכווני את `TEST_DATABASE_URL` למסד האמיתי. הבדיקות מוחקות את כל הנתונים בו.

## משתני סביבה

| משתנה | חובה | תיאור |
|---|:-:|---|
| `DATABASE_URL` | ✅ | כתובת PostgreSQL |
| `JWT_SECRET` | ✅ | מפתח סודי, לפחות 32 תווים |
| `JWT_EXPIRES_IN` | | תוקף Token (ברירת מחדל `1d`) |
| `CORS_ORIGIN` | | כתובות React מותרות, מופרדות בפסיק, או `*` |
| `PORT` | | פורט (בענן נקבע אוטומטית) |
| `NODE_ENV` | | `development` / `production` |
| `APP_TIMEZONE` | | ברירת מחדל `Asia/Jerusalem` |
| `SEED_ON_START` | | `true` = הכנסת נתוני בסיס בכל עלייה (בטוח, לא דורס) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | | חשבון הדיאטן בפרודקשן |
| `SEED_DEMO_USER_EMAIL` / `SEED_DEMO_USER_PASSWORD` | | משתמש לדוגמה בפרודקשן (אופציונלי) |

## אבטחה

- הסיסמאות נשמרות כ-Hash של bcrypt, ולא מוחזרות לעולם בתשובות.
- JWT חתום ב-HS256 עם תוקף מוגבל. הסוד נשמר רק במשתנה סביבה.
- המשתמש המזוהה נקבע לפי ה-Token בלבד. התפקיד והסטטוס נבדקים מול המסד בכל בקשה, כך שחסימה נכנסת לתוקף מיד.
- רשומה של משתמש אחר מחזירה 404, כאילו אינה קיימת.
- הדיאטן רואה נתונים אישיים רק כשהמשתמש הפעיל שיתוף.
- יש הגבלת ניסיונות התחברות, Helmet ו-CORS שניתן להגדרה.
