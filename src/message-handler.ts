import { Message } from "whatsapp-web.js";
import { client } from "./app";
import { HELP_MESSAGE } from "./constants/help-message";
import { sendSpecialMessages } from "./constants/special-response";
import {
  createAlertSubscription,
  removeAlertSubscription,
  sessionedAddSubscribersAlert,
  sessionedRemoveSubscribersAlert,
} from "./constants/subscription";
import { auth, isAdmin } from "./firebase/authantication";
import {
  addAlcoholic,
  addShabbas,
  addSubscribedYears,
  addUser,
  calculateFood,
  closeShabbas,
  getAlcoholics,
  getParticipants,
  removeAlcoholic,
  removeUser,
  resetSubscribedYears,
  resumeShabbas,
  sendAll,
  sendParticipants,
  sessionedSubscribers,
  setRabbi,
  whoIsTheRabbi,
} from "./firebase/shabbas-manage";

export const messageHandler = async (msg: Message) => {
  sendSpecialMessages(msg.from, client);

  //prevent interrupt in middle action
  if (sessionedSubscribers[msg.from]) {
    await addSubscribedYears(msg);
    return;
  }

  if (sessionedAddSubscribersAlert[msg.from]) {
    await createAlertSubscription(msg);
    return;
  }

  if (sessionedRemoveSubscribersAlert[msg.from]) {
    await removeAlertSubscription(msg);
    return;
  }

  if (msg.body.includes("מי מעניין")) {
    await addSubscribedYears(msg);
    return;
  }

  if (msg.body === "עדכן אותי") {
    await createAlertSubscription(msg);
    return;
  }

  if (msg.body === "אל תעדכן") {
    await removeAlertSubscription(msg);
    return;
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

  if (msg.body.includes("כולם מעניינים אותי")) {
    await resetSubscribedYears(msg);
    await client.sendMessage(msg.from, " די נו איזה חמוד אתה 🤓");
    return;
  }
  if (!(await auth(msg))) {
    return;
  }

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

  if (msg.body.startsWith("!stop") && (await isAdmin(msg))) {
    await closeShabbas(msg);
    return;
  }

  if (msg.body.startsWith("!resume") && (await isAdmin(msg))) {
    await resumeShabbas(msg);
    return;
  }

  //Added the /all for the gamers there😁
  if (msg.body.startsWith("/all") && (await isAdmin(msg))) {
    await client.sendMessage(msg.from, "ההודעה תשלח, זה עשוי לקחת כמה דקות...");
    sendAll(msg.body.split("/all")[1].trim());
    return;
  }
  //Keeping the league term
  if (msg.body.startsWith("/team") && (await isAdmin(msg))) {
    await client.sendMessage(msg.from, "ההודעה תשלח, זה עשוי לקחת כמה דקות...");
    sendParticipants(msg);
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
