import { Buttons, List, Message } from "whatsapp-web.js";
import { auth, isAdmin } from "./firebase/authantication";
import { client } from "./app";
import { BOT_MANAGER } from "./constants/bot-manager"
import {
  addShabbas,
  addUser,
  calculateFood,
  getParticipants,
  removeUser,
  setRabbi,
  whoIsTheRabbi,
  addSubscribedYears,
  resetSubscribedYears,
  sessionedSubsribers,
} from "./firebase/shabbas-manage";

export const messageHandler = async (msg: Message) => {
  if (msg.from === "972587943119@c.us") {
    client.sendMessage("972587943119@c.us", "עומו❤️");
  }
  if (msg.from === "972529060306@c.us") {
    client.sendMessage("972529060306@c.us", "אבוששש❤️❤️❤️❤️❤️");
  }

  if (msg.body.startsWith("!new") && (await isAdmin(msg))) {
    await addShabbas(msg);
    return;
  }

  if (msg.body === "!מנות" && (await isAdmin(msg))) {
    await calculateFood(msg);
    return;
  }

  if (msg.body.startsWith("!rabbi") && (await isAdmin(msg))) {
    await setRabbi(msg);
    return;
  }

  if (msg.body.includes("מי מגיע")) {
    await client.sendMessage(
      msg.from,
      "*פיצ'ר חדש!!!* מעכשיו תוכל לערוך אילו מחזורים מעניינים אותך על ידי הפקודה מי מעניין "
    );
    await getParticipants(msg);
    return;
  }

  if (msg.body.includes("מי הרב")) {
    await whoIsTheRabbi(msg);
    return;
  }

  if (msg.body.includes("מי מעניין") || sessionedSubsribers[msg.from]) {
    await addSubscribedYears(msg);
    return;
  }
  if (msg.body.includes("כולם מעניינים אותי")) {
    await resetSubscribedYears(msg);
    await client.sendMessage(msg.from, " די נו איזה חמוד אתה 🤓");
    return;
  }
  if (!(await auth(msg))) {
    return;
  }

  switch (msg.body) {
    case "כן":
      await addUser(msg);
      break;
    case "מגיע":
      await addUser(msg);
      break;
    case "לא":
      await removeUser(msg);
      break;
    default:
      await client.sendMessage(
        msg.from,
        `
      היי, זה בוט השבתות ויו"ט של דרך חיים, הוא לא יודע לעשות הרבה. זה מה שאפשר לעשות בנתיים:
      כן - מאשר הגעה 
      לא - ביטול הגעה 
      מי מגיע - רשימה של כל מי שאישר בנתיים הגעה 
      מי הרב - מי הרב שיהיה
      מי מעניין - אפשרות לסינון מחזורים שמעניינים אותך על הפקודה 'מי מגיע'
      כולם מעניינים אותי - ביטול הסינונים על הפקודה 'מי מגיע'
      בעתיד יתווספו פעולות נוספות 😁
      אם ישנה בעייה צור קשר עם ${BOT_MANAGER.name} (${BOT_MANAGER.phoneNumber})
      `
      );
      break;
  }
};
