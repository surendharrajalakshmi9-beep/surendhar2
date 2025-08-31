import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function PendingCalls() {
  const [brand, setBrand] = useState("");
  const [pendingWith, setPendingWith] = useState("All");
  const [calls, setCalls] = useState([]);
  const [selectedCalls, setSelectedCalls] = useState([]);
  const [status, setStatus] = useState("");
  const [extraFields, setExtraFields] = useState({});
  const [pendingCount, setPendingCount] = useState(0);
 // State
const [spareCode, setSpareCode] = useState("");
const [spareName, setSpareName] = useState("");

// Fetch item name when spareCode changes
useEffect(() => {
  if (spareCode.trim() !== "") {
    fetch(`http://localhost:5000/api/items/${spareCode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setSpareName(data.item_name || ""); // auto fill from backend
          setExtraFields((prev) => ({ ...prev, spareName: data.item_name || "" }));
        }
      })
      .catch((err) => console.error("Error fetching spare name:", err));
  }
}, [spareCode]);


  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  const fetchCalls = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/calls/pending?brand=${brand || "all"}`
      );
      const data = await res.json();

      let filtered = data;
      if (pendingWith === "Pending with Technician") {
        filtered = data.filter((c) => c.status === "pending");
      } else if (pendingWith === "Spare Pending") {
        filtered = data.filter((c) => c.status === "spare pending");
      } else if (pendingWith === "Replacement") {
        filtered = data.filter((c) => c.status === "replacement done");
      } else if (pendingWith === "Appointment") {
        filtered = data.filter((c) => c.status === "appointment");
      } else if (pendingWith === "Others") {
        filtered = data.filter(
          (c) =>
            !["pending", "spare pending", "replacement done", "appointment"].includes(
              c.status
            )
        );
      }
      setCalls(filtered);
      setSelectedCalls([]);
      setCurrentPage(1);
    } catch {
      toast.error("Error fetching pending calls");
    }
  };

  const fetchPendingCount = async () => {
    try {
      const params = new URLSearchParams();
      params.append("brand", brand || "all");
      params.append("pendingWith", pendingWith);

      const res = await fetch(
        `http://localhost:5000/api/calls/pending-count?${params.toString()}`
      );
      const data = await res.json();
      setPendingCount(data.count || 0);
    } catch (error) {
      console.error("Error fetching pending count:", error);
    }
  };

  useEffect(() => {
    fetchCalls();
    fetchPendingCount();
  }, [brand, pendingWith]);

  const handleCheckbox = (callNo) => {
    setSelectedCalls((prev) =>
      prev.includes(callNo)
        ? prev.filter((c) => c !== callNo)
        : [...prev, callNo]
    );
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setExtraFields({});
  };

  const handleSubmit = async () => {
    if (!status) return toast.error("Select status");
    if (selectedCalls.length === 0) return toast.error("Select calls");

    const payload = { callNos: selectedCalls, status, extra: extraFields };

    try {
      const res = await fetch("http://localhost:5000/api/calls/updateStatus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Status updated successfully");
        fetchCalls();
        setStatus("");
        setExtraFields({});
      } else toast.error("Failed to update");
    } catch {
      toast.error("Server error");
    }
  };

  // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = calls.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(calls.length / recordsPerPage);

  return (
    <div className="p-6 bg-[#f4f7fb] min-h-screen font-[Times_New_Roman] text-sm">
      <h2 className="text-xl font-semibold mb-4">Pending Calls</h2>

      {/* Filters */}
      <div className="mb-4 flex space-x-4">
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Brands</option>
          <option value="Havells">Havells</option>
          <option value="Bajaj">Bajaj</option>
          <option value="Usha">Usha</option>
          <option value="Atomberg">Atomberg</option>
        </select>

        <select
          value={pendingWith}
          onChange={(e) => setPendingWith(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="All">All</option>
          <option value="Pending with Technician">Pending with Technician</option>
          <option value="Spare Pending">Spare Pending</option>
          <option value="Replacement">Replacement</option>
          <option value="Appointment">Appointment</option>
          <option value="Others">Others</option>
        </select>

        <button
          onClick={fetchCalls}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Refresh
        </button>
      </div>

      <p className="mb-4 font-semibold">
        Pending Calls: <span className="text-red-600">{pendingCount}</span>
      </p>

      {/* Table with scroll */}
      <div className="overflow-y-auto max-h-64 border border-gray-300 rounded">
        {currentRecords.length > 0 ? (
         <div className="max-h-[500px] overflow-auto border rounded-md shadow-md">
  <div className="min-w-full overflow-x-auto">
    <table className="table-auto border-collapse border border-gray-300 text-sm min-w-[1200px]">
      <thead className="bg-gray-200 sticky top-0 z-10">
        <tr>
          <th className="border p-2">Select</th>
          <th className="border p-2">Call No</th>
          <th className="border p-2">Brand</th>
          <th className="border p-2">Customer</th>
          <th className="border p-2">Phone</th>
          <th className="border p-2 min-w-[250px]">Address</th>
          <th className="border p-2">Pincode</th>
          <th className="border p-2">Type</th>
          <th className="border p-2">Product</th>
          <th className="border p-2">Model</th>
          <th className="border p-2">Technician</th>
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
            <td className="border p-2">{call.brand}</td>
            <td className="border p-2">{call.customerName}</td>
            <td className="border p-2">{call.phoneNo}</td>
            <td className="border p-2 min-w-[250px]">{call.address}</td>
            <td className="border p-2">{call.pincode}</td>
            <td className="border p-2">{call.type}</td>
            <td className="border p-2">{call.product}</td>
            <td className="border p-2">{call.model}</td>
            <td className="border p-2">{call.technician || "-"}</td>
            <td className="border p-2">{call.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

        ) : (
          <p className="p-4">No pending calls found</p>
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
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* Status Update Section */}
      <div className="mt-4 space-y-4">
        <div>
          <label className="block font-medium mb-1">Update Status</label>
          <select
            value={status}
            onChange={handleStatusChange}
            className="border p-2 rounded w-full"
          >
            <option value="">Select Status</option>
            <option value="completed">Completed</option>
            <option value="spare pending">Spare Pending</option>
            <option value="spare allocated">Spare Allocated</option>
            <option value="replacement done">Replacement Done</option>
            <option value="appointment">Appointment</option>
            <option value="escalation">Escalation</option>
            <option value="cancel">Cancel</option>
          </select>
        </div>

        {status === "completed" && (
          <input
            type="datetime-local"
            className="border p-2 rounded w-full"
            onChange={(e) =>
              setExtraFields({ ...extraFields, completionDate: e.target.value })
            }
          />
        )}
        {status === "appointment" && (
          <input
            type="datetime-local"
            className="border p-2 rounded w-full"
            onChange={(e) =>
              setExtraFields({ appointmentDate: e.target.value })
            }
          />
        )}
        {(status === "escalation" || status === "cancel") && (
          <textarea
            placeholder="Enter reason"
            className="border p-2 rounded w-full"
            onChange={(e) => setExtraFields({ reason: e.target.value })}
          />
        )}
       {status === "spare pending" && (
  <div className="space-y-2">
    <input
      type="text"
      placeholder="Spare Code"
      className="border p-2 rounded w-full"
      value={spareCode}
      onChange={(e) => {
        setSpareCode(e.target.value);
        setExtraFields({ ...extraFields, spareCode: e.target.value });
      }}
    />
    <input
      type="text"
      placeholder="Spare Name"
      className="border p-2 rounded w-full bg-gray-100"
      value={spareName}
      readOnly
    />
    <input
      type="number"
      placeholder="Quantity"
      className="border p-2 rounded w-full"
      onChange={(e) =>
        setExtraFields({ ...extraFields, qty: e.target.value })
      }
    />
  </div>
)}

       
        {(status === "spare allocated" || status === "replacement done") && (
          <>
            <select
              className="border p-2 rounded w-full"
              onChange={(e) =>
                setExtraFields({
                  ...extraFields,
                  defectiveSubmitted: e.target.value,
                })
              }
            >
              <option value="">Defective Returned?</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>

            {extraFields.defectiveSubmitted === "yes" && (
              <input
                type="datetime-local"
                className="border p-2 rounded w-full"
                onChange={(e) =>
                  setExtraFields({
                    ...extraFields,
                    completionDate: e.target.value,
                  })
                }
              />
            )}
            {extraFields.defectiveSubmitted === "no" && (
              <input
                type="number"
                placeholder="Amount Received from Customer"
                className="border p-2 rounded w-full"
                onChange={(e) =>
                  setExtraFields({
                    ...extraFields,
                    amountReceived: e.target.value,
                  })
                }
              />
            )}
          </>
        )}

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Update Selected Calls
        </button>
      </div>
    </div>
  );
}
