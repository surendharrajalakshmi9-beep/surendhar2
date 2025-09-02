import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function TransferCalls() {
  const [selectedTech, setSelectedTech] = useState("");
  const [newTech, setNewTech] = useState("");
  const [calls, setCalls] = useState([]);
  const [selectedCalls, setSelectedCalls] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [technicianCount, setTechnicianCount] = useState(0);

  // 🔹 Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = calls.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(calls.length / recordsPerPage);

  // 🔹 Fetch technicians from backend
  useEffect(() => {
    fetch("/api/technicians")
      .then((res) => res.json())
      .then((data) => setTechnicians(data))
      .catch((err) => console.error("Error fetching technicians:", err));
  }, []);

  // 🔹 Fetch calls for selected technician
  const fetchCalls = async () => {
    if (!selectedTech) return;
    try {
      const res = await fetch(
        `/api/calls/technician?technician=${selectedTech}`
      );
      const data = await res.json();
      setCalls(data);
      setSelectedCalls([]);
      setCurrentPage(1); // reset page when tech changes
    } catch {
      toast.error("Error fetching calls");
    }
  };

  // 🔹 Handle checkbox toggle
  const handleCheckbox = (callNo) => {
    setSelectedCalls((prev) =>
      prev.includes(callNo)
        ? prev.filter((c) => c !== callNo)
        : [...prev, callNo]
    );
  };

  // 🔹 Fetch technician's current count
  const fetchTechnicianCount = async (tech) => {
    if (!tech) {
      setTechnicianCount(0);
      return;
    }
    try {
      const res = await fetch(
        `/api/calls/technician-count/${tech}`
      );
      const data = await res.json();
      setTechnicianCount(data.count || 0);
    } catch {
      toast.error("Failed to fetch technician count");
    }
  };

  // 🔹 Transfer calls
  const handleTransfer = async () => {
    if (!newTech) return toast.error("Select new technician");
    if (selectedCalls.length === 0) return toast.error("Select calls");

    try {
      const res = await fetch("/api/calls/transfer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callNos: selectedCalls, newTechnician: newTech }),
      });

      if (res.ok) {
        toast.success("Calls transferred successfully");
        fetchCalls();
        setNewTech("");
        setSelectedCalls([]);
      } else toast.error("Failed to transfer calls");
    } catch {
      toast.error("Server error");
    }
  };

  useEffect(() => {
    fetchCalls();
  }, [selectedTech]);

  return (
    <div className="p-6 bg-[#f4f7fb] min-h-screen">
      <h2 className="text-xl font-semibold mb-4">Transfer Calls</h2>

      {/* Select Technician */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Select Technician</label>
        <select
          value={selectedTech}
          onChange={(e) => setSelectedTech(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">Select Technician</option>
          {technicians.map((t) => (
            <option key={t._id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Calls Table */}
      {calls.length > 0 ? (
        <>
          <table className="w-full border-collapse border border-gray-300 bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Select</th>
                <th className="border p-2">Call No</th>
                <th className="border p-2">Customer</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">Address</th>
                <th className="border p-2">Product</th>
                <th className="border p-2">Model</th>
                <th className="border p-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((call) => (
                <tr key={call._id}>
                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedCalls.includes(call.callNo)}
                      onChange={() => handleCheckbox(call.callNo)}
                    />
                  </td>
                  <td className="border p-2">{call.callNo}</td>
                  <td className="border p-2">{call.customerName}</td>
                  <td className="border p-2">{call.phoneNo}</td>
                  <td className="border p-2">{call.address}</td>
                  <td className="border p-2">{call.product}</td>
                  <td className="border p-2">{call.model}</td>
                  <td className="border p-2">{call.status}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-center mt-4 space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-3 py-1">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        selectedTech && <p>No calls allocated to this technician</p>
      )}

      {/* New Technician Dropdown */}
      {calls.length > 0 && (
        <div className="mt-4 space-y-4">
          <label className="block font-medium mb-1">Transfer To</label>
          <select
            value={newTech}
            onChange={(e) => {
              setNewTech(e.target.value);
              fetchTechnicianCount(e.target.value);
            }}
            className="border p-2 rounded w-full"
          >
            <option value="">Select New Technician</option>
            {technicians
              .filter((t) => t.name !== selectedTech)
              .map((t) => (
                <option key={t._id} value={t.name}>
                  {t.name}
                </option>
              ))}
          </select>
          <p>
            <span className="text-sm text-gray-600">
              Already allocated: {technicianCount} calls
            </span>
          </p>
          <button
            onClick={handleTransfer}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Transfer Selected Calls
          </button>
        </div>
      )}
    </div>
  );
}
