import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function DefectiveSubmission() {
  const [brands, setBrands] = useState([]);
  const [brand, setBrand] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [technician, setTechnician] = useState("");
  const [calls, setCalls] = useState([]);
  const [selectedCalls, setSelectedCalls] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get("/api/brands");
        setBrands(res.data);
      } catch {
        toast.error("Failed to fetch brands");
      }
    };
    fetchBrands();
  }, []);

  // ✅ Fetch technicians when brand selected
  useEffect(() => {
    const fetchTechs = async () => {
      if (!brand) return;
      try {
        const res = await axios.get(`/api/technicians?brand=${brand}`);
        setTechnicians(res.data);
      } catch {
        toast.error("Failed to fetch technicians");
      }
    };
    fetchTechs();
  }, [brand]);

  // ✅ Fetch calls when technician selected
  useEffect(() => {
    const fetchCalls = async () => {
      if (!technician) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `/api/calls/allocated?brand=${brand}&technician=${technician}`
        );
        setCalls(res.data);
      } catch {
        toast.error("Failed to fetch allocated calls");
      } finally {
        setLoading(false);
      }
    };
    fetchCalls();
  }, [technician]);

  // ✅ Checkbox toggle
  const toggleSelection = (callNo) => {
    setSelectedCalls((prev) => ({
      ...prev,
      [callNo]: !prev[callNo],
    }));
  };

  // ✅ Submit Defective Status
  const handleSubmit = async (call, status) => {
    try {
      let payload = { defectiveSubmitted: status };

      if (status === "no") {
        const amount = prompt(
          `Enter amount collected from customer for call ${call.callNo}:`
        );
        if (!amount || isNaN(amount)) {
          return toast.error("Invalid amount entered");
        }
        payload.amountReceived = Number(amount);
      }

      // Update in backend
      await axios.put(`/api/calls/defective/${call.callNo}`, payload);
      toast.success(`Updated ${call.callNo} successfully`);

      // Refresh calls
      setCalls((prev) =>
        prev.filter((c) => c.callNo !== call.callNo)
      );
    } catch (err) {
      toast.error("Error updating defective status");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Defective Submission / Completion
      </h1>

      {/* Brand Selection */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Select Brand</label>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="border rounded p-2 w-full"
        >
          <option value="">Select brand</option>
          {brands.map((b) => (
            <option key={b._id} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Technician Selection */}
      {brand && (
        <div className="mb-6">
          <label className="block font-semibold mb-1">Select Technician</label>
          <select
            value={technician}
            onChange={(e) => setTechnician(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">Select technician</option>
            {technicians.map((t) => (
              <option key={t._id} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-center text-gray-500 mt-4">Loading calls...</p>
      ) : calls.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg p-4">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Select</th>
                <th className="p-2 border">Call No</th>
                <th className="p-2 border">Customer</th>
                <th className="p-2 border">Spare Code</th>
                <th className="p-2 border">Spare Name</th>
                <th className="p-2 border">Qty</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => (
                <tr key={call.callNo} className="border-t">
                  <td className="p-2 border text-center">
                    <input
                      type="checkbox"
                      checked={!!selectedCalls[call.callNo]}
                      onChange={() => toggleSelection(call.callNo)}
                    />
                  </td>
                  <td className="p-2 border">{call.callNo}</td>
                  <td className="p-2 border">{call.customerName}</td>
                  <td className="p-2 border">{call.spareCode}</td>
                  <td className="p-2 border">{call.spareName}</td>
                  <td className="p-2 border text-center">{call.qty}</td>
                  <td className="p-2 border text-center">
                    <button
                      onClick={() => handleSubmit(call, "yes")}
                      className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleSubmit(call, "no")}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      No
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        technician && (
          <p className="text-gray-500 mt-4">No allocated calls found.</p>
        )
      )}
    </div>
  );
}
