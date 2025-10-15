import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import xlsx from "xlsx";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import moment from "moment";
//import { sendCallAssignedMessage, sendSpareAllocatedMessage, sendTransferCallAssignedMessage } from "./sendWhatsapp.js";
//import { brandClientMap, brandTechnicianGroupMap } from "./whatsappClients.js";
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
  tat: { type: Date,  default: null },
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
  warrantyStatus: { type: String, default:""},
   owamtReceived: { type: Number, default: 0 },

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


// ✅ Brand Schema
const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

const Brand = mongoose.model("Brand", brandSchema);


// Create Schema
const spareSchema = new mongoose.Schema({
  brand: { type: String, default :""},
    itemNo: { type: String, default :"" },
  itemName: { type: String, default :""},
  quantity: { type: Number, default :"" },
  datespare: { type: Date, default :"" },
  mslType: { type: String, default :"" },
  mrp: { type: Number, default: 0 }, // ✅ New field for MRP
  status: { type: String, default: "" },
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
app.post("/api/calls", async (req, res) => {
  try {
    const callData = { ...req.body };
    if (callData.tat) callData.tat = new Date(callData.tat);
    const call = new CallDetail(callData);
    await call.save();
    res.status(201).json({ message: "Call details saved" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Call Number already exists" });
    }
    console.error(error);
    res.status(500).json({ error: "Failed to save call details" });
  }
});

// ✅ API to fetch all brands
app.get("/api/brands", async (req, res) => {
  try {
    const brands = await Brand.find().sort({ name: 1 }); // alphabetically
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch brands" });
  }
});


// ✅ Resend WhatsApp only
app.post("/api/calls/resend-assigned", async (req, res) => {
  try {
    const { callNos, brand, technician } = req.body;

    if (!brand) return res.status(400).json({ error: "Brand is required" });
    if (!Array.isArray(callNos) || callNos.length === 0)
      return res.status(400).json({ error: "No calls selected" });

    const calls = await CallDetail.find({ callNo: { $in: callNos } });

     // ✅ Fetch technician details
    const technician1 = await Employee.findOne({ name: technician });
    if (!technician1) {
      return res.status(404).json({ error: "Technician not found" });
    }
console.log("brand:"+brand+"phone:"+technician1.phone);

    // ✅ Fetch only the updated call details
    const updatedCalls = await CallDetail.find({ callNo: { $in: callNos } });

    res.json({ message: "messages re-sent successfully" });

  } catch (error) {
    console.error("Error assigning technician:", error);
    res.status(500).json({ error: "Failed to assign technician" });
  }
});
app.get("/api/calls", async (req, res) => {
  try {
    const calls = await CallDetail.find().sort({ _id: -1 });
    res.json(calls);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch calls" });
  }
});



// Filter assigned calls
app.get("/api/calls/filter-assigned", async (req, res) => {
  try {
    const { brand, technician, assignedDate } = req.query;

    const query = { 
      status: { $ne: "completed" }
    };

    if (brand) query.brand = brand;
    if (technician) query.technician = technician;
    if (assignedDate) {
      const start = new Date(assignedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(assignedDate);
      end.setHours(23, 59, 59, 999);
      query.assignedDate = { $gte: start, $lte: end };
    }

    const calls = await CallDetail.find(query).sort({ assignedDate: -1 });

    res.json({ calls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



app.get("/api/calls", async (req, res) => {
  try {
    const calls = await CallDetail.find().sort({ _id: -1 });
    res.json(calls);
  } catch (error) {
    res.status(500).send({ error: "Failed to fetch calls" });
  }
});


// POST route
app.post("/api/incomingspares", async (req, res) => {
  const { brand, itemNo, itemName, quantity, datespare, mslType, mrp } = req.body;

  const newSpare = new Spare({
    brand,
    itemNo,
    itemName,
    quantity,
    datespare,
    mslType,
    mrp, // ✅ Save MRP
  });

  await newSpare.save();
  res.status(201).json({ message: "Spare saved" });
});
// Get spare by itemNo
app.get("/api/incomingspares/:itemNo", async (req, res) => {
  try {
    const spare = await Spare.findOne({ itemNo: req.params.itemNo });
    res.json(spare);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch call details with spareCode not empty
app.get("/api/callDetailsWithSpare", async (req, res) => {
  try {
    const { brand } = req.query;
    let query = { spareCode: { $ne: "" } };

    if (brand) {
      query.brand = brand; // filter by brand if provided
    }

    const calls = await CallDetail.find(query);
    res.json(calls);
  } catch (error) {
    res.status(500).json({ error: "Error fetching spare requests" });
  }
});




// Update spare quantity & date
app.put("/api/incomingspares/:itemNo", async (req, res) => {
  try {
    const newQty = parseInt(req.body.quantity, 10);
   
    if (isNaN(newQty)) {
      return res.status(400).json({ error: "Quantity must be a number" });
    }

    const updatedSpare = await Spare.findOneAndUpdate(
      { itemNo: req.params.itemNo },
      {
        $set: {
          brand: req.body.brand,
          itemName: req.body.itemName,
          datespare: req.body.datespare,
          mslType: req.body.mslType
        },
        $inc: { quantity: newQty } // ✅ just increment by the new qty
      },
      { new: true }
    );

    res.json(updatedSpare);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.post("/api/allocate/:callNo", async (req, res) => {
  try {
    const callNo = req.params.callNo;

    // 1. Get the call detail record
    const callDetail = await CallDetail.findOne({ callNo: callNo })

    if (!callDetail) {
      return res.status(404).json({ error: "Call detail not found" });
    }

    // 2. Find the matching spare
    const spare = await Spare.findOne({ itemNo: callDetail.spareCode });
    console.log(spare.quantity);
    if (!spare) {
      return res.status(400).json({ error: "Spare not found" });
    }

    // 3. Check quantity condition
    if (callDetail.qty <= spare.quantity) {
      // ✅ Enough quantity available → allocate

      // Reduce spare quantity
      spare.quantity -= callDetail.qty;

      // If spare quantity becomes 0 → delete it
      if (spare.quantity <= 0) {
        await Spare.deleteOne({ _id: spare._id });
      } else {
        await spare.save();
      }

      // Update call detail status
      callDetail.status = "Spare Allocated";
      

      await callDetail.save();
      // 4. Get technician details from Employee collection
      const technician = await Employee.findOne({ name: callDetail.technician });
      if (!technician) {
        return res.status(404).json({ error: "Technician not found" });
      }

      res.json({ success: true, message: "Spare allocated " });
    } else {
     // ❌ Not enough quantity available
      return res.status(400).json({
        error: `Spare cannot be allocated because requested quantity (${callDetail.qty}) is greater than available quantity (${spare.quantity}).`
      });
    }
  } catch (err) {
    console.error("Allocation error:", err);
    res.status(500).json({ error: "Server error during allocation" });
  }
});

// ✅ Update Call Detail by callNo
app.put("/api/calldetails/:callNo", async (req, res) => {
  try {
    const { callNo } = req.params;
    const updateData = req.body;

    const updatedCall = await CallDetail.findOneAndUpdate(
      { callNo },
      { $set: updateData },
      { new: true }
    );

    if (!updatedCall) {
      return res.status(404).json({ error: "Call not found" });
    }

    res.json(updatedCall);
  } catch (error) {
    console.error("❌ Error updating call detail:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// PUT to update call details
app.put("/api/allocate/:callNo", async (req, res) => {
  try {
    const callNo = req.params.callNo;
    const { status, spareCode, spareName, quantity } = req.body;

    // 1. Find the call by callNo (NOT _id)
    const callDetail = await CallDetail.findOne({ callNo: callNo });
    if (!callDetail) {
      return res.status(404).json({ error: "Call detail not found" });
    }

    // 2. If status change is requested, update details
    if (status) callDetail.status = status;
    if (spareCode !== undefined) callDetail.spareCode = spareCode;
    if (spareName !== undefined) callDetail.spareName = spareName;
    if (quantity !== undefined) callDetail.quantity = quantity;

    // 3. Allocate spare if status is "Spare Allocated"
    if (status === "Spare Allocated") {
      const spare = await Spare.findOne({ itemNo: callDetail.spareCode });
      if (!spare) {
        return res.status(400).json({ error: "Spare not found" });
      }

      if (callDetail.qty <= spare.quantity) {
        spare.quantity -= callDetail.qty;

        if (spare.quantity <= 0) {
          await Spare.deleteOne({ _id: spare._id });
        } else {
          await spare.save();
        }
      } else {
        return res.status(400).json({
          error: `Spare cannot be allocated because requested quantity (${callDetail.qty}) is greater than available quantity (${spare.quantity}).`
        });
      }
    }

    await callDetail.save();
    res.json({ message: "Call detail updated successfully", callDetail });

  } catch (err) {
    console.error("Error updating/allocating call:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get all technicians
// GET /api/technicians
app.get("/api/technicians", async (req, res) => {
  try {
    // fetch only employees with emptype = "Technician"
    const technicians = await Employee.find(
      { emptype: "Technician" , status: "Active"},
      "name"
    );
    
    res.json(technicians);
  } catch (err) {
    console.error("Error fetching technicians:", err);
    res.status(500).json({ error: "Failed to fetch technicians" });
  }
});

// --- APPROVE or REJECT Return Spare ---
app.put("/api/spares/approval/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "approve" or "reject"

    // 1️⃣ Find spare first (since frontend sends spare._id)
    const spare = await Spare.findById(id);
    if (!spare) {
      return res.status(404).json({ error: "Spare not found" });
    }

    // 2️⃣ Find corresponding return record (by itemNo + brand + mslType)
    const returnSpare = await ReturnSpare.findOne({
      spareCode: spare.itemNo,
      brand: spare.brand,
      mslType: spare.mslType,
    });

    if (!returnSpare) {
      return res.status(404).json({ error: "Matching return spare not found" });
    }

    // --- APPROVE ---
    if (action === "approve") {
      // ✅ Update ReturnSpare → Return Approved
      returnSpare.status = "Return Approved";
      returnSpare.approvedDate = new Date();
      await returnSpare.save();

      // ✅ Delete spare from Spare collection
      await Spare.findByIdAndDelete(spare._id);

      return res.json({
        message: "Return approved successfully.",
        updated: returnSpare,
      });
    }

    // --- REJECT ---
    else if (action === "reject") {
      // ✅ Update Spare → status ""
      await Spare.findByIdAndUpdate(spare._id, { status: "" });

      // ✅ Delete ReturnSpare
      await ReturnSpare.findOneAndDelete({
        spareCode: spare.itemNo,
        brand: spare.brand,
        mslType: spare.mslType,
      });

      return res.json({ message: "Return rejected successfully." });
    }

    // --- INVALID ACTION ---
    else {
      return res.status(400).json({ error: "Invalid action specified." });
    }
  } catch (err) {
    console.error("Error processing approval/rejection:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ --- GET Return Spares for display ---
// --- GET Return Spares for Display ---
app.get("/api/spares/return", async (req, res) => {
  try {
    const { brand, fromDate, toDate, mslStatus, condition, showApproval } = req.query;

    let spares = [];

    // 🔹 GOOD RETURNS
    if (condition === "good") {
      let filter = {};

      // 🔹 Filter by Brand
      if (brand) filter.brand = brand;

      // 🔹 MSL Filter
      if (mslStatus) filter.mslType = mslStatus;

      // 🔹 Date Range
      if (fromDate && toDate) {
        filter.datespare = {
          $gte: new Date(fromDate),
          $lte: new Date(toDate),
        };
      }

      // 🔹 Status condition
      if (showApproval === "true") {
        filter.status = "Return Initiated"; // Waiting for approval
      } else {
        filter.status = { $ne: "Return Initiated" }; // Exclude initiated ones
      }

      const spareDocs = await Spare.find(filter).lean();

      // 🔹 Compute number of days from spare date
      const today = new Date();
      spares = spareDocs.map((s) => {
        const spareDate = s.datespare ? new Date(s.datespare) : null;
        const noOfDays = spareDate
          ? Math.floor((today - spareDate) / (1000 * 60 * 60 * 24))
          : 0;

        return { ...s, noOfDays };
      });
    }

    // 🔹 DEFECTIVE RETURNS
    else if (condition === "defective") {
      let query = { defectiveSubmitted: "yes" };

      if (fromDate && toDate) {
        query.completionDate = {
          $gte: new Date(fromDate),
          $lte: new Date(new Date(toDate).setHours(23, 59, 59, 999)),
        };
      }

      if (brand) query.brand = brand;

      console.log("Defective query:", query);

      spares = await CallDetail.find(query)
        .select("brand spareCode spareName qty completionDate")
        .lean();
    }

    // 🔹 Final response
    console.log("Final spares count:", spares.length);
    res.json(spares);
  } catch (err) {
    console.error("Error fetching spares:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- APPROVE or REJECT Return Spare ---
app.put("/api/spares/approval/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "approve" or "reject"

    // Find ReturnSpare by ID
    const returnSpare = await ReturnSpare.findById(id);
    if (!returnSpare) {
      return res.status(404).json({ error: "Return spare not found" });
    }

    // --- APPROVE ---
    if (action === "approve") {
      if (returnSpare.status !== "Return Initiated") {
        return res
          .status(400)
          .json({ error: "Only 'Return Initiated' items can be approved." });
      }

      // ✅ Update ReturnSpare status → Return Approved
      returnSpare.status = "Return Approved";
      returnSpare.approvedDate = new Date();
      await returnSpare.save();

      // ✅ Delete corresponding Spare using itemNo and brand
      await Spare.findOneAndDelete({
        itemNo: returnSpare.spareCode, // check spareCode in ReturnSpare
        brand: returnSpare.brand,
      });

      return res.json({
        message: "Return approved successfully.",
        updated: returnSpare,
      });
    }

    // --- REJECT ---
    else if (action === "reject") {
      // ✅ Update Spare status to empty string
      await Spare.findOneAndUpdate(
        {
          itemNo: returnSpare.spareCode, // check spareCode in ReturnSpare
          brand: returnSpare.brand,
        },
        { status: "" }
      );

      // ✅ Delete from ReturnSpare collection
      await ReturnSpare.findByIdAndDelete(id);

      return res.json({ message: "Return rejected successfully." });
    }

    // --- INVALID ACTION ---
    else {
      return res.status(400).json({ error: "Invalid action specified." });
    }
  } catch (err) {
    console.error("Error processing approval/rejection:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// --- Save Returned Spares ---
// --- Save Returned Spares ---
app.post("/api/spares/return", async (req, res) => {
  try {
    const { selectedSpares, returnType } = req.body;

    if (!selectedSpares || selectedSpares.length === 0) {
      return res.status(400).json({ error: "No spares selected" });
    }

    let results = [];

    for (const spare of selectedSpares) {
      const userQty = spare.returnQty || 0;

      // ✅ Update Spare status if it's a "good" return
      if (returnType === "good") {
        const updateField = spare._id
          ? { _id: spare._id }
          : { itemNo: spare.itemNo };

        await Spare.findOneAndUpdate(updateField, {
          $set: { status: "Return Initiated" },
        });
      }

      // ✅ Log return in ReturnSpare collection
      const returnDoc = new ReturnSpare({
        spareCode: spare.itemNo || "",
        spareName: spare.itemName || "",
        brand: spare.brand || "",
        returnQty: userQty,
        mslType: spare.mslType || "",
        spareDate: spare.datespare || new Date(),
        status: "Return Initiated",
        returnDate: new Date(),
        returnType, // good / defective
      });

      await returnDoc.save();
      results.push({ itemNo: spare.itemNo, success: true });
    }

    res.json({ message: "Return processed successfully", results });
  } catch (err) {
    console.error("Error saving return spares:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



// ✅ Get return spares by brand & only "Return Initiated" status
app.get("/api/returnspares", async (req, res) => {
  try {
    const { brand } = req.query;
    let query = { status: "Return Approved" }; // 👈 filter by status

    if (brand) query.brand = brand; // apply brand filter if provided

    const spares = await ReturnSpare.find(query).lean();
    res.json(spares); // always send JSON
  } catch (err) {
    console.error("Error fetching return spares:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// Get spare details by code
app.get("/api/spares/:code", async (req, res) => {
  try {
    const spare = await Spare.findOne({ itemNo: req.params.code }).lean();
    if (!spare) return res.status(404).json({ error: "Spare not found" });
    res.json(spare);
  } catch (err) {
    console.error("Error fetching spare:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/reports", async (req, res) => {
  try {
    const { brand, reportType, spareCode, returnDate } = req.query;
    let data = [];
    const brandFilter = (brand && brand !== "All") ? { brand } : {};

    if (reportType === "Spare Availability") {
      if (!spareCode) return res.status(400).json({ error: "Spare code is required" });

      const spare = await Spare.findOne({ itemNo: spareCode, ...brandFilter });
      if (!spare) return res.json([]);

      data = [{
        spareCode: spare.itemNo,
        spareName: spare.itemName,
        quantity: spare.quantity,
        dateSpare: spare.datespare ? spare.datespare.toISOString().split("T")[0] : null
      }];
      return res.json(data);
    }

    else if (reportType === "Not Received") {
      const pendingCalls = await CallDetail.find({ status: "spare pending", ...brandFilter });
      const allSpares = await Spare.find({ ...brandFilter }, { itemNo: 1 });
      const availableItemNos = allSpares.map(s => s.itemNo);

      data = pendingCalls
        .filter(c => !availableItemNos.includes(c.spareCode))
        .map(c => ({
          callNo: c.callNo,
          brand: c.brand,
          spareCode: c.spareCode,
          status: c.status
        }));
      return res.json(data);
    }

    else if (reportType === "Not Allocated") {
      const pendingCalls = await CallDetail.find({ status: "spare pending", ...brandFilter });
      const spares = await Spare.find({ ...brandFilter });
      const spareMap = {};
      spares.forEach(s => { spareMap[s.itemNo] = s; });

      data = pendingCalls
        .filter(c => spareMap[c.spareCode] && c.qty <= spareMap[c.spareCode]?.quantity)
        .map(c => ({
          callNo: c.callNo,
          brand: c.brand,
          spareCode: c.spareCode,
          callQty: c.qty,
          availableQty: spareMap[c.spareCode]?.quantity || 0,
        }));
      return res.json(data);
    }

    else if (reportType === "Defective Received") {
      const defectiveCalls = await CallDetail.find({ status: "completed", defectiveSubmitted: "yes", ...brandFilter });
      data = defectiveCalls.map(c => ({
        callNo: c.callNo,
        brand: c.brand,
        spareCode: c.spareCode,
        spareName: c.spareName,
        status: c.status,
        quantity: c.qty,
        defective: c.defectiveSubmitted
      }));
      return res.json(data);
    }

    else if (reportType === "Defective Not Received") {
      const defectiveCalls = await CallDetail.find({ status: "spare allocated", defectiveSubmitted: "no", ...brandFilter });
      data = defectiveCalls.map(c => ({
        callNo: c.callNo,
        brand: c.brand,
        spareCode: c.spareCode,
        spareName: c.spareName,
        status: c.status,
        quantity: c.qty,
        defective: c.defectiveSubmitted
      }));
      return res.json(data);
    }

    // 🔹 Good Return
    else if (reportType === "Good Return") {
      const filter = { returnType: "good", status: "Return Approved", ...brandFilter };
      if (returnDate) {
        const start = new Date(returnDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(returnDate);
        end.setHours(23, 59, 59, 999);
        filter.returnDate = { $gte: start, $lte: end };
      }

      const returns = await ReturnSpare.find(filter);
      data = returns.map(r => ({
        spareCode: r.spareCode,
        spareName: r.spareName,
        brand: r.brand,
        returnQty: r.returnQty,
        returnDate: r.returnDate ? r.returnDate.toISOString().split("T")[0] : null,
        status: r.status
      }));
      return res.json(data);
    }

    // fallback
    return res.json([]);

  } catch (err) {
    console.error("❌ Error generating report:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/returnDates", async (req, res) => {
  try {
    const { brand } = req.query;
    const filter = { returnType: "good" };
    if (brand && brand !== "All") filter.brand = brand;

    const dates = await ReturnSpare.find(filter).distinct("returnDate");

    // ✅ Convert to YYYY-MM-DD and remove duplicates
    const uniqueDates = [...new Set(
      dates.map(d => new Date(d).toISOString().split("T")[0])
    )].sort((a, b) => new Date(b) - new Date(a)); // latest first

    res.json(uniqueDates);
  } catch (err) {
    console.error("❌ Error fetching return dates:", err);
    res.status(500).json([]);
  }
});

app.get("/api/dashboardCounts", async (req, res) => {
  try {
    const { brand } = req.query;
    const brandFilter = brand && brand !== "All" ? { brand } : {};

    const today = new Date().toISOString().split("T")[0];

    const completed = await CallDetail.countDocuments({
      ...brandFilter,
      status: "completed",
      completionDate: {
        $gte: new Date(today),
        $lt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000),
      },
    });

    const pending = await CallDetail.countDocuments({
      ...brandFilter,
      status: { $ne: "completed" },
    });

    const ageing = await CallDetail.countDocuments({
      ...brandFilter,
      status: { $ne: "completed" },
      assignedDate: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
    });
const highPriority = await CallDetail.countDocuments({
      ...brandFilter,
      status: { $ne: "completed" },
      
       ...(brand === "Havells"
    ? {
        
        assignedDate: {
         $gte: new Date(Date.now() - 21 * 60 * 60 * 1000),
        },
      }
    : {
        // default rule if not Havells
        assignedDate: {
          $gte: new Date(Date.now() - 46 * 60 * 60 * 1000),
        },
      }),
});
    const appointment = await CallDetail.countDocuments({
      ...brandFilter,
      status: "appointment",
        });

    // 🔹 Spare counts
 // 6th Card → Not Received
const pendingCalls_NR = await CallDetail.find({ status: "spare pending", ...brandFilter });
const allSpares_NR = await Spare.find({ ...brandFilter }, { itemNo: 1 });  // ✅ note: itemNo not ItemNo
const availableItemNos_NR = allSpares_NR.map(s => s.itemNo);

const notReceived = pendingCalls_NR
  .filter(c => !availableItemNos_NR.includes(c.spareCode))
  .length;


// 7th Card → Not Allocated
const pendingCalls_NA = await CallDetail.find({ status: "spare pending", ...brandFilter });
const spares_NA = await Spare.find({ ...brandFilter });

const spareMap_NA = {};
spares_NA.forEach(s => {
  spareMap_NA[s.itemNo] = s;
});

const notAllocated = pendingCalls_NA
  .filter(c => {
    const spare = spareMap_NA[c.spareCode];
    return spare && c.qty <= spare.quantity;
  })
  .length;
console.log(notAllocated);



// Fetch pending calls
const pendingCalls = await CallDetail.find({ status: "spare pending", ...brandFilter });

// Fetch available spares
const spares = await Spare.find({ ...brandFilter });

// Build spare lookup
const spareMap = {};
spares.forEach(s => {
  spareMap[s.itemNo] = s;
});

// Apply same filter as report
const spareNotAllocated = pendingCalls.filter(c => {
  const spare = spareMap[c.spareCode];
  return spare && c.qty <= spare.quantity;
}).length;


    res.json({
      completed,
      pending,
      appointment,
      highPriority,
      ageing,
     
      notReceived,
      notAllocated,
       spareNotAllocated,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});




// Update status to CN received
app.post("/api/returnspares/cnreceived", async (req, res) => {
  try {
    const { ids } = req.body;
    await ReturnSpare.updateMany(
      { _id: { $in: ids } },
      { $set: { status: "CN received" } }
    );
    res.json({ message: "Status updated successfully" });
  } catch (err) {
    console.error("Error updating CN received:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



// GET Spare Returns API
app.get("/api/spare-returns", async (req, res) => {
  try {
    const { brand, fromDate, toDate, mslType, conditionType } = req.query;

    const spareFilter = {
      ...(brand && brand !== "Select" && { brand }),
      ...(fromDate && toDate && {
        spareDate: { $gte: new Date(fromDate), $lte: new Date(toDate) }
      }),
      ...(mslType && { msl: mslType }) // Assuming field name is 'msl'
    };

    let spares = await Spare.find(spareFilter).lean();

    if (conditionType === "Defective") {
      // Match with call details that are defective
      const spareCodes = spares.map(s => s.itemNo);
      const defectiveCalls = await CallDetail.find({
        spareCode: { $in: spareCodes },
        defective: "Yes"
      }).lean();

      spares = spares.filter(s =>
        defectiveCalls.some(c => c.spareCode === s.itemNo)
      );
    } 
    else if (conditionType === "Good") {
      // Good = not allocated
      const allocatedCalls = await CallDetail.find({
        status: "Spare Allocated"
      }).lean();

      const allocatedCodes = allocatedCalls.map(c => c.spareCode);
      spares = spares.filter(s => !allocatedCodes.includes(s.itemNo));
    }

    res.json(spares);
  } catch (err) {
    console.error("Error fetching spare returns:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// === Multer for File Upload ===
const upload = multer({ dest: path.join(__dirname, "uploads") });

// === Upload Calls Route ===

app.post("/api/calls/upload", upload.single("file"), async (req, res) => {
  try {
    const { brand } = req.body;
    if (!brand) return res.status(400).json({ error: "Brand is required" });

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    let calls = [];

 
       if (brand === "Havells") {
        const formats = ["DD/MM/YYYY HH:mm:ss", "DD/MM/YYYY HH:mm", "DD/MM/YYYY"];
    calls = sheet.map((row) => {
        const dateValue = row["Created On"];
        let jsDate = null;

        if (dateValue) {
            if (typeof dateValue === "string") {
                const m = moment(dateValue.trim(), formats, true);
                if (m.isValid()) {
                    jsDate = m.toDate();
                } else {
                    console.error("Invalid date format:", dateValue);
                }
            } else if (typeof dateValue === "number") {
                // Excel serial date conversion
                jsDate = new Date((dateValue - 25569) * 86400 * 1000);
            }
        }
     return {
        brand,
        callNo: row["Job ID"],
        phoneNo: "",
        customerName: row["Customer"],
        address: row["Full Address"],
        pincode: row["Pin code"],
        type: row["Warranty Status"],
        product: row["Product Category"],
        model: row["Product Subcategory"],
        tat:  jsDate, // Parsed date stored here
        callerType: row["Caller Type"] || "",
        callSubtype: row["Call Subtype"] || "",
        natureOfComplaint: row["Nature of Complaint"] || "",
         };
    });
} else if (brand === "Bajaj - Surendhar Enterprises") {

          const formats = ["DD/MM/YYYY HH:mm:ss", "DD/MM/YYYY HH:mm", "DD/MM/YYYY"];
// Function to convert Excel serial to JS Date
function excelSerialToFormattedString(serial) {
    const excelEpoch = new Date(1899, 11, 30); // Excel epoch in local time
    const days = Math.floor(serial);
    const fraction = serial - days;
    const ms = Math.round(fraction * 24 * 60 * 60 * 1000);
    const date = new Date(excelEpoch.getTime() + days * 86400000 + ms);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // month 1–12
    const dd = String(date.getDate()).padStart(2, '0');
    const HH = String(date.getHours()).padStart(2, '0');
    const MM = String(date.getMinutes()).padStart(2, '0');
    const SS = String(date.getSeconds()).padStart(2, '0');

    return `${yyyy}-${dd}-${mm} ${HH}:${MM}:${SS}`;
}
    calls = sheet.map((row) => {
        const dateValue = row["Complaint Date and Time"];
        let jsDate = null;

        if (dateValue) {
            if (typeof dateValue === "string") {
                const m = moment(dateValue.trim(), formats, true);
                if (m.isValid()) {
                    jsDate = m.toDate();
                } else {
                    console.error("Invalid date format:", dateValue);
                }
            } else if (typeof dateValue === "number") {
                // Excel serial date conversion
                jsDate = new Date((dateValue - 25569) * 86400 * 1000);
            }
        }

        return {
            brand,
            callNo: row["Complaint Number"],
            phoneNo: row["Mobile No"] || "",
            customerName: row["Name"],
            address: row["Address"],
            pincode: row["Pin code"],
            callSubtype:
                row["Call Type"] === "Complaint Call"
                    ? "Breakdown"
                    : row["Call Type"],
            product: row["Product Type"],
            model: row["BU 3"],
            tat: jsDate || null, // Parsed date stored here
            callerType:
                row["Complaint From"] === "End Customer"
                    ? "Customer"
                    : row["Complaint From"] || "",
            type: row["Warranty Status"] || "",
            natureOfComplaint: row["Nature Of Complaint"] || "",
        };
    });
} 
/*  const formats = ["DD/MM/YYYY HH:mm:ss", "DD/MM/YYYY HH:mm", "DD/MM/YYYY"];
// Function to convert Excel serial to JS Date
function excelSerialToFormattedString(serial) {
    const excelEpoch = new Date(1899, 11, 30); // Excel epoch in local time
    const days = Math.floor(serial);
    const fraction = serial - days;
    const ms = Math.round(fraction * 24 * 60 * 60 * 1000);
    const date = new Date(excelEpoch.getTime() + days * 86400000 + ms);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // month 1–12
    const dd = String(date.getDate()).padStart(2, '0');
    const HH = String(date.getHours()).padStart(2, '0');
    const MM = String(date.getMinutes()).padStart(2, '0');
    const SS = String(date.getSeconds()).padStart(2, '0');

    return `${yyyy}-${dd}-${mm} ${HH}:${MM}:${SS}`;
}
    calls = sheet.map((row) => {
        const dateValue = row["Complaint date"];
        let jsDate = null;

        if (dateValue) {
            if (typeof dateValue === "string") {
                const m = moment(dateValue.trim(), formats, true);
                if (m.isValid()) {
                    jsDate = m.toDate();
                } else {
                    console.error("Invalid date format:", dateValue);
                }
            } else if (typeof dateValue === "number") {
                // Excel serial date conversion
                jsDate = new Date((dateValue - 25569) * 86400 * 1000);
            }
        }

        return {
            brand,
            callNo: row["Complaint number"],
            phoneNo: row["Mobile No"] || "",
            customerName: row["Name"],
            address: row["Address"],
            pincode: row["Pin code"],
            callSubtype:
                row["Call Type"] === "Complaint Call"
                    ? "Breakdown"
                    : row["Call Type"],
            product: row["Product type"],
            model: row["BU 3"],
            tat: jsDate, // Parsed date stored here
            callerType:
                row["Complaint From"] === "End Customer"
                    ? "Customer"
                    : row["Complaint From"] || "",
            type: row["Warranty Status"] || "",
            natureOfComplaint: row["Nature Of Complaint"] || "",
        };
    });
} */else if (brand === "Bajaj - S.R Enterprises") {

          const formats = ["DD/MM/YYYY HH:mm:ss", "DD/MM/YYYY HH:mm", "DD/MM/YYYY"];
// Function to convert Excel serial to JS Date
function excelSerialToFormattedString(serial) {
    const excelEpoch = new Date(1899, 11, 30); // Excel epoch in local time
    const days = Math.floor(serial);
    const fraction = serial - days;
    const ms = Math.round(fraction * 24 * 60 * 60 * 1000);
    const date = new Date(excelEpoch.getTime() + days * 86400000 + ms);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // month 1–12
    const dd = String(date.getDate()).padStart(2, '0');
    const HH = String(date.getHours()).padStart(2, '0');
    const MM = String(date.getMinutes()).padStart(2, '0');
    const SS = String(date.getSeconds()).padStart(2, '0');

    return `${yyyy}-${dd}-${mm} ${HH}:${MM}:${SS}`;
}
    calls = sheet.map((row) => {
        const dateValue = row["Complaint Date and Time"];
        let jsDate = null;

        if (dateValue) {
            if (typeof dateValue === "string") {
                const m = moment(dateValue.trim(), formats, true);
                if (m.isValid()) {
                    jsDate = m.toDate();
                } else {
                    console.error("Invalid date format:", dateValue);
                }
            } else if (typeof dateValue === "number") {
                // Excel serial date conversion
                jsDate = new Date((dateValue - 25569) * 86400 * 1000);
            }
        }

        return {
            brand,
            callNo: row["Complaint Number"],
            phoneNo: row["Mobile No"] || "",
            customerName: row["Name"],
            address: row["Address"],
            pincode: row["Pin code"],
            callSubtype:
                row["Call Type"] === "Complaint Call"
                    ? "Breakdown"
                    : row["Call Type"],
            product: row["Product Type"],
            model: row["BU 3"],
            tat: jsDate || null, // Parsed date stored here
            callerType:
                row["Complaint From"] === "End Customer"
                    ? "Customer"
                    : row["Complaint From"] || "",
            type: row["Warranty Status"] || "",
            natureOfComplaint: row["Nature Of Complaint"] || "",
        };
    });
} else  if (brand === "Usha") {
      const formats = ["DD/MM/YYYY HH:mm:ss", "DD/MM/YYYY HH:mm", "DD/MM/YYYY"];
// Function to convert Excel serial to JS Date
function excelSerialToFormattedString(serial) {
    const excelEpoch = new Date(1899, 11, 30); // Excel epoch in local time
    const days = Math.floor(serial);
    const fraction = serial - days;
    const ms = Math.round(fraction * 24 * 60 * 60 * 1000);
    const date = new Date(excelEpoch.getTime() + days * 86400000 + ms);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // month 1–12
    const dd = String(date.getDate()).padStart(2, '0');
    const HH = String(date.getHours()).padStart(2, '0');
    const MM = String(date.getMinutes()).padStart(2, '0');
    const SS = String(date.getSeconds()).padStart(2, '0');

    return `${yyyy}-${dd}-${mm} ${HH}:${MM}:${SS}`;
}

    calls = sheet.map((row) => {
        const dateValue = row["Created Date"];
        let jsDate = null;

        if (dateValue) {
            if (typeof dateValue === "string") {
                const m = moment(dateValue.trim(), formats, true);
                if (m.isValid()) {
                    jsDate = m.toDate();
                    console.log("Parsed date:", jsDate);
                } else {
                    console.error("Invalid date format:", dateValue);
                }
            } else if (typeof dateValue === "number") {
                // Excel serial date conversion
                
              jsDate = excelSerialToFormattedString(dateValue); 
            console.log("Converted from serial:", jsDate);
  }
}
    return{
        brand,
        callNo: row["Ticket Name"],
        phoneNo: row["Mobile Number"],
        customerName: row["Customer Name"],
        address: row["Address"],
        pincode: row["Pincode"],
        type: row["Warranty"],
        product: row["Product Name"],
        model: row["Product Model"],
        tat: jsDate,
        callerType: row["Customer Type"] || "",
        callSubtype: row["Type"] === "After Use" || "Before Use" ? "Breakdown" : row["Type"] || "",
        natureOfComplaint: row["Symptom"] || "",
      };
    });
}
 else if (brand === "Atomberg") {
   const formats = ["DD/MM/YYYY HH:mm:ss", "DD/MM/YYYY HH:mm", "DD/MM/YYYY"];

    calls = sheet.map((row) => {
        const dateValue = row["Created Date"];
        let jsDate = null;

        if (dateValue) {
            if (typeof dateValue === "string") {
                const m = moment(dateValue.trim(), formats, true);
                if (m.isValid()) {
                    jsDate = m.toDate();
                } else {
                    console.error("Invalid date format:", dateValue);
                }
            } else if (typeof dateValue === "number") {
                // Excel serial date conversion
                jsDate = new Date((dateValue - 25569) * 86400 * 1000);
            }
        }
      return{
        brand,
        callNo: row["Case Number"],
        phoneNo: row["Mobile No"] || "",
        customerName: row["Customer Name"],
        address: row["Street"],
        pincode: row["Zip/Postal Code"],
        callSubtype:
          row["Type Of Work Order"] === "Repair"
            ? "Breakdown"
            : row["Type Of Work Order"],
        product: row["Product Type"],
        model: row["Product Name"],
        tat: jsDate,
        callerType:
          row["Complaint From"] === "End Customer"
            ? "Customer"
            : row["Complaint From"] || "",
        type: row["Warranty Status"] || "",
        natureOfComplaint: row["Customer Complaint"] || "",
       };
    });
}


    // **1. Get all callNos from excel**
    const callNos = calls.map((c) => c.callNo);

    // **2. Find duplicates in DB for same brand**
    const existing = await CallDetail.find({
      callNo: { $in: callNos },
      brand: brand,
    }).select("callNo");

    const existingCallNos = new Set(existing.map((c) => c.callNo));

    // **3. Filter new records only**
    const newCalls = calls.filter((c) => !existingCallNos.has(c.callNo));

    // **4. Insert only new calls**
    if (newCalls.length > 0) {
      await CallDetail.insertMany(newCalls);
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      message: `Upload complete. ${newCalls.length} new calls added. ${existingCallNos.size} duplicates skipped.`,
    });
  } catch (error) {
    console.error("Error uploading calls:", error);
    res.status(500).json({ error: "Failed to process file" });
  }
});




// --- API to fetch item name by item no ---
app.get("/api/items/:itemNo", async (req, res) => {
  try {
    const itemNo = req.params.itemNo;
    const item = await Sbom.findOne({ itemno: itemNo });

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({
      item_name: item.itemname,
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ message: "Server error" });
  }
});




app.get("/api/calls/search", async (req, res) => {
  try {
    const query = req.query.query;
    if (!query) return res.status(400).json({ error: "Query is required" });

    const calls = await CallDetail.find({
      $or: [{ callNo: query }, { phoneNo: query }],
    });

    if (!calls.length) return res.status(404).json({ error: "No calls found" });

    res.json({ calls });
  } catch (error) {
    console.error("Error searching calls:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Multer config (store in temp folder)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload1 = multer({ storage });

// Route to upload SBOM Excel
app.post("/api/calls/uploadsbom", upload.single("file"), async (req, res) => {
  try {
    const { brand } = req.body;
    if (!brand) {
      return res.status(400).json({ error: "Brand is required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "File is required" });
    }

    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Example: only keep certain fields (Part Number, Description, Price)
      if (brand === "Bajaj - S.R Enterprises" || "Bajaj - Surendhar Enterprises") {
    const records = sheetData.map(row => ({
      brand,
       productno:  row["PARENT_ITM_CD"] || "",
      prodname: row["ITM_NM"] || "",
       itemno:  row["CHILD_ITM_CD"] || "",
        itemname:  row["ITM_NM_1"] || "",
      price: row["Price"] ? parseFloat(row["Price"]) : 0
    }));
  }
 else
 {
    const records = sheetData.map(row => ({
      brand,
       productno:  row["PARENT_ITM_CD"] || "",
      prodname: row["ITM_NM"] || "",
       itemno:  row["CHILD_ITM_CD"] || "",
        itemname:  row["ITM_NM_1"] || "",
      price: row["Price"] ? parseFloat(row["Price"]) : 0
    }));
 }
    // Insert into MongoDB
    await Sbom.insertMany(records);

    res.json({ message: "SBOM uploaded successfully", count: records.length });
  } catch (error) {
    console.error("Error uploading SBOM:", error);
    res.status(500).json({ error: "Error processing SBOM file" });
  }
});




app.get("/api/calls/report", async (req, res) => {
  try {
    const { brand,fromDate, toDate, technician, status, pendingCategory, dateType } = req.query;

    let query = {};

    // Technician filter
    if (technician && technician !== "All") {
      query.technician = technician;
    }
 if (brand && brand !== "All") {
      query.brand = brand;
    }
    // Status & Pending Category
    if (status && status !== "All") {
      if (status === "completed") {
        query.status = "completed";
      } else if(status == "Appointment"){
 query.status = "appointment";
      }
      
      else if (status === "pending") {
        query.status = { $ne: "completed" };
        

        if (pendingCategory && pendingCategory !== "All") {
          if (pendingCategory === "Pending with Technician") query.status = "pending";
          else if (pendingCategory === "Spare Pending") query.status = "spare pending";
          else if (pendingCategory === "Replacement") query.status = "replacement done";
          else if (pendingCategory === "Appointment") query.status = "appointment";
          else if (pendingCategory === "Others") {
            query.status = {
              $nin: ["pending", "spare pending", "replacement done", "appointment", "completed"]
            };
          }
        }
      } else if (status === "Ageing Calls") {
        query.status = { $ne: "completed" }; // only consider non-completed calls
      } else if (status === "High Priority Calls") {
        query.status = { $ne: "completed" };
      }
    }

    // Date range filter
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);

      if (dateType === "completionDate") {
        query.completionDate = { $gte: start, $lte: end };
      } else {
        query.assignedDate = { $gte: start, $lte: end };
      }
    }

    let calls = await CallDetail.find(query).sort({ callNo: 1 });

    // Apply TAT-based filters (Ageing & High Priority)
    if (status === "Ageing Calls") {
      calls = calls.filter(c => {
        if (!c.assignedDate) return false;
        const hours = (Date.now() - new Date(c.assignedDate).getTime()) / (1000 * 60 * 60);
        return hours > 48;
      });
    } else if (status === "High Priority Calls") {
      calls = calls.filter(c => {
        if (!c.assignedDate) return false;
        const hours = (Date.now() - new Date(c.assignedDate).getTime()) / (1000 * 60 * 60);
        return hours >= 46;
      });
    }  else if (status === "Repeat Calls") {
  // Get date range: last 60 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 60);

  // First, find all calls within last 60 days
  let last60DaysCalls = await CallDetail.find({
    assignedDate: { $gte: startDate }
  });

  // Group calls by phoneNo + model
  const repeatGroups = {};
  last60DaysCalls.forEach(c => {
    if (!c.phoneNo || !c.model) return;
    const key = `${c.phoneNo}_${c.model}`;
    if (!repeatGroups[key]) repeatGroups[key] = [];
    repeatGroups[key].push(c);
  });

  // Keep only groups with more than 1 entry (repeat calls)
  let repeatCalls = [];
  Object.values(repeatGroups).forEach(group => {
    if (group.length > 1) {
      repeatCalls = repeatCalls.concat(group);
    }
  });

  calls = repeatCalls;
}


    // Inside app.get("/api/calls/report")
if (req.query.date === "today") {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  if (req.query.status === "completed") {
    query.completionDate = { $gte: start, $lte: end };
  } else {
    query.assignedDate = { $gte: start, $lte: end };
  }
}

    // Add TAT field to each call
    // Add TAT field to each call
calls = calls.map(c => {
let tat=null;

  if (c.tat) {
    // Parse as YYYY-DD-MM
     const tatDate = moment(c.tat); // auto parse ISO
    if (tatDate.isValid()) {
      tat = moment().diff(tatDate, "hours"); // TAT in hours
    }
  }

  return { ...c._doc, tat };
});
  

    res.json({
      totalCount: calls.length,
      data: calls,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});



app.get("/api/calls/filter", async (req, res) => {
  try {
    const { brand, products, pincodes, status } = req.query;
    const query = {};

    // Apply filters
    if (brand && brand !== "All") query.brand = brand;
    if (products) query.product = { $in: products.split(",") };
    if (pincodes) query.pincode = { $in: pincodes.split(",") };
    if (status !== undefined) query.status = status; // "" or any status

    const calls = await CallDetail.find(query).sort({ _id: -1 });
    const count = await CallDetail.countDocuments(query);

    res.json({ calls, count });
  } catch (error) {
    console.error("Error fetching filtered calls:", error);
    res.status(500).json({ error: "Failed to fetch calls" });
  }
});

// Get calls based on brand, products and pincodes
app.get("/api/calls/filter-count", async (req, res) => {
  try {
    const { brand, products, pincodes } = req.query;

    const query = { status: "" }; // only unassigned calls

    if (brand && brand !== "All") query.brand = brand;
    if (products) query.product = { $in: products.split(",") };
    if (pincodes) query.pincode = { $in: pincodes.split(",") };

    const count = await CallDetail.countDocuments(query);
    res.json({ count });
  } catch (error) {
    console.error("Error fetching call count:", error);
    res.status(500).json({ error: "Failed to fetch count" });
  }
});



app.get("/api/calls/pending-count", async (req, res) => {
  try {
    const brand = req.query.brand;

    let query = { status: { $nin: ["", "completed"] } }; // exclude empty & completed

    if (brand && brand.toLowerCase() !== "all") {
      query.brand = brand;
    }

    const count = await CallDetail.countDocuments(query);
    res.json({ count });
  } catch (error) {
    console.error("Error fetching pending count:", error);
    res.status(500).json({ error: "Failed to fetch pending count" });
  }
});


// Get calls where status is NOT 'completed'
// Fetch pending calls (not completed)
app.get("/api/calls/pending", async (req, res) => {
  try {
    const { brand, technician } = req.query;

    // Base query: all calls except completed
    let query = { status: { $nin: ["", "completed"] } };

    // ✅ Filter by brand if provided
    if (brand && brand.toLowerCase() !== "all") {
      query.brand = brand;
    }

    // ✅ Filter by technician if provided
    if (technician && technician.toLowerCase() !== "all") {
      query.technician = technician;
    }

    const calls = await CallDetail.find(query).sort({ _id: -1 });

    res.json(calls);
  } catch (err) {
    console.error("Error fetching pending calls:", err);
    res.status(500).json({ error: "Failed to fetch pending calls" });
  }
});

app.put("/api/calls/updateStatus", async (req, res) => {
  try {
    const { callNos, status, extra } = req.body;

    if (!callNos || callNos.length === 0)
      return res.status(400).json({ error: "No calls selected" });

    let updateData = { status };

    // Direct Completed
    if (status === "completed" && extra?.completionDate) {
      updateData.completionDate = extra.completionDate;
      updateData.spareCode = "";
      updateData.spareName="";
      updateData.qty="";
    }

    // Spare Allocated or Replacement Done
    if (
      (status === "spare allocated" || status === "replacement done")
    ) {
      if (extra?.defectiveSubmitted === "yes") {
        updateData.status = "completed";
        updateData.completionDate = extra?.completionDate || new Date();
         updateData.defectiveSubmitted = "yes";
      } else {
        // Defective NOT returned → store amount received
        if (extra?.amountReceived !== undefined) {
          updateData.amountReceived = extra.amountReceived;
        }
        updateData.defectiveSubmitted = "no";
      }
    }

    // Appointment Date
    if (status === "appointment" && extra?.appointmentDate) {
      updateData.appointmentDate = extra.appointmentDate;
    }

    // Escalation / Cancel
    if ((status === "escalation" || status === "cancel") && extra?.reason) {
      updateData.reason = extra.reason;
    }

    // Spare Pending
    if (status === "spare pending") {
      updateData.spareCode = extra?.spareCode || "";
      updateData.spareName = extra?.spareName || "";
      updateData.qty = extra?.qty || 0;
    }

    await CallDetail.updateMany(
      { callNo: { $in: callNos } },
      { $set: updateData }
    );

    res.json({ success: true, message: "Status updated successfully" });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});


// Get all calls for a specific technician where status is not completed
app.get("/api/calls/technician", async (req, res) => {
  try {
    const { technician } = req.query;

    if (!technician) return res.status(400).json({ error: "Technician required" });

    const calls = await CallDetail.find({
      technician: { $regex: `^${technician}$`, $options: "i" },
      status: { $ne: "completed" }
    });

    res.json(calls);
  } catch (err) {
    console.error("Error fetching calls for technician:", err);
    res.status(500).json({ error: "Failed to fetch calls" });
  }
});

app.put("/api/calls/transfer", async (req, res) => {
  try {
    const { callNos, newTechnician } = req.body;
    if (!callNos || callNos.length === 0 || !newTechnician)
      return res.status(400).json({ error: "Invalid request" });

    await CallDetail.updateMany(
      { callNo: { $in: callNos } },
      { $set: { technician: newTechnician } }
    );
      // ✅ Fetch technician details
    const technician1 = await Employee.findOne({ name: newTechnician });
    if (!technician1) {
      return res.status(404).json({ error: "Technician not found" });
    }
       // ✅ Fetch only the updated call details
    const updatedCalls = await CallDetail.find({ callNo: { $in: callNos } });


    res.json({ message: "✅ Calls transferred" });

  } catch (error) {
    console.error("❌ Error transferring technician:", error);
    res.status(500).json({ error: "Failed to transfer technician" });
  }
});
// ✅ Get distinct products and pincodes where technician is empty
app.get("/api/calls/filters", async (req, res) => {
  try {
    const { brand } = req.query;
    let query = { technician: { $in: [null, ""] } }; // only unassigned calls

    if (brand && brand.toLowerCase() !== "all") {
      query.brand = brand;
    }

    // Fetch distinct values based on filtered records
    const products = await CallDetail.distinct("product", query);
    const pincodes = await CallDetail.distinct("pincode", query);

    res.json({ products, pincodes });
  } catch (error) {
    console.error("Error fetching filters:", error);
    res.status(500).json({ error: "Failed to fetch filters" });
  }
});







// Assign technician
app.put("/api/calls/assign", async (req, res) => { 
  try {
    const { callNos, technician, assignedDate, brand } = req.body;

    if (!callNos || callNos.length === 0 || !technician || !assignedDate) {
      return res.status(400).json({ error: "Invalid request" });
    }

    // ✅ Update calls
    await CallDetail.updateMany(
      { callNo: { $in: callNos } },
      {
        $set: {
          technician,
          status: "pending",
          assignedDate: new Date(assignedDate),  // Save as Date object
        },
      }
    );

    // ✅ Fetch technician details
    const technician1 = await Employee.findOne({ name: technician });
    if (!technician1) {
      return res.status(404).json({ error: "Technician not found" });
    }
console.log("brand:"+brand+"phone:"+technician1.phone);

    // ✅ Fetch only the updated call details
    const updatedCalls = await CallDetail.find({ callNo: { $in: callNos } });

    res.json({ message: "Technician assigned successfully" });

  } catch (error) {
    console.error("Error assigning technician:", error);
    res.status(500).json({ error: "Failed to assign technician" });
  }
});



// Delete call
app.delete("/api/calls/:callNo", async (req, res) => {
  try {
    const { callNo } = req.params;
    await CallDetail.deleteOne({ callNo });
    res.json({ message: "Call deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete call" });
  }
});

// Edit call
app.put("/api/calls/:callNo", async (req, res) => {
  try {
    const updated = await CallDetail.findOneAndUpdate(
      { callNo: req.params.callNo },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Call not found" });
    res.json({ message: "Call updated", updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update call" });
  }
});


// Get count of calls allocated to a technician
app.get("/api/calls/technician-count/:technician", async (req, res) => {
  try {
    const technician = req.params.technician;
    const count = await CallDetail.countDocuments({ technician });
    res.json({ count });
  } catch (error) {
    console.error("Error fetching technician count:", error);
    res.status(500).json({ error: "Failed to fetch count" });
  }
});


// Add Employee
app.post("/api/employees", async (req, res) => {
  try {
    const newEmployee = new Employee(req.body);
    await newEmployee.save();
    res.json(newEmployee);
  } catch (err) {
    console.error("Error adding employee:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// READ ALL
app.get("/api/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE
app.get("/api/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
app.put("/api/employees/:id", async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// Serve React frontend in production
// ---------------------------
if (process.env.NODE_ENV === "production") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const frontendPath = path.join(__dirname, "../my-crm-frontend/dist");

  // Serve static files from React build
  app.use(express.static(frontendPath));

  // Catch-all: send index.html for any non-API route
 app.get(/.*/, (req, res) => {
   console.log("✅ Mounted frontend catch-all route");

  res.sendFile(path.resolve(frontendPath, "index.html"));
});

}
// ==========================
// 🔹 Start Server
// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

