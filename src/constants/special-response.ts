import fs from "fs";
import { Client } from "whatsapp-web.js";

let specialMessages:any;
 fs.readFile(
  "special-messages.json",
  "utf-8",
  (err, data) => {
    if (err) return null;

    specialMessages= JSON.parse(data);
  }
);


export const sendSpecialMessages = (from: string, client: Client) => {
  console.log(specialMessages);
  if (specialMessages[from]) client.sendMessage(from, specialMessages[from]);
};
