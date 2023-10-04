import { Client, Message } from "whatsapp-web.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { client } from "../app";

const fireStore = getFirestore();

export const auth = async (msg: Message): Promise<boolean> => {
  const users = await getDocs(
    query(collection(fireStore, "/users"), where("phone", "==", msg.from))
  );

  const tempUser = await getDocs(
    query(collection(fireStore, "/temp users"), where("phone", "==", msg.from))
  );

  if (!users.docs[0]) {
    if (!tempUser.docs[0]) {
      const collectionRef = collection(fireStore, "/temp users");
      await addDoc(collectionRef, { phone: msg.from });
      await client.sendMessage(
        msg.from,
        "נראה שאתה לא רשום, בהודעה הבאה כתוב בבקשה את שמך המלא."
      );
      return false;
    } else {
      await addDoc(collection(fireStore, "/users"), {
        phone: msg.from,
        name: msg.body,
        year: "",
        married: false,
        childrens: 0,
        subscribedYears: [],
      });
      const users = await getDocs(
        query(
          collection(fireStore, "/temp users"),
          where("phone", "==", msg.from)
        )
      );
      await deleteDoc(users.docs[0].ref);
      await client.sendMessage(
        msg.from,
        "נהדר, אתה רשום במערכת. תכתוב שוב בבקשה את מה שכתבת קודם."
      );
    }
    return false;
  }
  return true;
};

export const isAdmin = async (msg: Message): Promise<boolean> => {
  const tempUser = await getDocs(
    query(collection(fireStore, "/admins"), where("phone", "==", msg.from))
  );

  return !!tempUser.docs[0];
};
