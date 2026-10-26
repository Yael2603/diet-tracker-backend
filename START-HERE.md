# 🚀 מתחילים כאן: העלאת השרת לאינטרנט

המדריך הזה מסביר צעד אחרי צעד איך מעלים את השרת לאינטרנט. לא צריך ניסיון קודם, ולא צריך להתקין שום דבר במחשב: הכול נעשה דרך הדפדפן.

**מה נעשה, בקצרה:**
1. **GitHub**: נעלה לשם את קבצי הפרויקט.
2. **Neon**: נפתח שם מסד נתונים חינמי.
3. **Render**: נריץ שם את השרת, והוא יקרא את הקבצים מ-GitHub.
4. **בדיקה**: נוודא שהכול עובד דרך Swagger.

**זמן משוער:** 30–45 דקות.

> ⚠️ **הערה חשובה:** אתרי GitHub, Neon ו-Render מעדכנים מדי פעם את העיצוב ואת שמות הכפתורים. השמות כאן נכונים לפי מה שידוע לי, אבל לא יכולתי לבדוק את הממשק העדכני ממש. אם כפתור נקרא קצת אחרת, חפשי כפתור עם משמעות דומה.
>
> 💰 **לגבי "חינם":** כל השירותים כאן מציעים כיום מסלול חינמי, אבל עם מגבלות, והתנאים יכולים להשתנות. **אין צורך להכניס כרטיס אשראי.** אם אתר מבקש כרטיס, עצרי ובדקי את חלק ו' (חלופות).

---

## חלק א: GitHub (שמירת הקוד)

### 1. פתיחת חשבון
1. היכנסי ל-https://github.com
2. לחצי **Sign up**.
3. הזיני אימייל, סיסמה ושם משתמש, ואשרי את האימייל שתקבלי.

### 2. יצירת Repository (מאגר)
1. אחרי ההתחברות, לחצי על **+** בפינה העליונה ואז **New repository**.
2. **Repository name**: `diet-tracker-backend`
3. בחרי **Public** או **Private**. שתי האפשרויות עובדות עם Render.
4. **אל תסמני** את "Add a README file". כבר יש לנו README.
5. לחצי **Create repository**.

### 3. חילוץ קובץ ה-ZIP
1. מצאי במחשב את הקובץ `backend-project.zip`.
2. **Windows**: לחיצה ימנית, **Extract All** (חלץ הכול), **Extract**.
   **Mac**: לחיצה כפולה על הקובץ.
3. תתקבל תיקייה בשם `backend-project`. היכנסי אליה. בפנים יש תיקיות כמו `src` ו-`prisma`, וקבצים כמו `package.json`.

> 🔍 **חשוב: הציגי קבצים מוסתרים.** יש קבצים ששמם מתחיל בנקודה, כמו `.gitignore`, ‏`.env.example` ו-`.node-version`. צריך להעלות גם אותם.
> - **Windows**: בסייר הקבצים, **View** (תצוגה), **Show**, **Hidden items** (פריטים מוסתרים).
> - **Mac**: בתוך התיקייה לחצי `Cmd + Shift + .` (נקודה).

### 4. העלאת הקבצים דרך הדפדפן
1. בעמוד ה-Repository החדש, לחצי על הקישור **uploading an existing file**. אם כבר יש קבצים, השתמשי ב-**Add file** ואז **Upload files**.
2. פתחי את התיקייה `backend-project` במחשב, וסמני **את כל מה שבתוכה**: `Ctrl+A` ב-Windows, או `Cmd+A` ב-Mac.
3. גררי את כל הקבצים והתיקיות לחלון הדפדפן.
   ⚠️ גררי את **התוכן** של התיקייה, ולא את התיקייה `backend-project` עצמה.
4. חכי שכל הקבצים יסיימו לעלות.
5. למטה, בשדה **Commit changes**, כתבי למשל: `העלאה ראשונה`.
6. לחצי **Commit changes**.

### 5. בדיקה שהקבצים נמצאים ב-GitHub
בעמוד הראשי של ה-Repository אמורים להופיע, **ישירות ברמה העליונה**:
- תיקיות: `src`, `prisma`, `tests`, `docs`
- קבצים: `package.json`, `package-lock.json`, `render.yaml`, `README.md`, `.gitignore`

✅ לחצי על `prisma` ואז על `migrations`. צריכה להופיע שם תיקייה שהשם שלה מתחיל במספר. בלעדיה הטבלאות לא ייווצרו.

❌ **אסור** שיופיעו התיקייה `node_modules` או קובץ בשם `.env` (בלי `.example`). ב-ZIP הם לא קיימים, אז אם הכול בסדר, לא תראי אותם.

---

## חלק ב: מסד נתונים (Neon, PostgreSQL חינמי)

בחרנו ב-**Neon**, כי במסלול החינמי שלו מסד הנתונים לא נמחק אחרי זמן קצוב.
(במסד הנתונים החינמי של Render עצמו, המסד **נמחק אחרי 30 יום**, ולכן לא נשתמש בו.)

### 1. פתיחת חשבון
1. היכנסי ל-https://neon.com
2. לחצי **Sign up**. הכי פשוט להירשם עם חשבון ה-GitHub שפתחת: **Continue with GitHub**.

### 2. יצירת מסד נתונים
1. בפעם הראשונה תתבקשי ליצור **Project**:
   - **Project name**: `diet-tracker`
   - **Postgres version**: השאירי את ברירת המחדל.
   - **Region**: בחרי אזור באירופה, למשל **Frankfurt**. הוא קרוב לשרת שניצור ב-Render.
2. לחצי **Create project**.

### 3. קבלת כתובת החיבור (Connection String)
1. בעמוד הפרויקט לחצי **Connect**, או חפשי את **Connection Details** בלוח הבקרה.
2. ודאי ש-**Connection pooling** **כבוי**. אנחנו צריכות את החיבור **הישיר**, כי Prisma צריך אותו כדי ליצור טבלאות.
3. העתיקי את הכתובת. היא נראית בערך כך:
   ```
   postgresql://neondb_owner:AbC123xyz@ep-cool-name-123456.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
   (אם יש בכתובת המילה `-pooler`, סימן שה-pooling דולק. כבי אותו והעתיקי שוב.)

### 4. שמירה בטוחה
- הכתובת הזו כוללת **סיסמה**. שמרי אותה במקום פרטי, למשל בפתק במחשב.
- **אל תכתבי אותה בשום קובץ** שעולה ל-GitHub, ואל תשלחי אותה לאף אחד.
- אם היא דלפה בטעות: ב-Neon אפשר לאפס סיסמה (**Reset password**) ולקבל כתובת חדשה.

### 5. חיבור השרת למסד
את הכתובת נכניס בשלב הבא, ב-Render, כמשתנה סביבה בשם `DATABASE_URL`.
את הטבלאות לא צריך ליצור ידנית. השרת יוצר אותן בעצמו בכל הפעלה, באמצעות Prisma Migrations.

> **חלופה: Supabase.** אם תבחרי ב-Supabase (https://supabase.com): פתחי Project, לחצי **Connect**, ובחרי את הכתובת מסוג **Session pooler** (פורט 5432). החליפי בה את `[YOUR-PASSWORD]` בסיסמה שבחרת. שימי לב: פרויקט חינמי ב-Supabase "נרדם" אחרי תקופה בלי שימוש, וצריך להעיר אותו מהאתר.

---

## חלק ג: Render (הרצת השרת)

### 1. פתיחת חשבון
1. היכנסי ל-https://render.com
2. לחצי **Get Started** והירשמי עם **GitHub**. כך החיבור ל-GitHub נעשה כבר בהרשמה.

### 2. חיבור GitHub
אם נרשמת עם GitHub, Render יבקש אישור גישה למאגרים שלך. אפשר לבחור **Only select repositories** ולסמן רק את `diet-tracker-backend`.

### 3. יצירת Web Service
1. בלוח הבקרה לחצי **+ New** ואז **Web Service**.
2. בחרי את המקור **Git Provider** / **GitHub**.

### 4. בחירת ה-Repository
בחרי `diet-tracker-backend` ולחצי **Connect**.
(אם הוא לא מופיע, לחצי **Configure account** ותני ל-Render גישה אליו.)

### 5. הגדרות Build ו-Start
מלאי את השדות **בדיוק** כך:

| שדה | ערך |
|---|---|
| **Name** | `diet-tracker-api` (השם יהיה חלק מכתובת האתר) |
| **Language** / **Runtime** | `Node` |
| **Branch** | `main` |
| **Region** | `Frankfurt (EU Central)` |
| **Root Directory** | השאירי **ריק** |
| **Build Command** | `npm ci --include=dev && npm run build` |
| **Start Command** | `npm run start:prod` |
| **Instance Type** | **Free** |

### 6. משתני סביבה (Environment Variables)
באותו עמוד, באזור **Environment Variables**, לחצי **Add Environment Variable** והוסיפי את המשתנים האלה, אחד אחד:

| NAME | VALUE |
|---|---|
| `NODE_ENV` | `production` |
| `NODE_VERSION` | `22` |
| `DATABASE_URL` | הכתובת מ-Neon (חלק ב, שלב 3) |
| `JWT_SECRET` | מחרוזת אקראית ארוכה. ליד השדה יש כפתור **Generate**, ואפשר להשתמש בו |
| `JWT_EXPIRES_IN` | `1d` |
| `CORS_ORIGIN` | כרגע `http://localhost:5173`. כשיהיה לך אתר React באינטרנט, הוסיפי את הכתובת שלו אחרי פסיק |
| `SEED_ON_START` | `true` |
| `SEED_ADMIN_EMAIL` | האימייל שאיתו תתחברי כדיאטן |
| `SEED_ADMIN_PASSWORD` | סיסמה חזקה לדיאטן, **לפחות 10 תווים** |

> 🔐 את JWT_SECRET ואת סיסמת הדיאטן לא צריך לזכור בעל פה, אבל **אל תשתפי אותם**.
> `SEED_ON_START=true` מכניס בכל הפעלה את המאכלים, המסלולים והתפריטים, ויוצר את חשבון הדיאטן אם הוא עדיין לא קיים. זה **לא דורס** שינויים שעשית.

**Health Check:** פתחי **Advanced**, ובשדה **Health Check Path** כתבי `/api/health`.

### 7. Prisma Migrations
לא צריך לעשות כלום. פקודת ה-Start (`npm run start:prod`) מריצה קודם `prisma migrate deploy`, שיוצר את הטבלאות, ורק אחר כך מפעילה את השרת. כך זה קורה אוטומטית בכל Deploy.

### 8. Deploy
1. לחצי **Deploy Web Service** (או **Create Web Service**).
2. ייפתח מסך **Logs**. הבנייה הראשונה לוקחת כמה דקות.
3. כשהכול תקין, יופיעו בלוג השורות:
   ```
   All migrations have been successfully applied.
   ✓ נוצר חשבון דיאטן
   ✅ השרת פועל על פורט ...
   ```
   וליד שם השירות יופיע **Live**.

### 9. בדיקה שהשרת פעיל
למעלה בעמוד מופיעה כתובת השרת, למשל: `https://diet-tracker-api.onrender.com`. פתחי:
```
https://diet-tracker-api.onrender.com/api/health
```
אמור להופיע:
```json
{"status":"ok","database":"up","timestamp":"..."}
```

> 😴 **השרת "נרדם":** במסלול החינמי, אחרי 15 דקות בלי שימוש השרת נכבה. הכניסה הבאה אליו לוקחת **כדקה**, ובזמן הזה מוצג מסך טעינה. זה תקין.
>
> **שימוש ב-render.yaml (לא חובה):** בפרויקט יש קובץ `render.yaml` עם כל ההגדרות. אפשר ליצור את השירות גם דרך **+ New** ואז **Blueprint**, ולבחור את ה-Repository. Render יקרא את ההגדרות מהקובץ, ויבקש ממך למלא רק את `DATABASE_URL`, ‏`CORS_ORIGIN`, ‏`SEED_ADMIN_EMAIL` ו-`SEED_ADMIN_PASSWORD`.

---

## חלק ד: בדיקה שהכול עובד

בדוגמאות כאן הכתובת היא `https://diet-tracker-api.onrender.com`. החליפי אותה בכתובת שלך.

### 1. בדיקת בריאות
פתחי `/api/health`, וודאי שמופיעים `"status":"ok"` ו-`"database":"up"`.

### 2. פתיחת Swagger
פתחי `https://diet-tracker-api.onrender.com/api-docs`.
יופיע דף עם כל ה-Endpoints, מסודרים בקבוצות.

### 3. התחברות מתוך Swagger
1. בקבוצה **התחברות**, לחצי על `POST /api/auth/login`.
2. לחצי **Try it out**.
3. בתיבה **Request body** כתבי את פרטי הדיאטן שהגדרת ב-Render:
   ```json
   { "email": "האימייל-שלך@example.com", "password": "הסיסמה-שבחרת" }
   ```
4. לחצי **Execute**.

### 4. קבלת ה-JWT
בתשובה (**Response body**) יופיע:
```json
{ "token": "eyJhbGciOi...", "user": { ... "role": "ADMIN" } }
```
העתיקי את הערך של `token`, **בלי המירכאות**.

### 5. שימוש ב-Authorize
1. גללי לראש הדף ולחצי על הכפתור **Authorize** 🔓.
2. הדביקי את ה-token בשדה **Value**. לא צריך לכתוב את המילה Bearer.
3. לחצי **Authorize** ואז **Close**. המנעול ייסגר 🔒.

### 6. קריאה ל-Endpoint מוגן
פתחי `GET /api/admin/users`, לחצי **Try it out** ואז **Execute**. אמורה לחזור תשובה **200**, עם רשימה (בהתחלה ריקה).

**בדיקת 401:** לחצי **Authorize**, ואז **Logout**, ונסי שוב. תקבלי **401**.

**בדיקת 403:** הירשמי כמשתמש רגיל דרך `POST /api/auth/register`, היכנסי עם ה-token שלו ב-Authorize, ונסי `GET /api/admin/users`. תקבלי **403**.

### 7. הוספת רשומה
מחוברת כדיאטן, פתחי `POST /api/foods`, לחצי **Try it out**, ושלחי:
```json
{ "name": "כוסמת מבושלת", "category": "GRAINS", "servingDescription": "כוס", "caloriesPerServing": 155 }
```
אמורה לחזור תשובה **201**, עם `id` חדש.

### 8. שליפת הרשומה ממסד הנתונים
פתחי `GET /api/foods`, ובשדה `search` כתבי `כוסמת`. המאכל שהוספת יופיע ברשימה, כי הוא נשמר במסד.
אפשר לראות אותו גם ב-Neon: בתפריט הצד **Tables**, ואז הטבלה `foods`.

🎉 **אם הגעת לכאן, השרת שלך באוויר!**

---

## חלק ה: פתרון תקלות

| תקלה | מה רואים | פתרון |
|---|---|---|
| **Build Failed** | הבנייה נכשלת בלוג | ודאי ש-**Build Command** הוא בדיוק `npm ci --include=dev && npm run build`. ודאי ש-`package.json` ו-`package-lock.json` נמצאים ברמה העליונה של ה-Repository ולא בתוך תיקייה נוספת. אם הם בתוך תיקייה: מלאי את **Root Directory** בשם התיקייה, או העלי מחדש את התוכן ישירות. |
| **DATABASE_URL שגוי** | בלוג: `P1001: Can't reach database server` או `P1000: Authentication failed` | העתיקי מחדש את הכתובת מ-Neon, בלי רווחים ובלי מירכאות. ודאי שהיא מתחילה ב-`postgresql://` ומסתיימת ב-`?sslmode=require`. ב-Supabase, ודאי שהחלפת את `[YOUR-PASSWORD]`. |
| **DATABASE_URL חסר** | בלוג: `DATABASE_URL חסר` | הוסיפי את המשתנה ב-Render: **Environment**, ואז **Add Environment Variable**. אחר כך **Save, rebuild, and deploy**. |
| **בעיית Prisma** | בלוג: `prisma: not found` | ודאי שה-Build Command כולל `--include=dev`. |
| **בעיית Migration** | בלוג: `P3009` או `migrate found failed migrations` | ודאי שכתובת Neon היא של חיבור **ישיר**, בלי `-pooler`. אם זה מסד חדש וריק, אפשר למחוק אותו ב-Neon, ליצור חדש, ולעדכן את `DATABASE_URL`. |
| **התיקייה migrations חסרה** | השרת עולה, אבל כל קריאה מחזירה 500 (הטבלאות לא קיימות) | ודאי שב-GitHub קיימת התיקייה `prisma/migrations/...`. אם לא, העלי אותה. |
| **JWT_SECRET חסר** | בלוג: `JWT_SECRET חסר` או `חייב להכיל לפחות 32 תווים` | הוסיפי `JWT_SECRET` עם ערך ארוך (כפתור Generate). |
| **שגיאת CORS** | ב-React, בקונסולה של הדפדפן: `blocked by CORS policy` | הוסיפי את כתובת ה-React **המדויקת** ל-`CORS_ORIGIN`, בלי `/` בסוף. למשל: `http://localhost:5173,https://my-app.netlify.app`. שמרי והמתיני ל-Deploy מחדש. |
| **401** | `"code":"UNAUTHORIZED"` | לא נשלח Token, ה-Token לא תקין, או שפג תוקפו (אחרי יום). התחברי מחדש והעתיקי Token חדש. ב-Swagger, ודאי שלחצת Authorize. |
| **403** | `"code":"FORBIDDEN"` | המשתמש מחובר, אבל אין לו הרשאה לפעולה. למשל: משתמש רגיל שמנסה פעולת דיאטן, דיאטן שמנסה להוסיף שקילה, משתמש חסום, או משתמש שלא הפעיל שיתוף. קראי את ה-`message`, הוא מסביר בעברית. |
| **Swagger לא נפתח** | דף ריק או 404 | ודאי שהכתובת היא `/api-docs` (עם מקף), וחכי דקה אם השרת התעורר משינה. |
| **השרת לא עולה** | הסטטוס נשאר **Deploying** ואחר כך **Failed** | פתחי **Logs** וחפשי שורה עם ❌. ודאי ש-**Start Command** הוא `npm run start:prod`, וש-**Health Check Path** הוא `/api/health`. |
| **השרת איטי מאוד בכניסה הראשונה** | המתנה של כדקה | זה תקין במסלול החינמי. השרת "התעורר משינה". |
| **שכחתי את סיסמת הדיאטן** | | שנו ב-Render את `SEED_ADMIN_EMAIL` לאימייל חדש ואת `SEED_ADMIN_PASSWORD` לסיסמה חדשה, ושמרו. בעלייה הבאה ייווצר חשבון דיאטן חדש. |

---

## חלק ו: חלופות

- **אם Render דורש תשלום או כרטיס אשראי:** אפשר להשתמש בשירות אחר שמריץ Node.js, למשל **Koyeb** או **Railway**. התנאים החינמיים שלהם משתנים, אז כדאי לבדוק בעמוד המחירים לפני ההרשמה. בכל שירות כזה צריך להגדיר את אותן שלוש פקודות:
  - Build: `npm ci --include=dev && npm run build`
  - Start: `npm run start:prod`
  - ואת אותם משתני סביבה מחלק ג.
- **אם Neon לא זמין:** אפשר להשתמש ב-**Supabase**, ראו את ההערה בחלק ב.
- השרת לא תלוי בספק מסוים. כל מסד PostgreSQL עובד, כל עוד יש לו `DATABASE_URL`.

---

## כשמעדכנים קוד

1. ב-GitHub: **Add file**, ואז **Upload files**. מעלים את הקובץ המעודכן לאותה תיקייה, ולוחצים **Commit changes**.
2. Render יזהה את השינוי ויבצע Deploy מחדש לבד (**Auto-Deploy**).

---

## חלק ז: העלאת צד ה-React לענן (Client)

בפרויקט צריך להעלות לענן **שלושה חלקים**: שרת (Render), מסד נתונים (Neon), ו-**Client** (אתר ה-React). את קוד ה-React כותבים בעצמכם. כאן מוסבר רק איך מעלים אותו.

1. העלי את פרויקט ה-React ל-GitHub, ל-**Repository נפרד**, למשל `diet-tracker-client`, באותה דרך כמו בחלק א. **בלי** התיקייה `node_modules`.
2. כתובת השרת צריכה להגיע ל-React דרך משתנה סביבה. בפרויקט Vite, משתנה כזה חייב להתחיל ב-`VITE_`. לדוגמה: `VITE_API_URL`.
3. ב-Render: **+ New**, ואז **Static Site**. בחרי את ה-Repository של ה-React, ומלאי:

   | שדה | ערך (לפרויקט Vite) |
   |---|---|
   | **Build Command** | `npm ci && npm run build` |
   | **Publish Directory** | `dist` |
   | **Environment Variables** | `VITE_API_URL` = `https://diet-tracker-api.onrender.com` |

4. **ניתוב (React Router):** כדי שרענון של עמוד פנימי, למשל `/meals`, לא יחזיר 404, צריך להוסיף ב-Static Site, תחת **Redirects/Rewrites**, כלל:
   Source: `/*` ← Destination: `/index.html` ← Action: **Rewrite**.
5. אחרי שהאתר עולה, תקבלי כתובת כמו `https://diet-tracker-client.onrender.com`.
   **חזרי לשירות השרת** ב-Render, ופתחי **Environment**. עדכני את `CORS_ORIGIN` כך:
   ```
   http://localhost:5173,https://diet-tracker-client.onrender.com
   ```
   ושמרי. בלי השלב הזה, הדפדפן יחסום את הבקשות (שגיאת CORS).

**מה מגישים בסוף:**
- קישור ל-GitHub של השרת, וקישור ל-GitHub של ה-Client. בשניהם בלי `node_modules`.
- כתובת האתר (Client) בענן. השרת ומסד הנתונים כבר באוויר מהשלבים הקודמים.
