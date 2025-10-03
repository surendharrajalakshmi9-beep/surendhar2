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
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("/api/brands");
        const data = await res.json();
        setBrands(data);
      } catch (err) {
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

  // Fetch calls whenever filters change
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

  // Resend WhatsApp
  const handleResend = async () => {
    if (selectedCalls.length === 0) return toast.error("Select at least one call");

    try {
      const res = await fetch("/api/calls/resend-assigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callNos: selectedCalls, brand, technician }),
      });

      if (res.ok) {
        toast.success("WhatsApp resent successfully");
        setSelectedCalls([]);
      } else toast.error("Failed to resend WhatsApp");
    } catch {
      toast.error("Server error while resending");
    }
  };

  return (
    <div className="p-6 bg-[#f4f7fb] min-h-screen">
      <h2 className="text-xl font-semibold mb-4">Resend Assigned Calls</h2>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        {/* Brand */}
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

        {/* Technician */}
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

        {/* Assigned Date */}
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
          <th className="border p-2">Select</th>
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
           <td className="border p-2">
  <span
    className={`px-2 py-1 rounded text-xs font-semibold
      ${
        call.status === "Pending with Technician"
          ? "bg-yellow-200 text-yellow-800"
          : call.status === "Spare Pending"
          ? "bg-orange-200 text-orange-800"
          : call.status === "Replacement"
          ? "bg-red-200 text-red-800"
          : call.status === "Appointment"
          ? "bg-blue-200 text-blue-800"
          : call.status === "Others"
          ? "bg-purple-200 text-purple-800"
          : "bg-gray-200 text-gray-800"
      }`}
  >
    {call.status || "N/A"}
  </span>
</td>
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




