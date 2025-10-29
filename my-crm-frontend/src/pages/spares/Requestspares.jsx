import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function RequestSpares() {
  const [brands, setBrands] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [brand, setBrand] = useState("");
  const [callNo, setCallNo] = useState("");
  const [technician, setTechnician] = useState("");
  const [spareCode, setSpareCode] = useState("");
  const [qtyRequired, setQtyRequired] = useState("");
  const [spareDetails, setSpareDetails] = useState(null);
  const [callDetails, setCallDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch Brands
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/brands");
        setBrands(res.data);
      } catch {
        toast.error("Failed to fetch brands");
      }
    })();
  }, []);

  // ✅ Fetch Technicians
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/technicians");
        setTechnicians(res.data);
      } catch {
        toast.error("Failed to fetch technicians");
      }
    })();
  }, []);

  // ✅ Fetch spare details when brand + spare code entered
  const handleSpareSearch = async () => {
    if (!brand || !spareCode) return toast.error("Select brand and enter spare code");

    setLoading(true);
    try {
      const res = await axios.get(`/api/spares?brand=${brand}`);
      const found = res.data.find(
        (s) => s.itemNo?.trim().toLowerCase() === spareCode.trim().toLowerCase()
      );
      if (found) {
        setSpareDetails(found);
        toast.success("Spare available in stock");
      } else {
        setSpareDetails(null);
        toast.error("Spare not available in this brand");
      }
    } catch {
      toast.error("Error fetching spare details");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch call details
  const handleCallSearch = async () => {
    if (!callNo) return toast.error("Enter Call Number");
    try {
      const res = await axios.get(`/api/calls/pending?callNo=${callNo}`);
      if (res.data.length > 0) {
        setCallDetails(res.data[0]);
      } else {
        toast.error("No call found");
        setCallDetails(null);
      }
    } catch {
      toast.error("Error fetching call details");
    }
  };

  // ✅ Allocate Spare
  const handleAllocate = async () => {
    if (!callNo || !technician || !spareCode) return toast.error("Fill all fields");

    try {
      await axios.post(`/api/allocatespare/${callNo}`, {
        technician,
        spareCode,
        spareName: spareDetails?.itemName || "",
        quantity: qtyRequired,
        status: "Spare Allocated",
      });
      toast.success("Spare allocated successfully!");
      setCallNo("");
      setTechnician("");
      setSpareCode("");
      setQtyRequired("");
      setSpareDetails(null);
      setCallDetails(null);
    } catch (error) {
      console.error("Error allocating spare:", error);
      toast.error("Failed to allocate spare!");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Spare Allocation</h1>

      {/* Brand */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Select Brand</label>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="">Select Brand</option>
          {brands.map((b) => (
            <option key={b._id} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Spare Code */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Enter Spare Code</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={spareCode}
            onChange={(e) => setSpareCode(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="e.g. SP12345"
          />
          <button
            onClick={handleSpareSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Search
          </button>
        </div>
      </div>

      {/* Spare Details */}
      {spareDetails && (
        <div className="bg-white border rounded-lg p-4 mb-4 shadow">
          <p><b>Spare Name:</b> {spareDetails.itemName}</p>
          <p><b>Available Qty:</b> {spareDetails.quantity}</p>
          <p><b>MRP:</b> ₹{spareDetails.mrp}</p>
          <p><b>Status:</b> {spareDetails.status || "Available"}</p>
        </div>
      )}

      {/* Call Details Input */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Enter Call Number</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={callNo}
            onChange={(e) => setCallNo(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="e.g. 245879"
          />
          <button
            onClick={handleCallSearch}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Fetch Call
          </button>
        </div>
      </div>

      {/* Technician Dropdown */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Assign to Technician</label>
        <select
          value={technician}
          onChange={(e) => setTechnician(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="">Select Technician</option>
          {technicians.map((t) => (
            <option key={t._id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Quantity Required</label>
        <input
          type="number"
          value={qtyRequired}
          onChange={(e) => setQtyRequired(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="Enter quantity"
        />
      </div>

      {/* Call + Spare Summary */}
      {callDetails && (
        <div className="border rounded-lg p-4 mb-4 bg-white shadow">
          <p><b>Customer:</b> {callDetails.customerName}</p>
          <p><b>Address:</b> {callDetails.address}</p>
          <p><b>Status:</b> {callDetails.status}</p>
        </div>
      )}

      {/* Allocate Button */}
      {callDetails && (
        <button
          onClick={handleAllocate}
          className={`w-full py-3 rounded text-white font-semibold transition ${
            spareDetails
              ? "bg-green-600 hover:bg-green-700"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {spareDetails ? "Allocate Spare" : "Spare Not Available"}
        </button>
      )}
    </div>
  );
}
