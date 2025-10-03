import pkg from "whatsapp-web.js";
import puppeteer from "puppeteer";
import qrcode from "qrcode-terminal";
import mongoose from "mongoose";
import { MongoStore } from "wwebjs-mongo";
import 'dotenv/config';

const { Client, RemoteAuth } = pkg;
const MONGODB_URI = process.env.MONGO_URI;

// Connect MongoDB
await mongoose.connect(MONGODB_URI);

// Mongo store for WhatsApp sessions
const store = new MongoStore({ mongoose });

function createClient(clientId) {
  let executablePath;

  // ✅ Try Puppeteer Chromium first
  try {
    executablePath = puppeteer.executablePath();
  } catch {
    console.warn(`⚠️ Puppeteer executablePath not found for "${clientId}". Using system Chromium...`);
    // fallback to system-installed Chromium
    executablePath = "/usr/bin/chromium-browser";
  }

  try {
    const client = new Client({
      authStrategy: new RemoteAuth({
        clientId,
        store,
        backupSyncIntervalMs: 300000,
      }),
      puppeteer: {
        executablePath,
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-zygote",
          "--single-process",
          "--disable-gpu",
        ],
      },
    });

    // Event listeners
    client.on("qr", (qr) => {
      console.log(`\n📱 Scan QR for ${clientId}:`);
      qrcode.generate(qr, { small: true });
    });
    client.on("remote_session_saved", () =>
      console.log(`💾 ${clientId} session saved to Mongo`)
    );
    client.on("auth_failure", (msg) =>
      console.error(`❌ ${clientId} auth failure:`, msg)
    );
    client.on("loading_screen", (percent, message) =>
      console.log(`📊 ${clientId} loading ${percent}%: ${message}`)
    );
    client.on("authenticated", () => console.log(`🔐 ${clientId} authenticated`));
    client.on("ready", () => console.log(`✅ ${clientId} is ready`));
    client.on("disconnected", (reason) =>
      console.log(`⚠️ ${clientId} disconnected: ${reason}`)
    );

    client.initialize();
    return client;
  } catch (err) {
    console.error(`❌ Failed to create WhatsApp client ${clientId}:`, err);
    return null;
  }
}

// One WhatsApp account → one client
const client1 = createClient("client1");

// Brand → Client mapping
export const brandClientMap = {
  "Bajaj - Surendhar Enterprises": client1,
  "Bajaj - S.R Enterprises": client1,
  "Atomberg": client1,
  "Usha": client1,
};




// ✅ Brand + Technician → Group ID mapping
export const brandTechnicianGroupMap = {
  "Bajaj - Surendhar Enterprises": {
    "918925343830":"120363404308952029@g.us", //Imtiyas
    "916369976776":"120363420142240254@g.us", //Jeeva
    "919344953857":"120363417772011497@g.us", //Agni
    "918939756995":"120363405717911331@g.us", //Suresh
    "918939346643":"120363397809487001@g.us", //Ajith
    "919080459175":"120363401783442970@g.us", //Gnanavel
    "919080033944":"120363422922583327@g.us", //Vijay
    "917708723060":"120363399028512688@g.us", //Santhosh
  },
  "Bajaj - S.R Enterprises": {
    "918925343830":"120363404308952029@g.us", //Imtiyas
    "916369976776":"120363420142240254@g.us", //Jeeva
    "916381497458":"120363401660649252@g.us", //Kamalnath
  },
  "Atomberg": {
    "919080033944":"120363422922583327@g.us", //Vijay
  },
  "Usha": {
    "919344953857": "120363296468631098@g.us",// Agni
    "918939346643":"120363403554741254@g.us", //Ajith
    "918925343830":"120363404308952029@g.us", //Imtiyas
    "919080459175":"120363402603114268@g.us", //Gnanavel
    "918939756995":"120363348976551029@g.us", //Suresh
    "919080033944":"120363422922583327@g.us", //Vijay
    "917708723060":"120363399028512688@g.us", //Santhosh
  },
};
