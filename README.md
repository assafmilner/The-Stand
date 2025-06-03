
# היציע - רשת חברתית לאוהדי ספורט בישראל

**היציע** היא פלטפורמה חברתית שמאחדת אוהדים, קבוצות, ופוסטים למקום אחד. מטרת המערכת היא לחבר בין אוהדים באותה קבוצה ובקהילות ספורט שונות, תוך שמירה על פרטיות, הרשאות והרבה מאוד פיצ'רים בזמן אמת.

---

## 🚀 טכנולוגיות

### 🔧 Backend
- Node.js + Express
- MongoDB (Mongoose)
- JWT authentication (access + refresh tokens)
- אימות כתובת מייל באמצעות Brevo (SendinBlue)
- WebSockets + Socket.io לצ׳אט בזמן אמת
- שילוב עם [TheSportsDB](https://www.thesportsdb.com/) לצורך שליפת משחקים, טבלאות ליגה, זיהוי פלייאוף, ומידע עדכני על קבוצות
- Cloudinary לאחסון תמונות וסרטונים (פרופילים, פוסטים, קאברים)

- תבנית MVC מלאה

### 🎨 Frontend
- React 18
- CSS3 כולל:
  - `text-shadow`
  - `transition`
  - `multiple-columns`
  - `font-face`
  - `border-radius`
- Canvas + Video
- שימוש ב־JQuery עבור AJAX במודלים ישנים
- שימוש ב־D3.js להצגת גרפים סטטיסטיים

---

## 🧩 פיצ׳רים עיקריים

### משתמשים והרשאות
- הרשמה + התחברות + אימות מייל
- ניהול משתמשים: פרופיל אישי, תמונת קאבר, קבוצת אהדה
- הרשאות לפי תפקיד (משתמש / מנהל קבוצה)
- כל משתמש רואה רק את מה שמותר לו

### קבוצות ופוסטים
- יצירה, עדכון, מחיקה וחיפוש של פוסטים וקבוצות
- פוסטים זמינים רק לחברים בקבוצה או חברים אישיים
- תמיכה בתגובות ולייקים, כולל תגובות לתגובות

### צ׳אט חי בין משתמשים
- מבוסס Socket.io עם אימות JWT
- הודעות נשמרות ב־MongoDB ונשלחות בזמן אמת
- ניהול משתמשים מחוברים

### סטטיסטיקות וגרפים
- גרפים בזמן אמת עם D3.js
- לדוגמה: כמות פוסטים ממוצעת לחודש, התפלגות לפי קבוצות

### שוק כרטיסים
- אוהדים יכולים להציע כרטיסים למכירה
- ניהול כרטיסים לפי קבוצות, משחקים אמיתיים ועוד

---

## 📦 התקנה מקומית

```bash
git clone https://github.com/assafmilner/the-stand.git
cd the-stand
```

### התקנת צד שרת
```bash
cd fan-server
npm install
npm run dev
```

### התקנת צד לקוח
```bash
cd client
npm install
npm start
```

---

## 📂 מבנה תיקיות

```
fan-server/
├── models/             # סכמות Mongoose
├── controllers/        # לוגיקת API
├── routes/             # ראוטים לפי MVC
├── middlewares/        # אימותים, הרשאות, העלאת קבצים
├── utils/              # שירותים חיצוניים: אימייל, JWT, ענן
├── socket/             # לוגיקת צ׳אט בזמן אמת

client/
├── src/components/     # קומפוננטות React
├── src/pages/          # דפי מערכת
├── src/context/        # קונטקסטים (Auth, Chat וכו׳)
├── src/services/       # socketService, api וכו׳
```

---

## 📜 הערות נוספות
- הקוד נבדק ומכיל ולידציות בצד שרת + לקוח
- אין שימוש ב־Firebase (כל המערכת מקומית לחלוטין)
- נבנה עם דגש על scalability, maintainability ו־security

---

© 2025 Assaf Milner & Liat Marely. כל הזכויות שמורות.
