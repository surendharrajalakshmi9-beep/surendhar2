// server/whatsappClients.js
import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import mongoose from "mongoose";
import { MongoStore } from "wwebjs-mongo";
import 'dotenv/config';

const { Client, RemoteAuth } = pkg;

const MONGODB_URI = process.env.MONGO_URI;

// ✅ Connect mongoose first
await mongoose.connect(MONGODB_URI);

// ✅ Mongo store for sessions
const store = new MongoStore({ mongoose });

function createClient(clientId) {
  const client = new Client({
    authStrategy: new RemoteAuth({
      clientId,
      store,
      backupSyncIntervalMs: 300000, // optional
    }),
    puppeteer: {
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
}

// ✅ One WhatsApp account → one client
const client1 = createClient("client1");

// ✅ Brand → Client mapping
export const brandClientMap = {
  Bajaj: client1,
  Atomberg: client1,
  Havells: client1,
  Usha: client1,
};

// ✅ Brand + Technician → Group ID mapping
export const brandTechnicianGroupMap = {
  Bajaj: {
   "917871859695": "120363401875907092@g.us",   // Surendhar - Bajaj group
      // Chandru - Bajaj group
    
  },
  Atomberg: {
   
  },
  Havells: {
    // Add technicians here
  },
  Usha: {
    // Add technicians here
  },
};
// Map brand + technician phone → WhatsApp group ID
