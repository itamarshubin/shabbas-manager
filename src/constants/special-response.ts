import fs from "fs";
import { Client } from "whatsapp-web.js";

const specialMessages = fs.readFile(
  "src/special-messages.json",
  "utf-8",
  (err, data) => {
    if (err) return null;

    return JSON.parse(data);
  }
);

console.log(specialMessages);

const sendSpecialMessages = (from: string, client: Client) => {
//   if (specialMessages[from]) client.sendMessage(from, specialMessages[from]);
};
