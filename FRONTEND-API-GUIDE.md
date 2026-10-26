# 🧩 מדריך API לפיתוח צד ה-React

המסמך מסביר **איך** צד ה-React מתקשר עם השרת: מה שולחים, מה מקבלים, ומה צריך בכל מסך.
את קוד ה-React עצמו (קומפוננטות, Hooks, ניתוב, טפסים, ניהול State) כותבים בעצמכם. המסמך הזה לא כולל קוד React.

> 💡 את כל ה-Endpoints אפשר לנסות ב-Swagger (`/api-docs`) לפני שכותבים קוד. כך רואים בדיוק מה חוזר.

---

## 1. כתובת השרת (Base URL)

| סביבה | Base URL |
|---|---|
| מקומי | `http://localhost:3000` |
| בענן | `https://<שם-השירות>.onrender.com`, למשל `https://diet-tracker-api.onrender.com` |

כל ה-Endpoints מתחילים ב-`/api`. למשל: `https://diet-tracker-api.onrender.com/api/foods`.

**טיפ:** שמרי את ה-Base URL במשתנה סביבה של פרויקט ה-React (ב-Vite, בקובץ `.env`, משתנה שמתחיל ב-`VITE_`). כך עוברים בין מקומי לענן בלי לשנות קוד.

**CORS:** כתובת אתר ה-React חייבת להופיע ב-`CORS_ORIGIN` בשרת. ברירת המחדל מאפשרת `http://localhost:5173`, הכתובת הרגילה של Vite.

---

## 2. התחברות (Authentication)

### איך זה עובד
1. שולחים `POST /api/auth/login` (או `/register`) עם אימייל וסיסמה.
2. השרת מחזיר `token` (JWT) ואובייקט `user`.
3. **שומרים את ה-token**, למשל ב-localStorage, יחד עם `user.role`.
4. **בכל בקשה מוגנת** מוסיפים את הכותרת:
   ```
   Authorization: Bearer <token>
   ```
5. ה-token תקף **יום אחד**. אחרי זה מתקבלת שגיאה **401**, וצריך להעביר את המשתמש למסך הכניסה.

### צורת הבקשה
```
POST /api/auth/login
Content-Type: application/json

{ "email": "user@example.com", "password": "User1234" }
```
תשובה **200**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2, "fullName": "ישראל ישראלי", "email": "user@example.com",
    "role": "USER", "isActive": true,
    "heightCm": 175, "startWeightKg": 88, "targetWeightKg": 78, "birthDate": "1990-05-10",
    "shareWithDietitian": true, "trackId": 2, "menuId": 3,
    "createdAt": "2026-10-01T08:00:00.000Z"
  }
}
```

### לאן להעביר אחרי כניסה
- `user.role === "USER"`: למסכי המשתמש (הבית שלי).
- `user.role === "ADMIN"`: למסכי הדיאטן (משתמשים).

**בטעינת האתר מחדש:** אם שמור token, קראי ל-`GET /api/auth/me`. אם חוזר 200, המשתמש עדיין מחובר. אם חוזר 401 או 403, מוחקים את ה-token ועוברים למסך הכניסה.

**יציאה (Logout):** אין Endpoint ליציאה. פשוט מוחקים את ה-token מהדפדפן.

### חשבונות לבדיקה (שרת מקומי)
| תפקיד | אימייל | סיסמה |
|---|---|---|
| דיאטן | admin@example.com | Admin1234 |
| משתמש (משתף) | user@example.com | User1234 |
| משתמש (לא משתף) | user2@example.com | User1234 |

---

## 3. פורמטים כלליים

- **תאריכים**: מחרוזת `YYYY-MM-DD`, למשל `"2026-10-22"`. זה בדיוק הפורמט של `<input type="date">`.
- **שדות זמן** (`createdAt` וכדומה): ISO, למשל `"2026-10-22T06:30:00.000Z"`.
- **מספרים**: שולחים כ-**מספר** ולא כמחרוזת: `"weightKg": 85.1`, לא `"85.1"`. שדה input תמיד מחזיר מחרוזת, אז צריך להמיר למספר לפני השליחה.
- **תוויות בעברית**: כמעט לכל ערך בחירה מוחזרת גם תווית מוכנה. למשל `mealType: "LUNCH"` מגיע יחד עם `mealTypeLabel: "צהריים"`. כך אין צורך לתרגם בצד שלך.
- **מיון**: כל הרשימות מגיעות כבר ממוינות מהשרת.
- **חישובים**: קלוריות, ציון, אחוזים וסכומים מחושבים **בשרת**. רק מציגים אותם.

### רשימות לתיבות בחירה: `GET /api/options` (ציבורי)
קריאה אחת שמחזירה את כל האפשרויות לתיבות `<select>`:
```json
{
  "trackTypes":   [{ "value": "LOSE", "label": "ירידה במשקל" }, { "value": "MAINTAIN", "label": "שמירה על משקל" }, { "value": "GAIN", "label": "עלייה במשקל" }],
  "difficulties": [{ "value": "EASY", "label": "קל" }, { "value": "MEDIUM", "label": "בינוני" }, { "value": "HARD", "label": "מאתגר" }],
  "foodCategories": [{ "value": "GRAINS", "label": "דגנים" }, { "value": "VEGETABLES", "label": "ירקות" }, "..."],
  "mealTypes":    [{ "value": "BREAKFAST", "label": "בוקר" }, { "value": "LUNCH", "label": "צהריים" }, { "value": "DINNER", "label": "ערב" }, { "value": "SNACK", "label": "ביניים" }],
  "consultationStatuses": [{ "value": "PENDING", "label": "ממתינה לתשובה" }, { "value": "ANSWERED", "label": "נענתה" }],
  "mealSources":  [{ "value": "MENU", "label": "מהתפריט" }, { "value": "OTHER", "label": "מחוץ לתפריט" }]
}
```

---

## 4. שגיאות

כל שגיאה חוזרת **באותו מבנה**, עם הודעה בעברית שאפשר להציג כמו שהיא:
```json
{ "status": 409, "code": "CONFLICT", "message": "כבר קיימת שקילה בתאריך הזה. אפשר לערוך את השקילה הקיימת" }
```
בשגיאת ולידציה (400) יש גם `details`, עם פירוט לפי שדה. כך אפשר להציג כל שגיאה ליד השדה המתאים בטופס:
```json
{
  "status": 400, "code": "VALIDATION_ERROR", "message": "הנתונים שנשלחו אינם תקינים",
  "details": [
    { "field": "weightKg", "message": "הערך חייב להיות לפחות 30" },
    { "field": "date", "message": "לא ניתן להזין תאריך עתידי" }
  ]
}
```

| קוד | משמעות | מה לעשות במסך |
|---|---|---|
| 200 | הצלחה | להציג את הנתונים |
| 201 | נוצר | להוסיף לרשימה או לרענן אותה |
| 204 | נמחק (אין גוף לתשובה) | להסיר מהרשימה. אין JSON לקרוא |
| 400 | נתונים לא תקינים | להציג את `details` ליד השדות |
| 401 | לא מחובר / Token פג | למחוק את ה-token ולעבור למסך הכניסה |
| 403 | אין הרשאה / חשבון חסום / לא משתף | להציג את `message` |
| 404 | לא נמצא | להציג "לא נמצא" |
| 409 | כפילות | להציג את `message` |
| 429 | יותר מדי ניסיונות כניסה | "נסו שוב בעוד כמה דקות" |
| 500 | שגיאת שרת | הודעה כללית |

---

## 5. מבני הנתונים

### Track (מסלול)
```json
{
  "id": 2, "name": "ירידה מתונה", "description": "ירידה הדרגתית של כחצי קילו בשבוע...",
  "type": "LOSE", "typeLabel": "ירידה במשקל",
  "difficulty": "MEDIUM", "difficultyLabel": "בינוני",
  "dailyCalories": 1800, "durationWeeks": 12, "isActive": true, "menusCount": 2,
  "createdAt": "...", "updatedAt": "..."
}
```

### Food (מאכל)
```json
{ "id": 1, "name": "לחם מלא", "category": "GRAINS", "categoryLabel": "דגנים",
  "servingDescription": "2 פרוסות", "caloriesPerServing": 140, "isActive": true, "createdAt": "...", "updatedAt": "..." }
```

### Menu (תפריט)
```json
{
  "id": 3, "trackId": 2, "name": "תפריט חלבי", "description": "בוקר וערב חלביים, צהריים בשרי",
  "isActive": true, "totalCalories": 1566,
  "items": [
    { "id": 16, "mealType": "BREAKFAST", "mealTypeLabel": "בוקר", "servings": 1, "calories": 140,
      "food": { "id": 1, "name": "לחם מלא", "category": "GRAINS", "categoryLabel": "דגנים", "servingDescription": "2 פרוסות", "caloriesPerServing": 140 } }
  ],
  "createdAt": "...", "updatedAt": "..."
}
```
`items` מגיעים ממוינים לפי סדר הארוחות: בוקר, צהריים, ערב, ביניים.

### Weight (שקילה)
```json
{ "id": 5, "date": "2026-10-22", "weightKg": 85.1, "note": null, "createdAt": "..." }
```

### Meal (ארוחה ביומן)
```json
{
  "id": 40, "date": "2026-10-22", "mealType": "BREAKFAST", "mealTypeLabel": "בוקר",
  "servings": 1, "calories": 140,
  "fromMenu": true, "source": "MENU", "sourceLabel": "מהתפריט", "menuItemId": 16,
  "food": { "id": 1, "name": "לחם מלא", "categoryLabel": "דגנים", "servingDescription": "2 פרוסות", "caloriesPerServing": 140, "category": "GRAINS" },
  "createdAt": "...", "updatedAt": "..."
}
```

### Consultation (פנייה)
```json
{ "id": 2, "subject": "ירידה איטית", "message": "השבוע ירדתי פחות...", "status": "PENDING", "statusLabel": "ממתינה לתשובה",
  "answer": null, "answeredAt": null, "createdAt": "...",
  "user": { "id": 2, "fullName": "ישראל ישראלי", "email": "user@example.com" } }
```
השדה `user` מוחזר **רק לדיאטן**.

### Progress (התקדמות)
```json
{ "startWeightKg": 88, "targetWeightKg": 78, "currentWeightKg": 85.1, "changeKg": -2.9, "remainingKg": 7.1, "percent": 29 }
```
אם בפרופיל חסרים משקל התחלתי או משקל יעד, הערך של `percent` הוא `null`. אפשר להציג במקומו "השלימו את הפרופיל".

### הציון היומי
| `status` | `statusLabel` | `score` |
|---|---|---|
| `NO_TRACK` | לא נבחר מסלול | `null` |
| `NO_DATA` | עדיין לא נרשמו ארוחות | `null` |
| `UNDER` | נמוך מהיעד | 0–99 |
| `ON_TARGET` | עמדת ביעד 🎯 | 100 |
| `SLIGHTLY_OVER` | קצת מעל היעד | 0–99 |
| `FAR_OVER` | הרבה מעל היעד | 0–99 |

---

## 6. מסכים ← אילו קריאות צריך

### 🔓 מסך כניסה (התחברות + הרשמה)
| פעולה | קריאה |
|---|---|
| התחברות | `POST /api/auth/login` |
| הרשמה | `POST /api/auth/register` |

**שדות בטופס ההרשמה:**
| שדה | חובה | כללים |
|---|:-:|---|
| `fullName` | ✅ | 2–60 תווים |
| `email` | ✅ | אימייל תקין |
| `password` | ✅ | לפחות 8 תווים, לפחות אות אחת באנגלית ולפחות ספרה אחת |

**אחרי הרשמה:** המשתמש חדש ועוד אין לו פרופיל או מסלול. כדאי להעביר אותו למסך "מסלול ותפריט", או לבקש ממנו להשלים פרופיל.

---

### 👤 הבית שלי (משתמש)
| פעולה | קריאה |
|---|---|
| טעינת המסך | `GET /api/me/dashboard` ו-`GET /api/weights` |
| שמירת פרופיל | `PUT /api/me/profile` |
| מתג שיתוף | `PUT /api/me/profile` עם `{ "shareWithDietitian": true }` |
| הוספת שקילה | `POST /api/weights` |
| עריכת שקילה | `PUT /api/weights/{id}` |
| מחיקת שקילה | `DELETE /api/weights/{id}` |

**`GET /api/me/dashboard` מחזיר:**
```json
{
  "user":  { "...פרטי המשתמש..." },
  "track": { "...המסלול, או null..." },
  "menu":  { "...התפריט, או null..." },
  "progress": { "startWeightKg": 88, "targetWeightKg": 78, "currentWeightKg": 85.1, "changeKg": -2.9, "remainingKg": 7.1, "percent": 29 },
  "today": {
    "date": "2026-10-22", "totalCalories": 1450, "targetCalories": 1800, "remainingCalories": 350,
    "score": 100, "status": "ON_TARGET", "statusLabel": "עמדת ביעד 🎯", "percentOfTarget": 81,
    "menuAdherence": { "eaten": 4, "total": 12 }
  }
}
```

**טופס פרופיל (`PUT /api/me/profile`):** שולחים **רק את השדות שהשתנו**. כל השדות אופציונליים, אבל צריך לשלוח לפחות שדה אחד.
| שדה | טיפוס | כללים |
|---|---|---|
| `fullName` | טקסט | 2–60 |
| `heightCm` | מספר שלם או `null` | 100–250 |
| `startWeightKg` | מספר או `null` | 30–300 |
| `targetWeightKg` | מספר או `null` | 30–300 |
| `birthDate` | `YYYY-MM-DD` או `null` | גיל 18 ומעלה |
| `shareWithDietitian` | `true`/`false` | |

התשובה היא ה-`user` המעודכן.

**טופס שקילה (`POST`/`PUT /api/weights`):**
| שדה | חובה | כללים |
|---|:-:|---|
| `date` | ✅ | `YYYY-MM-DD`, לא תאריך עתידי, **שקילה אחת ליום** (אחרת 409) |
| `weightKg` | ✅ | 30–300 |
| `note` | | עד 200 תווים |

**`GET /api/weights`** מחזיר מערך של Weight, מהחדשה לישנה. הוא מתאים גם לגרף.

---

### 🗺️ מסלול ותפריט (משתמש)
| פעולה | קריאה |
|---|---|
| רשימת מסלולים | `GET /api/tracks` |
| תפריטים של מסלול שנבחר | `GET /api/tracks/{id}/menus` |
| שמירת הבחירה | `PUT /api/me/plan` |
| לדעת מה נבחר כרגע | `user.trackId` ו-`user.menuId` (מתוך dashboard או `/auth/me`) |

**איך זה עובד במסך:** מציגים כרטיסי מסלולים. בלחיצה על מסלול טוענים את התפריטים שלו. כל תפריט כולל `items` ו-`totalCalories`, כך שאפשר להציג את התפריט המלא. בלחיצה על "בחר" שולחים:
```json
{ "trackId": 2, "menuId": 3 }
```
- `menuId` אופציונלי. אפשר לבחור מסלול בלי תפריט.
- התפריט **חייב להיות שייך למסלול**, אחרת מתקבלת שגיאה 400.
- התשובה: `{ "user": ..., "track": ..., "menu": ... }`.

---

### 🍽️ יומן אכילה (משתמש)
| פעולה | קריאה |
|---|---|
| טעינת יום | `GET /api/meals?date=2026-10-22` (בלי `date` מוחזר היום) |
| סינון מהתפריט / מחוץ לתפריט | `GET /api/meals?date=...&source=MENU` או `source=OTHER` |
| "אכלתי ✓" ליד פריט מהתפריט | `POST /api/meals/from-menu` |
| חיפוש מאכל להוספה | `GET /api/foods?search=לחם&category=GRAINS` |
| הוספת ארוחה | `POST /api/meals` |
| עריכת ארוחה | `PUT /api/meals/{id}` |
| מחיקת ארוחה | `DELETE /api/meals/{id}` |

**`GET /api/meals` מחזיר את כל מה שהמסך צריך:**
```json
{
  "date": "2026-10-22",
  "source": "ALL",
  "totalCalories": 1450, "targetCalories": 1800, "remainingCalories": 350,
  "score": 100, "status": "ON_TARGET", "statusLabel": "עמדת ביעד 🎯", "percentOfTarget": 81,
  "caloriesByMealType": { "BREAKFAST": 335, "LUNCH": 525, "DINNER": 410, "SNACK": 180 },
  "menu": { "id": 3, "name": "תפריט חלבי" },
  "menuAdherence": { "eaten": 4, "total": 12 },
  "menuItems": [
    { "id": 16, "mealType": "BREAKFAST", "mealTypeLabel": "בוקר", "servings": 1, "calories": 140,
      "food": { "id": 1, "name": "לחם מלא", "...": "..." }, "eaten": true },
    { "id": 20, "mealType": "LUNCH", "mealTypeLabel": "צהריים", "servings": 1, "calories": 250,
      "food": { "id": 18, "name": "חזה עוף בגריל", "...": "..." }, "eaten": false }
  ],
  "meals": [ { "...Meal..." } ]
}
```
- **"התפריט שלי להיום"** = `menuItems`. אם `eaten: false`, מציגים כפתור "אכלתי ✓". אם `eaten: true`, מציגים ✓ מסומן.
- **הסינון** (`source`) משפיע **רק** על `meals`. הסכומים והציון מחושבים תמיד על כל היום.
- `meals` ממוינות לפי זמן ההוספה. אם רוצים להציג אותן בקבוצות לפי סוג ארוחה, אפשר לקבץ לפי `mealType`.
- אם למשתמש אין תפריט, `menu` הוא `null`, ‏`menuItems` הוא `[]` ו-`menuAdherence` הוא `null`.

**"אכלתי ✓" (`POST /api/meals/from-menu`):**
```json
{ "menuItemId": 20 }
```
אפשר להוסיף `"date": "2026-10-21"` כדי לסמן יום אחר. אם הפריט כבר סומן באותו יום, מתקבלת שגיאה 409.
**אחרי הצלחה:** טוענים מחדש את `GET /api/meals`, כדי לעדכן את הסכומים ואת הציון.

**טופס הוספה או עריכה של ארוחה (`POST`/`PUT /api/meals`):**
| שדה | חובה | כללים |
|---|:-:|---|
| `date` | ✅ | `YYYY-MM-DD`, לא עתידי |
| `mealType` | ✅ | `BREAKFAST` / `LUNCH` / `DINNER` / `SNACK` |
| `foodId` | ✅ | מזהה מאכל מתוך `GET /api/foods` |
| `servings` | ✅ | 0.25–20 (אפשר 1.5) |

את הקלוריות **לא שולחים**, השרת מחשב אותן. אם המאכל וסוג הארוחה מופיעים בתפריט, הארוחה תסומן "מהתפריט" אוטומטית.

**חיפוש מאכלים (`GET /api/foods`):** `search` מחפש חלק מהשם, ו-`category` מסנן לפי קטגוריה. אפשר לשלב את שניהם. החיפוש לא תלוי באותיות גדולות או קטנות.

---

### 💬 פניות (משתמש)
| פעולה | קריאה |
|---|---|
| הפניות שלי | `GET /api/consultations` |
| שליחת פנייה | `POST /api/consultations` |

**טופס פנייה:**
| שדה | חובה | כללים |
|---|:-:|---|
| `subject` | ✅ | 3–100 תווים |
| `message` | ✅ | 5–2000 תווים |

⚠️ אם השיתוף כבוי (`user.shareWithDietitian === false`), מתקבלת שגיאה **403**. כדאי להציג במסך הודעה כמו "כדי לשלוח פנייה יש להפעיל שיתוף", יחד עם קישור לבית שלי.

---

### 🩺 משתמשים (דיאטן)
| פעולה | קריאה |
|---|---|
| רשימה וחיפוש | `GET /api/admin/users?search=ישראל` |
| פתיחת משתמש | `GET /api/admin/users/{id}` |
| יומן האכילה של המשתמש | `GET /api/admin/users/{id}/meals?date=...&source=...` |
| חסימה / הפעלה | `PATCH /api/admin/users/{id}/status` עם `{ "isActive": false }` |

**רשימה:**
```json
[ { "id": 2, "fullName": "ישראל ישראלי", "email": "user@example.com", "isActive": true,
    "shareWithDietitian": true, "track": { "id": 2, "name": "ירידה מתונה" }, "pendingConsultations": 1, "createdAt": "..." } ]
```

**`GET /api/admin/users/{id}`, כשהמשתמש משתף:**
```json
{ "user": { "...": "..." }, "sharing": true, "message": null,
  "overview": { "track": {}, "menu": {}, "progress": {}, "today": {} },
  "weights": [ { "...Weight..." } ] }
```
**כשהמשתמש לא משתף:**
```json
{ "user": { "id": 3, "fullName": "משה לוי", "email": "...", "isActive": true, "shareWithDietitian": false, "createdAt": "..." },
  "sharing": false, "message": "המשתמש לא שיתף את המידע שלו עם הדיאטן", "overview": null, "weights": null }
```
כשמשתמש לא משתף, הקריאה ליומן האכילה שלו (`/meals`) מחזירה **403**. התשובה של `/meals` כאן זהה במבנה שלה ל-`GET /api/meals` של המשתמש.

---

### 🗂️ מסלולים ותפריטים (דיאטן)
| פעולה | קריאה |
|---|---|
| כל המסלולים (כולל מושבתים) | `GET /api/tracks` |
| הוספת מסלול | `POST /api/tracks` |
| עריכת מסלול | `PUT /api/tracks/{id}` |
| הפעלה / השבתה | `PATCH /api/tracks/{id}/status` עם `{ "isActive": false }` |
| התפריטים של מסלול (כולל מושבתים) | `GET /api/tracks/{id}/menus` |
| הוספת תפריט | `POST /api/menus` |
| עריכת תפריט | `PUT /api/menus/{id}` |
| הפעלה / השבתה של תפריט | `PATCH /api/menus/{id}/status` |

**טופס מסלול:** כל השדות חובה, גם בעריכה.
| שדה | כללים |
|---|---|
| `name` | 2–60, ייחודי |
| `description` | 5–500 |
| `type` | `LOSE` / `MAINTAIN` / `GAIN` |
| `difficulty` | `EASY` / `MEDIUM` / `HARD` |
| `dailyCalories` | מספר שלם, 1000–4500 |
| `durationWeeks` | מספר שלם, 1–104 |

**טופס תפריט:** שולחים את כל הפריטים בבת אחת.
```json
{
  "trackId": 2,
  "name": "תפריט צמחוני",
  "description": "ללא בשר",
  "items": [
    { "mealType": "BREAKFAST", "foodId": 1, "servings": 1 },
    { "mealType": "LUNCH", "foodId": 22, "servings": 1.5 }
  ]
}
```
- `trackId` נשלח **רק ביצירה**. בעריכה (`PUT`) שולחים רק `name`, `description` ו-`items`.
- `items`: לפחות פריט אחד. אי אפשר שאותו מאכל יופיע פעמיים באותה ארוחה. מותר להשתמש רק במאכלים פעילים.
- בעריכה, רשימת `items` **מחליפה** את כל הפריטים הקודמים.

---

### 🥗 מאכלים (דיאטן)
| פעולה | קריאה |
|---|---|
| כל המאכלים (כולל מושבתים) + חיפוש | `GET /api/foods?search=&category=` |
| הוספה | `POST /api/foods` |
| עריכה | `PUT /api/foods/{id}` |
| הפעלה / השבתה | `PATCH /api/foods/{id}/status` |

**טופס מאכל:** כל השדות חובה.
| שדה | כללים |
|---|---|
| `name` | 2–60, ייחודי |
| `category` | אחד מ-`foodCategories` |
| `servingDescription` | 1–60, למשל "2 פרוסות" |
| `caloriesPerServing` | מספר שלם, 0–2000 |

---

### 📨 פניות (דיאטן)
| פעולה | קריאה |
|---|---|
| כל הפניות | `GET /api/consultations` |
| סינון | `GET /api/consultations?status=PENDING` או `ANSWERED` |
| מענה | `PATCH /api/consultations/{id}/answer` עם `{ "answer": "..." }` (2–2000 תווים) |

---

## 7. טבלת הרשאות מלאה (36 Endpoints)

🔓 ציבורי · 🔐 כל מחובר · 👤 משתמש רגיל · 🩺 דיאטן

| # | Method | URL | הרשאה |
|:-:|---|---|:-:|
| 1 | GET | `/api/health` | 🔓 |
| 2 | GET | `/api/options` | 🔓 |
| 3 | POST | `/api/auth/register` | 🔓 |
| 4 | POST | `/api/auth/login` | 🔓 |
| 5 | GET | `/api/auth/me` | 🔐 |
| 6 | GET | `/api/me/dashboard` | 👤 |
| 7 | PUT | `/api/me/profile` | 👤 |
| 8 | PUT | `/api/me/plan` | 👤 |
| 9 | GET | `/api/tracks` | 🔐 |
| 10 | POST | `/api/tracks` | 🩺 |
| 11 | PUT | `/api/tracks/{id}` | 🩺 |
| 12 | PATCH | `/api/tracks/{id}/status` | 🩺 |
| 13 | GET | `/api/tracks/{id}/menus` | 🔐 |
| 14 | POST | `/api/menus` | 🩺 |
| 15 | PUT | `/api/menus/{id}` | 🩺 |
| 16 | PATCH | `/api/menus/{id}/status` | 🩺 |
| 17 | GET | `/api/foods` | 🔐 |
| 18 | POST | `/api/foods` | 🩺 |
| 19 | PUT | `/api/foods/{id}` | 🩺 |
| 20 | PATCH | `/api/foods/{id}/status` | 🩺 |
| 21 | GET | `/api/weights` | 👤 |
| 22 | POST | `/api/weights` | 👤 |
| 23 | PUT | `/api/weights/{id}` | 👤 |
| 24 | DELETE | `/api/weights/{id}` | 👤 |
| 25 | GET | `/api/meals` | 👤 |
| 26 | POST | `/api/meals` | 👤 |
| 27 | POST | `/api/meals/from-menu` | 👤 |
| 28 | PUT | `/api/meals/{id}` | 👤 |
| 29 | DELETE | `/api/meals/{id}` | 👤 |
| 30 | GET | `/api/consultations` | 🔐 (משתמש: שלו, דיאטן: הכל) |
| 31 | POST | `/api/consultations` | 👤 (רק עם שיתוף פעיל) |
| 32 | PATCH | `/api/consultations/{id}/answer` | 🩺 |
| 33 | GET | `/api/admin/users` | 🩺 |
| 34 | GET | `/api/admin/users/{id}` | 🩺 |
| 35 | PATCH | `/api/admin/users/{id}/status` | 🩺 |
| 36 | GET | `/api/admin/users/{id}/meals` | 🩺 (רק אם המשתמש משתף) |

**שימי לב:**
- דיאטן שקורא ל-Endpoint של משתמש רגיל (👤) מקבל **403**, וגם להפך.
- רשומה של משתמש אחר (שקילה או ארוחה) מחזירה **404**, כאילו היא לא קיימת.
- מסתירים כפתורים לפי `role` רק כדי שהממשק יהיה נוח. **השרת בודק הרשאות בכל מקרה.**
