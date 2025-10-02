import { brandClientMap } from "./whatsappClients.js";
import { brandTechnicianGroupMap } from "./whatsappClients.js";

// 🔹 Ensure client is ready before sending
const ensureClientReady = async (client, brand) => {
  return new Promise((resolve, reject) => {
    if (!client) return reject(`❌ No client for brand ${brand}`);

    if (client.info) {
      // Already ready
      return resolve();
    }

    client.once("ready", () => {
      console.log(`⚡ Client for ${brand} is ready now`);
      resolve();
    });

    client.once("auth_failure", () => {
      reject(`❌ Auth failure for ${brand}. Please rescan QR locally.`);
    });

    setTimeout(() => reject(`⏳ Timeout waiting for client: ${brand}`), 20000); // 20s
  });
};

// 🔹 Format chat ID
const formatChatId = (number) => {
  if (!number) return null;
  return `${number}@c.us`;
};

// 🔹 Send to technician personal chat OR group (with ensureClientReady)
const sendToTechnicianOrGroup = async (client, brand, number, msg) => {
  const technicianGroups = brandTechnicianGroupMap[brand];
  if (!technicianGroups) {
    console.error(`❌ No groups configured for brand ${brand}`);
    return;
  }

  try {
    // ✅ Ensure client is ready before sending
    await ensureClientReady(client, brand);

    const groupId = technicianGroups[number];

    if (!groupId) {
      const chatId = formatChatId(number);
      if (!chatId) {
        console.error(`❌ Invalid technician number: ${number}`);
        return;
      }
      await client.sendMessage(chatId, msg.trim());
      console.log(`📨 Sent message for technician ${number} (${brand}) → personal chat`);
    } else {
      await client.sendMessage(groupId, msg.trim());
      console.log(`📨 Sent message for technician ${number} (${brand}) → ${groupId}`);
    }
  } catch (err) {
    console.error(`❌ Failed to send message for ${number} (${brand}):`, err);
  }
};

// 🔹 Send "Call Assigned" message
export const sendCallAssignedMessage = async (brand, number, call) => {
  try {
    const client = brandClientMap[brand];
    if (!client) {
      console.error(`❌ No WhatsApp client for brand ${brand}`);
      return;
    }

    let tatFormatted = "N/A";
    if (call.tat) {
      const tatDate = new Date(call.tat);
      tatDate.setHours(tatDate.getHours() - 1);
      tatFormatted = tatDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    const msg = `
📞 *New Call Assigned*  
---------------------------  
📌 Call No: ${call.callNo}  
👤 Customer: ${call.name}  
📱 Phone: ${call.phone || "N/A"}  
🏠 Address: ${call.address}, ${call.pincode}  
🛠 Product: ${call.product}, ${call.model}  
⚡ Call Type: ${call.callSubtype}  
❗ Problem: ${call.natureOfComplaint || "N/A"}  

---------------------------
    `;

    await sendToTechnicianOrGroup(client, brand, number, msg);
  } catch (err) {
    console.error("❌ Error sending call assigned WhatsApp:", err);
  }
};

// 🔹 Send "Spare Allocated" message
export const sendSpareAllocatedMessage = async (brand, number, call, spare) => {
  try {
    const client = brandClientMap[brand];
    if (!client) {
      console.error(`❌ No WhatsApp client for brand ${brand}`);
      return;
    }

    const msg = `
🔧 *Spare Allocated*  
---------------------------  
📌 Call No: ${call.callNo}  
👤 Customer: ${call.name}  
📱 Phone: ${call.phone || "N/A"}  
🏠 Address: ${call.address}, ${call.pincode}  
🛠 Product: ${call.product}, ${call.model}  
📦 Spare Code: ${spare?.itemNo || "N/A"}  
📦 Spare Name: ${spare?.itemName || "N/A"}  
🔢 Quantity: ${call.qty || 1}  
---------------------------
    `;

    await sendToTechnicianOrGroup(client, brand, number, msg);
  } catch (err) {
    console.error("❌ Error sending spare allocated WhatsApp:", err);
  }
};

// 🔹 Send "Transfer Call Assigned" message
export const sendTransferCallAssignedMessage = async (brand, number, call) => {
  try {
    const client = brandClientMap[brand];
    if (!client) {
      console.error(`❌ No WhatsApp client for brand ${brand}`);
      return;
    }

    let tatFormatted = "N/A";
    if (call.tat) {
      const tatDate = new Date(call.tat);
      tatDate.setHours(tatDate.getHours() - 1);
      tatFormatted = tatDate.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
//⏰ Complete By: ${tatFormatted}  
    const msg = `
📞 *New Call Transferred*  
---------------------------  
📌 Call No: ${call.callNo}  
👤 Customer: ${call.name}  
📱 Phone: ${call.phone || "N/A"}  
🏠 Address: ${call.address}, ${call.pincode}  
🛠 Product: ${call.product}, ${call.model}  
⚡ Call Type: ${call.callSubtype}  
❗ Problem: ${call.natureOfComplaint || "N/A"}  
❗ Current Status: ${call.status || "N/A"} 
---------------------------
    `;

    await sendToTechnicianOrGroup(client, brand, number, msg);
  } catch (err) {
    console.error("❌ Error sending transfer call WhatsApp:", err);
  }
};
