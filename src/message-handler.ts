import { Buttons, Client, List, Message } from "whatsapp-web.js";
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
} from "./firebase/shabbas-manage";
import { HELP_MESSAGE } from "./constants/help-message";
import { sendSpecialMessages } from "./constants/special-response";

export const messageHandler = async (msg: Message) => {
  sendSpecialMessages(msg.from, client);

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
