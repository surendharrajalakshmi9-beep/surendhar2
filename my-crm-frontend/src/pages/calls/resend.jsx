import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const ResendAssignedCalls = () => {
  const [brands, setBrands] = useState([]);
  const [brand, setBrand] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [technician, setTechnician] = useState("");
  const [assignedDate, setAssignedDate] = useState("");
  const [calls, setCalls] = useState([]);
  const [selectedCalls, setSelectedCalls] = useState([]);
  const [formattedText, setFormattedText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("/api/brands");
        const data = await res.json();
        setBrands(data);
      } catch {
        toast.error("Failed to fetch brands");
      }
    };
    fetchBrands();
  }, []);

  // Fetch technicians
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const res = await fetch("/api/technicians");
        const data = await res.json();
        setTechnicians(data);
      } catch {
        toast.error("Failed to fetch technicians");
      }
    };
    fetchTechnicians();
  }, []);

  // Fetch assigned calls based on filters
  const fetchCalls = async () => {
    try {
      const params = new URLSearchParams();
      if (brand) params.append("brand", brand);
      if (technician) params.append("technician", technician);
      if (assignedDate) params.append("assignedDate", assignedDate);

      const res = await fetch(
        `/api/calls/filter-assigned?${params.toString()}`
      );
      const data = await res.json();
      setCalls(data.calls || []);
      setSelectedCalls([]);
      setCurrentPage(1);
    } catch {
      toast.error("Failed to fetch assigned calls");
    }
  };

  // Update calls whenever filters change
  useEffect(() => {
    fetchCalls();
  }, [brand, technician, assignedDate]);

  // Pagination
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = calls.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(calls.length / recordsPerPage);

  // Checkbox toggle
  const handleCheckbox = (callNo) => {
    setSelectedCalls((prev) =>
      prev.includes(callNo)
        ? prev.filter((c) => c !== callNo)
        : [...prev, callNo]
    );
  };

  // Generate WhatsApp formatted text like AllocateCalls.jsx
  useEffect(() => {
    if (selectedCalls.length === 0) {
      setFormattedText("");
      return;
    }

    const selectedData = calls.filter((c) => selectedCalls.includes(c.callNo));

    const text = selectedData
      .map((call) => {
        const dateFormatted = assignedDate
          ? new Date(assignedDate).toLocaleDateString("en-IN")
          : "N/A";
        return `📞 *Call Assigned*  
---------------------------  
📌 Call No: ${call.callNo}  
👤 Customer: ${call.customerName}  
📱 Phone: ${call.phoneNo || "N/A"}  
🏠 Address: ${call.address}, ${call.pincode}  
🛠 Product: ${call.product}, ${call.model}  
⚡ Call Type: ${call.callSubtype || "-"}  
❗ Problem: ${call.natureOfComplaint || "N/A"}  
👨‍🔧 Technician: ${call.technician || "Not Assigned"}  
⏰ Complete By: ${dateFormatted}  
---------------------------`;
      })
      .join("\n\n");

    setFormattedText(text);
  }, [selectedCalls, calls, assignedDate, technician]);

  // Resend WhatsApp
  const handleResend = async () => {
    if (selectedCalls.length === 0)
      return toast.error("Select at least one call");

    try {
      const res = await fetch("/api/calls/resend-assigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callNos: selectedCalls, brand, technician }),
      });

      if (res.ok) {
        toast.success("WhatsApp resent successfully");
        setSelectedCalls([]);
        setFormattedText("");
      } else toast.error("Failed to resend WhatsApp");
    } catch {
      toast.error("Server error while resending");
    }
  };

  return (
    <div className="p-6 bg-[#f4f7fb] min-h-screen font-[Times_New_Roman] text-sm">
      <h2 className="text-xl font-semibold mb-4">Resend Assigned Calls</h2>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b._id} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          value={technician}
          onChange={(e) => setTechnician(e.target.value)}
          className="border rounded p-2"
        >
          <option value="">All Technicians</option>
          {technicians.map((t) => (
            <option key={t._id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={assignedDate}
          onChange={(e) => setAssignedDate(e.target.value)}
          className="border rounded p-2"
        />

        <button
          onClick={fetchCalls}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Filter
        </button>
      </div>

{/* Calls Table */}
<div className="border border-gray-300 rounded shadow-md overflow-auto max-h-[500px]">
  {currentRecords.length > 0 ? (
    <table className="min-w-[800px] w-full table-auto border-collapse text-sm">
      <thead className="bg-gray-200">
        <tr>
          <th className="border p-2 text-center">
            <input
              type="checkbox"
              checked={
                selectedCalls.length === currentRecords.length &&
                currentRecords.length > 0
              }
              onChange={(e) => {
                if (e.target.checked) {
                  const newSelected = currentRecords.map((call) => call.callNo);
                  setSelectedCalls((prev) => [...new Set([...prev, ...newSelected])]);
                } else {
                  const newSelected = selectedCalls.filter(
                    (c) => !currentRecords.some((call) => call.callNo === c)
                  );
                  setSelectedCalls(newSelected);
                }
              }}
            />
          </th>
          <th className="border p-2">Call No</th>
          <th className="border p-2">Customer</th>
          <th className="border p-2">Technician</th>
          <th className="border p-2">Product</th>
          <th className="border p-2">Model</th>
          <th className="border p-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {currentRecords.map((call) => (
          <tr key={call.callNo}>
            <td className="border p-2 text-center">
              <input
                type="checkbox"
                checked={selectedCalls.includes(call.callNo)}
                onChange={() => handleCheckbox(call.callNo)}
              />
            </td>
            <td className="border p-2">{call.callNo}</td>
            <td className="border p-2">{call.customerName}</td>
            <td className="border p-2">{call.technician}</td>
            <td className="border p-2">{call.product}</td>
            <td className="border p-2">{call.model}</td>
            <td className="border p-2">{call.status || "N/A"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p className="p-4">No calls found</p>
  )}
</div>


      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1 ? "bg-blue-600 text-white" : "bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* WhatsApp Message Preview */}
      {formattedText && (
        <div className="mt-6">
          <label className="block mb-2 font-semibold">
            📋 WhatsApp Message (copy, edit & paste)
          </label>
          <textarea
            value={formattedText}
            onChange={(e) => setFormattedText(e.target.value)}
            className="w-full h-60 border rounded p-3 font-mono text-sm bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can edit / cut / copy this text and then paste in WhatsApp.
          </p>
        </div>
      )}

      {/* Resend Button */}
      <button
        onClick={handleResend}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Resend WhatsApp
      </button>
    </div>
  );
};

export default ResendAssignedCalls;
