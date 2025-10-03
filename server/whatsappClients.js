function createClient(clientId) {
  let client; // ✅ define outside so it exists in all cases

  try {
    client = new Client({
      authStrategy: new RemoteAuth({
        clientId,
        store,
        backupSyncIntervalMs: 300000, // optional
      }),
      puppeteer: {
        executablePath: puppeteer.executablePath(), // ✅ ensure Chromium path
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
  } catch (err) {
    console.error(`❌ Failed to create WhatsApp client ${clientId}:`, err);
    return null; // gracefully exit without crashing server
  }

  if (!client) {
    console.warn(`⚠️ WhatsApp client ${clientId} not created`);
    return null;
  }

  // ✅ attach listeners safely
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

  client.on("authenticated", () =>
    console.log(`🔐 ${clientId} authenticated`)
  );

  client.on("ready", () => console.log(`✅ ${clientId} is ready`));

  client.on("disconnected", (reason) =>
    console.log(`⚠️ ${clientId} disconnected: ${reason}`)
  );

  // ✅ don’t crash if initialize fails
  client.initialize().catch((err) => {
    console.error(`❌ Error initializing ${clientId}:`, err.message);
  });

  return client;
}
