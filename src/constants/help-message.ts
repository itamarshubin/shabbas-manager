import { BOT_MANAGER } from "./bot-manager";

export const HELP_MESSAGE: string = `
היי, זה בוט השבתות ויו"ט של דרך חיים, הוא לא יודע לעשות הרבה. זה מה שאפשר לעשות בנתיים:
כן - מאשר הגעה 
לא - ביטול הגעה 
מי מגיע - רשימה של כל מי שאישר בנתיים הגעה 
מי הרב - מי הרב שיהיה
מי מעניין - אפשרות לסינון מחזורים שמעניינים אותך על הפקודה 'מי מגיע'
כולם מעניינים אותי - ביטול הסינונים על הפקודה 'מי מגיע'
בעתיד יתווספו פעולות נוספות 😁
עדכן אותי - אפשרות לקבלת עדכונים על משתמש
אל תעדכן - להפסיק לקבל עדכונים על משתמש
אם ישנה בעייה צור קשר עם ${BOT_MANAGER.name} (${BOT_MANAGER.phoneNumber})
` as const;
