import { Buttons, List, Message } from "whatsapp-web.js";
import { auth, isAdmin } from "./firebase/authantication";
import { client } from "./app";
import {
  addShabbas,
  addUser,
  calculateFood,
  getParticipants,
  removeUser,
  setRabbi,
  whoIsTheRabbi,
} from "./firebase/shabbas-manage";

export const messageHandler = async (msg: Message) => {
  if (msg.from === "972587943119@c.us") {
    client.sendMessage("972587943119@c.us", "עומו");
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
    await getParticipants(msg);
    return;
  }

  if (msg.body.includes("מי הרב")) {
    await whoIsTheRabbi(msg);
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
      היי, זה בוט השבתות של דרך חיים, הוא לא יודע לעשות הרבה. זה מה שאפשר לעשות בנתיים:
      כן - מאשר הגעה לשבת
      לא - ביטול הגעה לשבת
      מי מגיע - רשימה של כל מי שאישר בנתיים הגעה לשבת
      מי הרב - מי הרב שיהיה בשבת
      בעתיד יתווספו פעולות נוספות 😁
      אם ישנה בעייה צור קשר עם איתמר שובין (051-2665020)
      `
      );
      break;
  }
};
