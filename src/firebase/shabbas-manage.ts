import {
  DocumentData,
  DocumentReference,
  FieldValue,
  QueryDocumentSnapshot,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
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

const fireStore = getFirestore();

function sumOfAscii(str: string): any {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  return sum;
}

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

export const addUser = async (msg: Message) => {
  const shabbas = await getShabbasDoc();
  const userRef = (
    await getDocs(
      query(collection(fireStore, "/users"), where("phone", "==", msg.from))
    )
  ).docs[0];

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
};

export const removeUser = async (msg: Message) => {
  const userRef = (
    await getDocs(
      query(collection(fireStore, "/users"), where("phone", "==", msg.from))
    )
  ).docs[0];

  const shabbas = await getShabbasDoc();

  if (
    shabbas
      .data()
      .participants?.find((par: { id: string }) => par.id === userRef.id)
  ) {
    await updateDoc(shabbas.ref, { participants: arrayRemove(userRef.ref) });
  }
  await client.sendMessage(msg.from, "טוב נו... פעם הבאה.");
};

export const getParticipants = async (msg: Message) => {
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
    help[user?.year || "ללא שנה"].push(user?.name);
  });

  let finalMsg = "";

  for (const [key, value] of Object.entries(help).sort(
    //@ts-ignore
    (a: string, b: string) => sumOfAscii(a) - sumOfAscii(b)
  )) {
    finalMsg += `*${key}*\n`;
    value.forEach((year) => (finalMsg += `${year}\n`));
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
  for (const [key, value] of Object.entries(help).sort(
    //@ts-ignore
    (a: string, b: string) => sumOfAscii(a) - sumOfAscii(b)
  )) {
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
