import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function RequestSpare() {
  const [brands, setBrands] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [brand, setBrand] = useState("");
  const [spareCode, setSpareCode] = useState("");
  const [spareDetails, setSpareDetails] = useState(null);
  const [callNo, setCallNo] = useState("");
  const [technician, setTechnician] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("/api/brands");
        const data = await res.json();
        if (res.ok) setBrands(data);
      } catch (error) {
        toast.error("Error fetching brands");
      }
    };
    fetchBrands();
  }, []);

  // ✅ Fetch technician list
  useEffect(() => {
    const fetchTechs = async () => {
      try {
        const res = await axios.get("/api/technicians");
        setTechnicians(res.data || []);
      } catch {
        toast.error("Error fetching technicians");
      }
    };
    fetchTechs();
  }, []);

  // ✅ Fetch spare details
  const fetchSpareDetails = async () => {
    if (!spareCode.trim() || !brand) {
      toast.error("Select brand and enter spare code");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`/api/spares?brand=${brand}`);
      const found = res.data.find(
        (s) => s.itemNo?.trim().toLowerCase() === spareCode.trim().toLowerCase()
      );
      if (found) {
        setSpareDetails(found);
        toast.success("Spare found!");
      } else {
        setSpareDetails(null);
        toast.error("Spare not found in this brand");
      }
    } catch (error) {
      toast.error("Error fetching spare details");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Allocate Spare
  const handleAllocate = async () => {
    if (!callNo.trim()) return toast.error("Enter Call Number");
    if (!technician.trim()) return toast.error("Select Technician");
    if (!spareDetails) return toast.error("No spare selected");

    try {
      await axios.post(`/api/allocate/${callNo}`, {
        status: "Spare Allocated",
        technician,
        spareCode: spareDetails.itemNo,
        spareName: spareDetails.itemName,
        brand,
      });
      toast.success("Spare allocated successfully!");
      setRefreshKey((p) => p + 1);
      // reset form
      setSpareDetails(null);
      setSpareCode("");
      setCallNo("");
      setTechnician("");
    } catch (error) {
      console.error("Error allocating spare:", error);
      toast.error("Failed to allocate spare!");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Request Spare Allocation
      </h1>

      {/* Select Brand */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Select Brand</label>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="">-- Select Brand --</option>
          {brands.map((b) => (
            <option key={b._id} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Enter Spare Code */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Enter Spare Code</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={spareCode}
            onChange={(e) => setSpareCode(e.target.value)}
            className="border rounded p-2 flex-1"
            placeholder="Enter spare item code"
          />
          <button
            onClick={fetchSpareDetails}
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {/* Spare Details */}
      {spareDetails && (
        <div className="bg-white border rounded-lg p-4 mb-4 shadow-sm">
          <h2 className="font-semibold text-lg mb-2 text-gray-800">
            Spare Details
          </h2>
          <p><b>Item No:</b> {spareDetails.itemNo}</p>
          <p><b>Item Name:</b> {spareDetails.itemName}</p>
          <p><b>Quantity:</b> {spareDetails.quantity}</p>
          <p><b>MRP:</b> ₹{spareDetails.mrp}</p>
          <p><b>Status:</b> {spareDetails.status || "Available"}</p>
        </div>
      )}

      {/* Call and Technician */}
      {spareDetails && (
        <>
          <div className="mb-4">
            <label className="block font-medium mb-1">Enter Call Number</label>
            <input
              type="text"
              value={callNo}
              onChange={(e) => setCallNo(e.target.value)}
              className="border rounded p-2 w-full"
              placeholder="Enter call number"
            />
          </div>

          <div className="mb-6">
            <label className="block font-medium mb-1">Select Technician</label>
            <select
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              className="border rounded p-2 w-full"
            >
              <option value="">-- Select Technician --</option>
              {technicians.map((t) => (
                <option key={t._id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAllocate}
            className="bg-green-600 text-white px-6 py-2 rounded w-full font-semibold"
          >
            Submit & Allocate
          </button>
        </>
      )}
    </div>
  );
}
