import { initializeApp } from "firebase/app";

const firebaseConfig = {
  //the fire config from firebase
};

// Initialize Firebase
initializeApp(firebaseConfig);

import { Client, LocalAuth } from "whatsapp-web.js";
import { messageHandler } from "./message-handler";
import qrcode from "qrcode-terminal";
export const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true,
  },
});

client.initialize();

client.on("ready", async () => {
  console.log("ready");
});

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("message", messageHandler);
