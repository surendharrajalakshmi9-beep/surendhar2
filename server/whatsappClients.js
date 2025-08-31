import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
const { Client, LocalAuth } = pkg;

function createClient(id) {
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: id }),
  });

  client.on("qr", (qr) => {
    console.log(`\n📱 Scan the QR for ${id} below:`);
    qrcode.generate(qr, { small: true }); // shows QR in terminal
  });

  client.on("ready", () => console.log(`✅ ${id} is ready`));
  client.on("authenticated", () => console.log(`🔐 ${id} authenticated`));

  client.initialize();
  return client;
}

const client1 = createClient("client1"); // Bajaj + Atomberg
//const client2 = createClient("client2"); // Havells
//const client3 = createClient("client3"); // Usha

export const brandClientMap = {
  Bajaj: client1,
  Atomberg: client1,
 // Havells: client2,
 // Usha: client3,
};
