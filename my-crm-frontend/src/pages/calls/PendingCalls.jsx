import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function PendingCalls() {
  const [brands, setBrands] = useState([]);
  const [brand, setBrand] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [technician, setTechnician] = useState("");
  const [pendingWith, setPendingWith] = useState("All");
  const [calls, setCalls] = useState([]);
  const [selectedCalls, setSelectedCalls] = useState([]);
  const [status, setStatus] = useState("");
  const [extraFields, setExtraFields] = useState({});
  const [pendingCount, setPendingCount] = useState(0);

  const [spareCode, setSpareCode] = useState("");
  const [spareName, setSpareName] = useState("");
  const [transferTech, setTransferTech] = useState(""); // selected technician for transfer


  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
  const [formattedText, setFormattedText] = useState("");
  const [whatsAppPage, setWhatsAppPage] = useState(1);
  const [totalWhatsAppPages, setTotalWhatsAppPages] = useState(0);


  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("/api/brands");
        const data = await res.json();
        if (res.ok) setBrands(data);
        else toast.error("Failed to fetch brands");
      } catch {
        toast.error("Server error while fetching brands");
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
        if (res.ok) setTechnicians(data);
        else toast.error("Failed to fetch technicians");
      } catch {
        toast.error("Server error while fetching technicians");
      }
    };
    fetchTechnicians();
  }, []);

  // Fetch spare name
  useEffect(() => {
    if (spareCode.trim() !== "") {
      fetch(`/api/items/${spareCode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setSpareName(data.item_name || "");
            setExtraFields((prev) => ({
              ...prev,
              spareName: data.item_name || "",
            }));
          }
        })
        .catch((err) => console.error("Error fetching spare name:", err));
    }
  }, [spareCode]);

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setExtraFields({});
  };

  const handleCheckbox = (callNo) => {
    setSelectedCalls((prev) =>
      prev.includes(callNo)
        ? prev.filter((c) => c !== callNo)
        : [...prev, callNo]
    );
  };

  // ✅ Generate WhatsApp formatted text (one call per page)
  useEffect(() => {
    if (selectedCalls.length === 0) {
      setFormattedText("");
      setTotalWhatsAppPages(0);
      return;
    }

    const selectedData = calls.filter((c) =>
      selectedCalls.includes(c.callNo)
    );

    if (selectedData.length === 0) return;

    const totalPages = selectedData.length;
    setTotalWhatsAppPages(totalPages);

    // Make sure page is valid
    if (whatsAppPage > totalPages) setWhatsAppPage(1);

    const currentCall = selectedData[whatsAppPage - 1] || selectedData[0];

    const text = `📞 *Pending Call Details*  
---------------------------  
📌 Call No: ${currentCall.callNo}  
🏷 Brand: ${currentCall.brand || "-"}  
👤 Customer: ${currentCall.customerName || "-"}  
📱 Phone: ${currentCall.phoneNo || "N/A"}  
🏠 Address: ${currentCall.address || "-"}, ${currentCall.pincode || ""}  
🛠 Product: ${currentCall.product || "-"} (${currentCall.model || "-"})  
⚡ Call Type: ${currentCall.type || "-"}  
❗ Problem: ${currentCall.natureOfComplaint || "N/A"}  
👨‍🔧 Technician: ${currentCall.technician || "Not Assigned"}  
📅 Status: ${currentCall.status || "N/A"}  
---------------------------`;

    setFormattedText(text);
  }, [selectedCalls, calls, whatsAppPage]);

  
  const handleSubmit = async () => {
    if (!status) return toast.error("Select status");
    if (selectedCalls.length === 0) return toast.error("Select calls");

    const payload = { callNos: selectedCalls, status, extra: extraFields };

    try {
      const res = await fetch("/api/calls/updateStatus", {
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

  // Fetch pending calls
  const fetchCalls = async () => {
    try {
      const params = new URLSearchParams();
      if (brand) params.append("brand", brand);
      if (technician) params.append("technician", technician);
      params.append("pendingWith", pendingWith);

      const res = await fetch(`/api/calls/pending?${params.toString()}`);
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
      if (brand) params.append("brand", brand);
      if (technician) params.append("technician", technician);
      params.append("pendingWith", pendingWith);

      const res = await fetch(`/api/calls/pending-count?${params.toString()}`);
      const data = await res.json();
      setPendingCount(data.count || 0);
    } catch (error) {
      console.error("Error fetching pending count:", error);
    }
  };

  useEffect(() => {
    fetchCalls();
    fetchPendingCount();
  }, [brand, technician, pendingWith]);

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

        {/* Brand */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Brand</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">All</option>
            {brands.map((b) => (
              <option key={b._id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Technician */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Technician</label>
          <select
            value={technician}
            onChange={(e) => setTechnician(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">All Technicians</option>
            {technicians.map((t) => (
              <option key={t._id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Pending With */}
        <div>
          <label className="block text-sm font-medium mb-1">Pending With</label>
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
        </div>

        <button
          onClick={fetchCalls}
          className="bg-blue-600 text-white px-4 py-2 rounded self-end"
        >
          Refresh
        </button>
      </div>

      <p className="mb-4 font-semibold">
        Pending Calls: <span className="text-red-600">{pendingCount}</span>
      </p>

      {/* Table */}
      <div className="overflow-y-auto max-h-64 border border-gray-300 rounded">
        {currentRecords.length > 0 ? (
          <div className="max-h-[500px] overflow-auto border rounded-md shadow-md">
            <div className="min-w-full overflow-x-auto">
              <table className="table-auto border-collapse border border-gray-300 text-sm min-w-[1200px]">
                
                    <thead className="bg-gray-200 sticky top-0 z-10">
  <tr>
    <th className="border p-2 text-center">
      <input
        type="checkbox"
        checked={
          currentRecords.length > 0 &&
          selectedCalls.length === currentRecords.length
        }
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedCalls(currentRecords.map((c) => c.callNo));
          } else {
            setSelectedCalls([]);
          }
        }}
      />
    </th>
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

{/* ✅ Transfer to Technician Section */}
{selectedCalls.length > 0 && (
  <div className="mt-4 border-t pt-4">
    <h3 className="font-semibold mb-2">Transfer Selected Calls</h3>
    <div className="flex space-x-2">
      <select
        value={transferTech}
        onChange={(e) => setTransferTech(e.target.value)}
        className="border p-2 rounded w-64"
      >
        <option value="">Select Technician</option>
        {technicians.map((t) => (
          <option key={t._id} value={t.name}>
            {t.name}
          </option>
        ))}
      </select>

      <button
        onClick={async () => {
          if (!transferTech) return toast.error("Select a technician");
          if (selectedCalls.length === 0)
            return toast.error("Select at least one call");

          try {
            const res = await fetch("/api/calls/transfer", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                callNos: selectedCalls,
                newTechnician: transferTech,
              }),
            });

            if (res.ok) {
              toast.success("Calls transferred successfully");
              fetchCalls();
              setSelectedCalls([]);
              setTransferTech("");
            } else {
              toast.error("Failed to transfer calls");
            }
          } catch (err) {
            toast.error("Server error during transfer");
          }
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Transfer To
      </button>
    </div>
  </div>
)}

            
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

      {/* ✅ WhatsApp Preview Section */}
      {formattedText && (
        <div className="mt-8">
          <label className="block mb-2 font-semibold">
            📋 WhatsApp Message Preview ({whatsAppPage}/{totalWhatsAppPages})
          </label>

          <textarea
            value={formattedText}
            onChange={(e) => setFormattedText(e.target.value)}
            className="w-full h-60 border rounded p-3 font-mono text-sm bg-gray-50"
          />

          {/* WhatsApp Pagination */}
          {totalWhatsAppPages > 1 && (
            <div className="flex justify-center items-center mt-3 space-x-2">
              <button
                onClick={() => setWhatsAppPage((p) => Math.max(1, p - 1))}
                disabled={whatsAppPage === 1}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Prev
              </button>

              <span className="text-sm">
                Page {whatsAppPage} of {totalWhatsAppPages}
              </span>

              <button
                onClick={() =>
                  setWhatsAppPage((p) => Math.min(totalWhatsAppPages, p + 1))
                }
                disabled={whatsAppPage === totalWhatsAppPages}
                className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2 text-center">
            You can copy or edit this text and send via WhatsApp manually.
          </p>
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
  <div className="space-y-3">
    {/* ✅ Completion Date */}
    <div>
      <label className="block font-medium mb-1">Completion Date & Time</label>
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
    </div>

    {/* ✅ Warranty Status */}
    <div>
      <label className="block font-medium mb-1">Warranty Status</label>
      <select
        className="border p-2 rounded w-full"
        onChange={(e) =>
          setExtraFields({
            ...extraFields,
            warrantyStatus: e.target.value,
          })
        }
      >
        <option value="">Select Warranty Type</option>
        <option value="Warranty">Warranty</option>
        <option value="Out of Warranty">Out of Warranty</option>
      </select>
    </div>

    {/* ✅ Price Collected (only if Out of Warranty) */}
    {extraFields.warrantyStatus === "Out of Warranty" && (
      <div>
        <label className="block font-medium mb-1">
          Price Collected from Customer (₹)
        </label>
        <input
          type="number"
          className="border p-2 rounded w-full"
          placeholder="Enter amount"
          onChange={(e) =>
            setExtraFields({
              ...extraFields,
              owamtReceived: e.target.value,
            })
          }
        />
      </div>
    )}
  </div>
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
                  setExtraFields({ ...extraFields, amountReceived: e.target.value })
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
