import {
  arrayUnion,
  DocumentData,
  getDocFromServer,
  QueryDocumentSnapshot,
  arrayRemove,
  DocumentSnapshot,
  updateDoc,
  collection,
  getDocs,
  query,
  DocumentReference,
} from "@firebase/firestore";

import { Client, Message } from "whatsapp-web.js";
import { fireStore, getUserRef } from "../firebase/shabbas-manage";
import { client } from "../app";

type User = { phone: string; name: string };
export const updateRelevantUsers = async (
  userRef: QueryDocumentSnapshot<DocumentData>,
  client: Client,
  coming: boolean
): Promise<void> => {
  const subscribedUsers: DocumentReference<User>[] =
    userRef.get("subscribedUsers");

  subscribedUsers?.forEach(async (user) => {
    const userData = (await getDocFromServer<User>(user)).data();
    userData &&
      client.sendMessage(
        userData.phone,
        `${userRef.get("name")} ${coming ? "מגיע" : "לא מגיע"} לשבת`
      );
  });
};

let users: QueryDocumentSnapshot<DocumentData>[] = [];
export const sessionedAddSubscribersAlert: Record<
  string,
  { matches: QueryDocumentSnapshot<DocumentData>[] }
> = {};
export const sessionedRemoveSubscribersAlert: Record<
  string,
  { followers: DocumentSnapshot<User>[] }
> = {};

//refetch users twice a day and save it in the cache.
//you probably should use some library to fetch user by name.
//but I didn't want to get all the users every time
setInterval(() => {
  users = [];
}, 43200000);

export const removeAlertSubscription = async (msg: Message) => {
  if (!users.length) {
    const docs = await getDocs(query(collection(fireStore, "/users")));
    docs.forEach((doc) => {
      users.push(doc);
    });
  }
  if (!sessionedRemoveSubscribersAlert[msg.from]) {
    const userRef = await getUserRef(msg);

    const followersRef: DocumentReference<User>[] =
      userRef.data().subscribedUsers;
    const followers = await Promise.all(
      followersRef.map((followerRef) => getDocFromServer(followerRef))
    );

    let response = "אלה האנשים שאתה תקבל עליהם עדכונים: \n";

    followers.forEach((follower, index) => {
      response += index + 1 + ". " + String(follower.data()?.name) + "\n";
    });

    client.sendMessage(
      msg.from,
      response + " שלח את המספר של מי שאתה רוצה להסיר"
    );
    sessionedRemoveSubscribersAlert[msg.from] = { followers };
    return;
  }

  if (msg.body === "בטל") {
    return delete sessionedRemoveSubscribersAlert[msg.from];
  }

  const userRef = await getUserRef(msg);

  const userToRemove =
    sessionedRemoveSubscribersAlert[msg.from].followers[Number(msg.body) - 1];
  if (!userToRemove) {
    return client.sendMessage(
      msg.from,
      "הזן מספר תקין או כתוב 'בטל' בשביל להפסיק את הפעולה"
    );
  }

  await updateDoc(userRef.ref, {
    subscribedUsers: arrayRemove(userToRemove.ref),
  });
  client.sendMessage(
    msg.from,
    `הסרנו את ${userToRemove.data()?.name}, לא תקבל יותר עדכונים עליו`
  );
  delete sessionedRemoveSubscribersAlert[msg.from];
};

export const createAlertSubscription = async (msg: Message) => {
  if (!users.length) {
    const docs = await getDocs(query(collection(fireStore, "/users")));
    docs.forEach((doc) => {
      users.push(doc);
    });
  }
  if (!sessionedAddSubscribersAlert[msg.from]) {
    client.sendMessage(
      msg.from,
      "כתוב שם (מלא או חלקי) של מישהו שתרצה לקבל עדכון כשהוא מגיע"
    );
    sessionedAddSubscribersAlert[msg.from] = { matches: [] };
    return;
  }
  if (msg.body === "בטל") {
    return delete sessionedAddSubscribersAlert[msg.from];
  }

  if (!sessionedAddSubscribersAlert[msg.from].matches.length) {
    const matches = users.filter((user) =>
      user.data().name?.includes(msg.body)
    );
    if (!matches) {
      return client.sendMessage(
        msg.from,
        "לא נמצא משתמש עם שם כזה, הזן שם אחר או 'בטל' כדי להפסיק את הפעולה"
      );
    }
    let response = "";
    matches.forEach((match, index) => {
      response += String(
        index +
          1 +
          ". " +
          match.data().name +
          ", מחזור: " +
          match.data().year +
          "\n"
      );
    });

    client.sendMessage(msg.from, response);
    sessionedAddSubscribersAlert[msg.from].matches = matches;
    return;
  }

  const userRef = await getUserRef(msg);

  const userToAdd =
    sessionedAddSubscribersAlert[msg.from].matches[Number(msg.body) - 1];
  if (!userToAdd) {
    return client.sendMessage(
      msg.from,
      "הזן מספר תקין או כתוב 'בטל' בשביל להפסיק את הפעולה"
    );
  }
  await updateDoc(userRef.ref, { subscribedUsers: arrayUnion(userToAdd.ref) });
  client.sendMessage(
    msg.from,
    `תקבל הודעה כש${userToAdd.data().name} יעדכן על מצב ההגעה שלו`
  );
  delete sessionedAddSubscribersAlert[msg.from];
};
