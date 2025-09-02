import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import moment from "moment";
import { sendCallAssignedMessage, sendSpareAllocatedMessage } from "./sendWhatsapp.js";
import { brandClientMap } from "./whatsappClients.js";
import dotenv from "dotenv";
dotenv.config();


// Required for __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize app
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================
// 🔹 Your existing MongoDB connection
// ==========================
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));


// Schema and Model
const callSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  callNo: { type: String, required: true, unique: true },
  phoneNo: { type: String, default: "" },
  customerName: { type: String,  default: "" },
  address: { type: String,  default: "" },
  pincode: { type: String,  default: ""},
  type: { type: String, default: "" },
  product: { type: String,  default: "" },
  model: { type: String, default: "" },
  tat: { type: String,  default: "" },
  technician: { type: String, default: "" },
  status: { type: String, default: "" },
  appointmentDate: { type: Date, default: ""},
  reason:  { type: String, default: "" },
  spareCode:  { type: String, default: "" },
  spareName:  { type: String, default: "" },
  qty: { type: Number, default: "" },
  defectiveSubmitted: { type: String, enum: ["yes", "no", ""], default: "" },
  completionDate: { type: Date, default: ""},
   assignedDate: { type: Date, default: ""},
   callerType: { type: String, default: ""},
   callSubtype: { type: String, default: ""},
  natureOfComplaint: { type: String, default: ""},
  amountReceived: { type: Number, default: 0 },

});
const CallDetail = mongoose.model("CallDetails", callSchema);

// Create Schema
const sbomSchema = new mongoose.Schema({
  brand: { type: String,  default: "" },
  productno: { type: String,  default: "" },
  prodname:{ type: String,  default: "" },
  itemno:{ type: String,  default: ""},
  itemname:{ type: String,  default: "" },
  price:{ type: Number,  default: 0 },
});

// Model
const Sbom = mongoose.model("Sbom", sbomSchema);

// Create Schema
const spareSchema = new mongoose.Schema({
  brand: { type: String, default :""},
    itemNo: { type: String, default :"" },
  itemName: { type: String, default :""},
  quantity: { type: Number, default :"" },
  datespare: { type: Date, default :"" },
  mslType: { type: String, default :"" },
});

// Model
const Spare = mongoose.model("Spare", spareSchema);

// 🔹 ReturnSpare Schema
const returnSpareSchema = new mongoose.Schema({
  spareCode: { type: String, default: "" },
  spareName: { type: String, default: "" },
  brand: { type: String, default: "" },
   returnQty: { type: Number, default: 0 }, // returned qty
  mslType: { type: String, default: "" },
  spareDate: { type: Date, default: "" },
  status: { type: String, default: "Return Initiated" },
  returnDate: { type: Date, default: Date.now },
  returnType: { type: String, enum: ["good", "defective"], required: true },
});

const ReturnSpare = mongoose.model("ReturnSpare", returnSpareSchema);


// ✅ Employee Schema
const employeeSchema = new mongoose.Schema({
  name: String,
  gender: { type: String, enum: ["Male", "Female"] },
  phone: String,
  type: { type: String, enum: ["Permanent", "Temporary"] },
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  dob: Date,
  address: String,
  pincode: String,
  adhaar: String,
  pancard: String,
  emptype:{ type: String, enum: ["Technician", "Admin"], default: "Technician" },
});

const Employee = mongoose.model("Employee", employeeSchema);



// Routes

// ---------------------------
// Serve React frontend in production
// ---------------------------
if (process.env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const frontendPath = path.join(__dirname, "../my-crm-frontend/dist");

  // Serve static files from React build
  app.use(express.static(frontendPath));

  // Catch-all: send index.html for any non-API route
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(frontendPath, "index.html"));
  });
}
// ==========================
// 🔹 Start Server
// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

