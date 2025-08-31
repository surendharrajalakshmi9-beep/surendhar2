import { brandClientMap } from "./whatsappClients.js";

export const sendCallAssignedMessage = async (brand, number, call) => {
  try {
    const client = brandClientMap[brand];
    if (!client) return console.error(`❌ No WhatsApp client mapped for brand: ${brand}`);

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

    await client.sendMessage(`${number}@c.us`, msg.trim());
    console.log(`✅ Call assigned WhatsApp sent to ${number}`);
  } catch (err) {
    console.error("❌ Error sending call assigned WhatsApp:", err);
  }
};


export const sendSpareAllocatedMessage = async (brand, number, call, spare) => {
  try {
    const client = brandClientMap[brand];
    if (!client) return console.error(`❌ No WhatsApp client mapped for brand: ${brand}`);

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

    await client.sendMessage(`${number}@c.us`, msg.trim());
    console.log(`✅ Spare allocated WhatsApp sent to ${number}`);
  } catch (err) {
    console.error("❌ Error sending spare allocated WhatsApp:", err);
  }
};
