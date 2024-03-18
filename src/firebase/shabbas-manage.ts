import {
  DocumentData,
  DocumentReference,
  QueryDocumentSnapshot,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  getDocFromServer,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Message } from "whatsapp-web.js";
import { client } from "../app";
import { ALL_YESHIVA_YEARS } from "../constants/yeshiva-years";
import { updateRelevantUsers } from "../constants/subscription";

export const fireStore = getFirestore();

const getShabbasDoc = async (): Promise<
  QueryDocumentSnapshot<DocumentData>
> => {
  const shabbasRef = collection(fireStore, "/shabbasses");
  const shabbasQuery = query(
    shabbasRef,
    orderBy("shabbas_count", "desc"),
    limit(1)
  );
  const shabbasDocs = await getDocs(shabbasQuery);

  return shabbasDocs.docs[0];
};

export const getUserRef = async (msg: Message) => {
  const userRef = (
    await getDocs(
      query(collection(fireStore, "/users"), where("phone", "==", msg.from))
    )
  ).docs[0];
  return userRef;
};

export const addUser = async (msg: Message) => {
  const shabbas = await getShabbasDoc();
  const userRef = await getUserRef(msg);

  if (
    shabbas
      .data()
      .participants?.find((par: { id: string }) => par.id === userRef.id)
  ) {
    await client.sendMessage(msg.from, "אתה כבר נרשמת לשבת.");
  } else {
    await updateDoc(shabbas.ref, { participants: arrayUnion(userRef.ref) });
    await client.sendMessage(msg.from, "נהדר! נשמח לראותך.");
  }
  await updateRelevantUsers(userRef, client, true);
};

export const addAlcoholic = async (msg: Message) => {
  const shabbas = await getShabbasDoc();
  const userRef = await getUserRef(msg);

  if (
    shabbas
      .data()
      .alcoholics?.find((par: { id: string }) => par.id === userRef.id)
  ) {
    await client.sendMessage(msg.from, "אתה כבר נרשמת לאלכוהול.");
  } else {
    await updateDoc(shabbas.ref, { alcoholics: arrayUnion(userRef.ref) });
    await client.sendMessage(msg.from, "אחלה, אלכוהול זה טוב.");
  }
};

export const removeAlcoholic = async (msg: Message) => {
  const userRef = await getUserRef(msg);

  const shabbas = await getShabbasDoc();

  if (
    shabbas
      .data()
      .alcoholics?.find((par: { id: string }) => par.id === userRef.id)
  ) {
    await updateDoc(shabbas.ref, { alcoholics: arrayRemove(userRef.ref) });
  }
  await client.sendMessage(
    msg.from,
    "אוקי, עברת את המבחן הסודי. אתה מוכן לשידוכים."
  );
};

export const getAlcoholics = async (msg: Message) => {
  const shabbas = await getShabbasDoc();
  const userRef = await getUserRef(msg);

  const subscribedYears: string[] = userRef.get("subscribedYears");
  if (!subscribedYears || subscribedYears.length === 0)
    await resetSubscribedYears(msg, userRef);
  const alcoholic: DocumentReference<DocumentData>[] =
    shabbas.data().alcoholics;
  if (!alcoholic) {
    client.sendMessage(msg.from, "בינתיים אף אחד לא רוצה אלכוהול.");
    return;
  }
  const alcoholicsData = await Promise.all(
    alcoholic.map(async (alcoholicRef) =>
      (await getDocFromServer(alcoholicRef)).data()
    )
  );

  const help: Record<string, any[]> = {};

  alcoholicsData.forEach((user) => {
    if (!help[user?.year || "ללא שנה"]) {
      help[user?.year || "ללא שנה"] = [];
    }
    help[user?.year || "ללא שנה"].push(user?.name);
  });

  let finalMsg = "";
  for (const [key, value] of Object.entries(help).sort()) {
    if (subscribedYears) {
      if (subscribedYears.includes(key)) {
        finalMsg += `*${key}*\n`;
        value.forEach((year) => (finalMsg += `${year}\n`));
      }
    } else {
      finalMsg += `*${key}*\n`;
      value.forEach((year) => (finalMsg += `${year}\n`));
    }
  }

  client.sendMessage(msg.from, finalMsg);
};

export const removeUser = async (msg: Message) => {
  const userRef = await getUserRef(msg);

  const shabbas = await getShabbasDoc();

  if (
    shabbas
      .data()
      .participants?.find((par: { id: string }) => par.id === userRef.id)
  ) {
    await updateDoc(shabbas.ref, { participants: arrayRemove(userRef.ref) });
  }
  await client.sendMessage(msg.from, "טוב נו... פעם הבאה.");
  await updateRelevantUsers(userRef, client, false);
};

export const getParticipants = async (msg: Message) => {
  const shabbas = await getShabbasDoc();
  const userRef = await getUserRef(msg);

  const subscribedYears: string[] = userRef.get("subscribedYears");
  if (!subscribedYears || subscribedYears.length === 0)
    await resetSubscribedYears(msg, userRef);

  const participant: DocumentReference<DocumentData>[] =
    shabbas.data().participants;
  if (!participant) {
    client.sendMessage(msg.from, "אף אחד עוד לא נרשם לשבת");
    return;
  }
  const participantsData = await Promise.all(
    participant.map(async (participantRef) =>
      (await getDocFromServer(participantRef)).data()
    )
  );

  const help: Record<string, any[]> = {};

  participantsData.forEach((user) => {
    if (!help[user?.year || "ללא שנה"]) {
      help[user?.year || "ללא שנה"] = [];
    }
    help[user?.year || "ללא שנה"].push(user?.name);
  });

  let finalMsg = "";
  for (const [key, value] of Object.entries(help).sort()) {
    if (subscribedYears) {
      if (subscribedYears.includes(key)) {
        finalMsg += `*${key}*\n`;
        value.forEach((year) => (finalMsg += `${year}\n`));
      }
    } else {
      finalMsg += `*${key}*\n`;
      value.forEach((year) => (finalMsg += `${year}\n`));
    }
  }

  client.sendMessage(msg.from, finalMsg);
};

export const addShabbas = async (msg: Message) => {
  const messageArray = msg.body.split(" ");
  messageArray.shift();

  const shabbasRef = collection(fireStore, "/shabbasses");

  const count = (await getShabbasDoc()).data().shabbas_count;
  await addDoc(shabbasRef, {
    name: messageArray.join().replace(",", " "),
    shabbas_count: count + 1,
    rabbi: "",
  });

  client.sendMessage(
    msg.from,
    `עכשיו נרשמים ל: ${messageArray.join().replace(",", " ")}`
  );
};

export const whoIsTheRabbi = async (msg: Message) => {
  const shabbas = await getShabbasDoc();
  const rabbi = shabbas.data().rabbi;

  if (rabbi) {
    client.sendMessage(msg.from, `השבת יהיה בעז"ה: ${rabbi}`);
  } else {
    client.sendMessage(msg.from, "עוד לא ידוע איזה רב יהיה השבת");
  }
};

export const calculateFood = async (msg: Message) => {
  const shabbas = await getShabbasDoc();

  const participant: DocumentReference<DocumentData>[] =
    shabbas.data().participants;
  if (!participant) {
    client.sendMessage(msg.from, "אף אחד עוד לא נרשם לשבת");
    return;
  }
  const participantsData = await Promise.all(
    participant.map(async (participantRef) =>
      (await getDocFromServer(participantRef)).data()
    )
  );

  const help: Record<string, any[]> = {};

  participantsData.forEach((user) => {
    if (!help[user?.year || "ללא שנה"]) {
      help[user?.year || "ללא שנה"] = [];
    }
    help[user?.year || "ללא שנה"].push({
      name: user?.name,
      married: user?.married,
      childrens: user?.childrens,
    });
  });

  let finalMsg = "";

  let totalFood = 0;
  for (const [key, value] of Object.entries(help).sort()) {
    finalMsg += `*${key}*\n`;
    value.forEach((user) => {
      const foodForUser = user.married ? user.childrens + 2 : 1;
      totalFood += foodForUser;
      finalMsg += `${user.name} - ${foodForUser}\n`;
    });
  }
  finalMsg += `סה"כ מנות: ${totalFood}`;
  client.sendMessage(msg.from, finalMsg);
};

export const setRabbi = async (msg: Message) => {
  const shabbas = await getShabbasDoc();
  const rabbi = msg.body.substr(msg.body.indexOf(" ") + 1);
  await updateDoc(shabbas.ref, { rabbi });
  client.sendMessage(msg.from, `${rabbi} הוגדר`);
};

export const sessionedSubscribers: Record<string, boolean> = {};

export const addSubscribedYears = async (msg: Message) => {
  const userRef = await getUserRef(msg);
  if (!sessionedSubscribers[msg.from]) {
    client.sendMessage(msg.from, "כתוב את המחזורים שמעניינים אותך");
    sessionedSubscribers[msg.from] = true;
  } else {
    const years: string[] = msg.body.split(" ");
    for (let year of years) {
      if (!ALL_YESHIVA_YEARS.includes(year)) {
        client.sendMessage(
          msg.from,
          `הפורמט לכתיבת המחזורים הוא 'א ה ו' לא ככה : ${msg.body}\n אה והמחזורים חייבים להיות קיימים ימצחיק😠`
        );
        resetSubscribedYears(msg, userRef);
        return;
      }
    }
    client.sendMessage(msg.from, ` המחזורים שמעניינים אותך הם: ${years}`);
    client.sendMessage(
      msg.from,
      "אם תרצה לבטל את הסינון תוכל לשלוח את ההודעה 'כולם מעניינים אותי'"
    );
    years.push("ללא שנה");
    finalizeSubscribedYears(userRef, years, msg.from);
  }
};
const finalizeSubscribedYears = async (
  userRef: QueryDocumentSnapshot<DocumentData>,
  years: string[],
  phoneNumber: string
) => {
  await updateDoc(userRef.ref, { subscribedYears: years });
  sessionedSubscribers[phoneNumber] = false;
};

export const resetSubscribedYears = async (
  msg: Message,
  userRef?: QueryDocumentSnapshot<DocumentData>
) => {
  userRef = userRef || (await getUserRef(msg));
  finalizeSubscribedYears(
    <QueryDocumentSnapshot<DocumentData>>userRef,
    ALL_YESHIVA_YEARS,
    msg.from
  );
};

const alertSubscribers = async (msg: Message) => {};
