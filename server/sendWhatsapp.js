import { brandClientMap } from "./whatsappClients.js";
import { brandTechnicianGroupMap } from "./whatsappClients.js";

// 🔹 Helper: Ensure client is ready before sending
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
export const sendCallAssignedMessage = async (brand, number, call) => {
  try {
    const client = brandClientMap[brand];
    const technicianGroups = brandTechnicianGroupMap[brand];

    if (!client) {
      console.error(`❌ No WhatsApp client for brand ${brand}`);
      return;
    }

    if (!technicianGroups) {
      console.error(`❌ No groups configured for brand ${brand}`);
      return;
    }

    const groupId = technicianGroups[number];
    if (!groupId) {
      console.error(`❌ No group configured for technician ${number} in brand ${brand}`);
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
⏰ Complete By: ${tatFormatted}  
---------------------------
    `;

    // ✅ fixed: use msg, not message
    await client.sendMessage(groupId, msg.trim());
    console.log(`📨 Sent message for technician ${number} (${brand}) → ${groupId}`);
  } catch (err) {
    console.error("❌ Error sending call assigned WhatsApp:", err);
  }
};


export const sendSpareAllocatedMessage = async (brand, number, call, spare) => {
  try {
    const client = brandClientMap[brand];
   const technicianGroups = brandTechnicianGroupMap[brand];

    if (!client) {
      console.error(`❌ No WhatsApp client for brand ${brand}`);
      return;
    }

    if (!technicianGroups) {
      console.error(`❌ No groups configured for brand ${brand}`);
      return;
    }

    const groupId = technicianGroups[number];
    if (!groupId) {
      console.error(`❌ No group configured for technician ${number} in brand ${brand}`);
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
 await client.sendMessage(groupId, msg.trim());
    console.log(`📨 Sent message for technician ${number} (${brand}) → ${groupId}`);
  }catch (err) {
    console.error("❌ Error sending spare allocated WhatsApp:", err);
  }
};


export const sendTransferCallAssignedMessage = async (brand, number, call) => {
  try {
    const client = brandClientMap[brand];
    const technicianGroups = brandTechnicianGroupMap[brand];

    if (!client) {
      console.error(`❌ No WhatsApp client for brand ${brand}`);
      return;
    }

    if (!technicianGroups) {
      console.error(`❌ No groups configured for brand ${brand}`);
      return;
    }

    const groupId = technicianGroups[number];
    if (!groupId) {
      console.error(`❌ No group configured for technician ${number} in brand ${brand}`);
      return;
    }


    // Format TAT (reduce 1 hour)
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
📞 *New Call Transfered*  
---------------------------  
📌 Call No: ${call.callNo}  
👤 Customer: ${call.name}  
📱 Phone: ${call.phone || "N/A"}  
🏠 Address: ${call.address}, ${call.pincode}  
🛠 Product: ${call.product}, ${call.model}  
⚡ Call Type: ${call.callSubtype}  
❗ Problem: ${call.natureOfComplaint || "N/A"}  
⏰ Complete By: ${tatFormatted}  
❗ Current Status: ${call.status || "N/A"} 

---------------------------
    `;

    await client.sendMessage(groupId, msg.trim());
    console.log(`📨 Sent message for technician ${number} (${brand}) → ${groupId}`);
  } catch (err) {
    console.error("❌ Error sending call assigned WhatsApp:", err);
  }
};
