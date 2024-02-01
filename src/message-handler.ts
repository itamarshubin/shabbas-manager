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
  addSubscribedYears,
  resetSubscribedYears,
  sessionedSubscribers,
  addAlcoholic,
  removeAlcoholic,
  getAlcoholics,
} from "./firebase/shabbas-manage";
import { HELP_MESSAGE } from "./constants/help-message";

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

  if (msg.body.includes("מי מעניין") || sessionedSubscribers[msg.from]) {
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

  //Alcohol Functions
  if (msg.body.includes("מי מביא אלכוהול")) {
    await getAlcoholics(msg);
    return;
  }

  if (msg.body.includes("אני רוצה אלכוהול")) {
    await addAlcoholic(msg);
    return;
  }

  if (msg.body.includes("אני לא רוצה אלכוהול")) {
    await removeAlcoholic(msg);
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
      await client.sendMessage(msg.from, HELP_MESSAGE);
      break;
  }
};
