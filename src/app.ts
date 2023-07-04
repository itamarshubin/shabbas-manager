import { initializeApp } from "firebase/app";
require("dotenv").config();
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MESUREMENT_ID,
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
  client.sendMessage("972512665020@c.us", "ready");
});

client.on("qr", (qr) => {
  console.log("qr", qr);

  qrcode.generate(qr, { small: true });
});

client.on("message", messageHandler);
