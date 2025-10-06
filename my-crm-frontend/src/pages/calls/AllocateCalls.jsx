import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AllocatedCalls() {
  const [brands, setBrands] = useState([]);
  const [brand, setBrand] = useState("all");
  const [products, setProducts] = useState([]);
  const [pincodes, setPincodes] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectedPincodes, setSelectedPincodes] = useState([]);
  const [calls, setCalls] = useState([]);
  const [selectedCalls, setSelectedCalls] = useState([]);
  const [technician, setTechnician] = useState("");
  const [assignedDate, setAssignedDate] = useState("");
  const [editData, setEditData] = useState(null);
  const [technicians, setTechnicians] = useState([]);

  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showPincodeDropdown, setShowPincodeDropdown] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
// inside your component
 const [formattedText, setFormattedText] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [callCount, setCallCount] = useState(0);
  const [technicianCount, setTechnicianCount] = useState(0);
const [whatsAppPage, setWhatsAppPage] = useState(1);


  // ✅ Fetch brands from backend
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


  useEffect(() => {
    fetch("/api/technicians")  // adjust URL based on your backend setup
      .then((res) => res.json())
      .then((data) => setTechnicians(data))
      .catch((err) => console.error("Error fetching technicians:", err));
  }, []);
  const fetchFilters = async (brandName) => {
    try {
      const res = await fetch(
        `/api/calls/filters?brand=${brandName}`
      );
      const data = await res.json();
      setProducts(data.products || []);
      setPincodes(data.pincodes || []);
    } catch {
      toast.error("Failed to load filters");
    }
  };


 const fetchCalls = async () => {
  try {
    const params = new URLSearchParams();
    if (brand) params.append("brand", brand);
    if (selectedProducts.length > 0)
      params.append("products", selectedProducts.join(","));
    if (selectedPincodes.length > 0)
      params.append("pincodes", selectedPincodes.join(","));
    params.append("status", ""); // only unassigned calls

    const res = await fetch(`/api/calls/filter?${params.toString()}`);
    const data = await res.json();
    setCalls(data.calls || []);
    setTotalCount(data.count || 0);
    setSelectedCalls([]);
    setCurrentPage(1);
  } catch {
    toast.error("Error fetching calls");
  }
};




const fetchCallCount = async () => {
  try {
    const params = new URLSearchParams();
    params.append("brand", brand);
    if (selectedProducts.length > 0)
      params.append("products", selectedProducts.join(","));
    if (selectedPincodes.length > 0)
      params.append("pincodes", selectedPincodes.join(","));

    const res = await fetch(
      `/api/calls/filter-count?${params.toString()}`
    );
    const data = await res.json();
    setCallCount(data.count || 0);
  } catch (error) {
    console.error("Error fetching call count", error);
  }
};

useEffect(() => {
  fetchCallCount();
}, [brand, selectedProducts, selectedPincodes]);


  const toggleProduct = (p) =>
    setSelectedProducts((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );

  const togglePincode = (p) =>
    setSelectedPincodes((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );

  const handleCheckboxChange = (callNo) => {
    setSelectedCalls((prev) =>
      prev.includes(callNo)
        ? prev.filter((c) => c !== callNo)
        : [...prev, callNo]
    );
    setWhatsAppPage(1); // reset to first WhatsApp page
  };

  const handleAssign = async () => {
    if (!technician) return toast.error("Please select technician");
    if (!assignedDate) return toast.error("Please select assigned date");
    if (selectedCalls.length === 0)
      return toast.error("Select at least one call");

    try {
      const res = await fetch("/api/calls/assign", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callNos: selectedCalls,
          technician,
          assignedDate,
          brand,
        }),
      });
      if (res.ok) {
        toast.success("Technician assigned successfully");
        fetchCalls();
        setTechnician("");
        setAssignedDate("");
      } else toast.error("Failed to assign technician");
    } catch {
      toast.error("Server error");
    }
  };


const fetchTechnicianCount = async (tech) => {
  if (!tech) {
    setTechnicianCount(0);
    return;
  }
  try {
    const res = await fetch(`/api/calls/technician-count/${tech}`);
    const data = await res.json();
    setTechnicianCount(data.count || 0);
  } catch {
    toast.error("Failed to fetch technician count");
  }
};
 const handleCheckbox = (callNo) => {
    setSelectedCalls((prev) =>
      prev.includes(callNo)
        ? prev.filter((c) => c !== callNo)
        : [...prev, callNo]
    );
  };

  const handleDelete = async (callNo) => {
    if (!window.confirm("Delete this call?")) return;
    try {
      const res = await fetch(`/api/calls/${callNo}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Call deleted");
        fetchCalls();
      } else toast.error("Failed to delete");
    } catch {
      toast.error("Server error");
    }
  };

  const handleEditSave = async () => {
    try {
      const res = await fetch(
        `/api/calls/${editData.callNo}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editData),
        }
      );
      if (res.ok) {
        toast.success("Call updated successfully");
        setEditData(null);
        fetchCalls();
      } else toast.error("Failed to update call");
    } catch {
      toast.error("Server error");
    }
  };

  useEffect(() => {
    fetchFilters(brand);
  }, [brand]);

  useEffect(() => {
    fetchCalls();
  }, [brand, selectedProducts, selectedPincodes]);



// ✅ Generate WhatsApp formatted text
  useEffect(() => {
    if (selectedCalls.length === 0) {
      setFormattedText("");
      return;
    }

    const selectedData = calls.filter((c) =>
      selectedCalls.includes(c.callNo)
    );

   if (selectedData.length === 0) return;

    const currentCall = selectedData[whatsAppPage - 1] || selectedData[0];

    const tatFormatted = assignedDate
      ? new Date(assignedDate).toLocaleDateString("en-IN")
      : "N/A";

    const text = `📞 *New Call Assigned*  
---------------------------  
📌 Call No: ${currentCall.callNo}  
👤 Customer: ${currentCall.customerName}  
📱 Phone: ${currentCall.phoneNo || "N/A"}  
🏠 Address: ${currentCall.address}, ${currentCall.pincode}  
🛠 Product: ${currentCall.product}, ${currentCall.model}  
⚡ Call Type: ${currentCall.callSubtype || "-"}  
❗ Problem: ${currentCall.natureOfComplaint || "N/A"}  
👨‍🔧 Technician: ${technician || "Not Assigned"}  

---------------------------`;

    setFormattedText(text);
  }, [selectedCalls, calls, assignedDate, technician, whatsAppPage]);

  
   // Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = calls.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(calls.length / recordsPerPage);
  const totalWhatsAppPages = selectedCalls.length;
  return (
    <div className="p-6 bg-[#f4f7fb] min-h-screen font-[Times_New_Roman] text-sm">
      <h2 className="text-xl font-semibold mb-4">Allocate Calls</h2>

      {/* Filters */}
      <div className="flex items-start space-x-4 mb-4">
    {/* Brand */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Brand</label>
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


        {/* Product Dropdown */}
        <div className="relative">
          <label className="block text-sm font-medium mb-1">Product</label>
          <button
            onClick={() => setShowProductDropdown(!showProductDropdown)}
            className="border rounded p-2 w-40 text-left bg-white"
          >
            {selectedProducts.length > 0
              ? `${selectedProducts.length} selected`
              : "Select Product"}
          </button>
          {showProductDropdown && (
            <div className="absolute z-10 bg-white border p-2 rounded shadow w-40 max-h-40 overflow-y-auto">
              {products.map((p) => (
                <label key={p} className="block">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(p)}
                    onChange={() => toggleProduct(p)}
                    className="mr-2"
                  />
                  {p}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Pincode Dropdown */}
        <div className="relative">
          <label className="block text-sm font-medium mb-1">Pincode</label>
          <button
            onClick={() => setShowPincodeDropdown(!showPincodeDropdown)}
            className="border rounded p-2 w-40 text-left bg-white"
          >
            {selectedPincodes.length > 0
              ? `${selectedPincodes.length} selected`
              : "Select Pincode"}
          </button>
          {showPincodeDropdown && (
            <div className="absolute z-10 bg-white border p-2 rounded shadow w-40 max-h-40 overflow-y-auto">
              {pincodes.map((p) => (
                <label key={p} className="block">
                  <input
                    type="checkbox"
                    checked={selectedPincodes.includes(p)}
                    onChange={() => togglePincode(p)}
                    className="mr-2"
                  />
                  {p}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
      <p className="mb-4 font-semibold">
  Total Calls: <span className="text-blue-600">{callCount}</span>
</p>


{/* Calls Table */}
{/* Scrollable table wrapper */}
<div className="border border-gray-300 rounded shadow-md overflow-auto max-h-[500px]">
  {currentRecords.length > 0 ? (
    <table className="min-w-[1200px] w-full table-auto border-collapse text-sm">
      <thead className="bg-gray-200">
        <tr>
          <th className="border p-2">Select</th>
          <th className="border p-2">Call No</th>
          <th className="border p-2">Customer</th>
          <th className="border p-2">Phone</th>
          <th className="border p-2 min-w-[200px]">Address</th>
          <th className="border p-2">Pincode</th>
          <th className="border p-2">Type</th>
          <th className="border p-2">Product</th>
          <th className="border p-2">Model</th>
          <th className="border p-2">Caller Type</th>
          <th className="border p-2">Call Subtype</th>
          <th className="border p-2">Nature of Complaint</th>
          <th className="border p-2">Action</th>
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
            <td className="border p-2 break-words">{call.callNo}</td>
            <td className="border p-2 break-words">{call.customerName}</td>
            <td className="border p-2 break-words">{call.phoneNo}</td>
            <td className="border p-2 break-words">{call.address}</td>
            <td className="border p-2 break-words">{call.pincode}</td>
            <td className="border p-2 break-words">{call.type}</td>
            <td className="border p-2 break-words">{call.product}</td>
            <td className="border p-2 break-words">{call.model}</td>
            <td className="border p-2 break-words">{call.callerType || "-"}</td>
            <td className="border p-2 break-words">{call.callSubtype || "-"}</td>
            <td className="border p-2 break-words">{call.natureOfComplaint || "-"}</td>
            <td className="border p-2">
              <div className="flex gap-1">
                <button
                  className="bg-yellow-400 px-2 py-1 rounded text-sm"
                  onClick={() => setEditData({ ...call })}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                  onClick={() => handleDelete(call.callNo)}
                >
                  Delete
                </button>
              </div>
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


      {/* Technician Assign */}
      {calls.length > 0 && (
        <div className="flex items-center space-x-4 mt-4">
         <select
  value={technician}
  onChange={(e) => {
    setTechnician(e.target.value);
    fetchTechnicianCount(e.target.value);
  }}
  className="border rounded p-2"
>
  <option value="">Select Technician</option>
      {technicians.map((t) => (
        <option key={t._id} value={t.name}>
          {t.name}
        </option>
      ))}
    </select>
{technician && (
  <span className="text-sm text-gray-600">
    Already allocated: {technicianCount} calls
  </span>
)}


          <input
            type="date"
            value={assignedDate}
            onChange={(e) => setAssignedDate(e.target.value)}
            className="border p-2 rounded"
          />
          <button
            onClick={handleAssign}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Assign Technician
          </button>
        </div>
      )}

{/* ✅ WhatsApp Message Preview (One Call Per Page) */}
      {formattedText && (
        <div className="mt-6">
          <label className="block mb-2 font-semibold">
            📋 WhatsApp Message ({whatsAppPage}/{totalWhatsAppPages})
          </label>

          <textarea
            value={formattedText}
            onChange={(e) => setFormattedText(e.target.value)}
            className="w-full h-60 border rounded p-3 font-mono text-sm bg-gray-50"
          />

          {/* WhatsApp pagination */}
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
                  setWhatsAppPage((p) =>
                    Math.min(totalWhatsAppPages, p + 1)
                  )
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
    </div>
  );
}

  
      {/* Edit Modal */}
      {editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-1/3 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Call</h3>

            <input
              type="text"
              value={editData.customerName}
              onChange={(e) =>
                setEditData({ ...editData, customerName: e.target.value })
              }
              className="border p-2 mb-2 w-full"
              placeholder="Customer Name"
            />
            <input
              type="text"
              value={editData.phoneNo}
              onChange={(e) =>
                setEditData({ ...editData, phoneNo: e.target.value })
              }
              className="border p-2 mb-2 w-full"
              placeholder="Phone No"
            />
            <textarea
              value={editData.address}
              onChange={(e) =>
                setEditData({ ...editData, address: e.target.value })
              }
              className="border p-2 mb-2 w-full"
              placeholder="Address"
            />
            <input
              type="text"
              value={editData.pincode}
              onChange={(e) =>
                setEditData({ ...editData, pincode: e.target.value })
              }
              className="border p-2 mb-2 w-full"
              placeholder="Pincode"
            />
            <select
              value={editData.type}
              onChange={(e) =>
                setEditData({ ...editData, type: e.target.value })
              }
              className="border p-2 mb-2 w-full"
            >
              <option value="Warranty">Warranty</option>
              <option value="Out of Warranty">Out of Warranty</option>
            </select>
            <input
              type="text"
              value={editData.product}
              onChange={(e) =>
                setEditData({ ...editData, product: e.target.value })
              }
              className="border p-2 mb-2 w-full"
              placeholder="Product"
            />
            <input
              type="text"
              value={editData.model}
              onChange={(e) =>
                setEditData({ ...editData, model: e.target.value })
              }
              className="border p-2 mb-2 w-full"
              placeholder="Model"
            />

            <select
  value={editData.callerType || ""}
  onChange={(e) =>
    setEditData({ ...editData, callerType: e.target.value })
  }
  className="border p-2 mb-2 w-full"
>
  <option value="">Select Caller Type</option>
  <option value="Customer">Customer</option>
  <option value="Dealer">Dealer</option>
  <option value="E-Commerce">E-Commerce</option>
  <option value="Email">Email</option>
</select>

<select
  value={editData.callSubtype || ""}
  onChange={(e) =>
    setEditData({ ...editData, callSubtype: e.target.value })
  }
  className="border p-2 mb-4 w-full"
>
  <option value="">Select Call Subtype</option>
  <option value="Breakdown">Breakdown</option>
  <option value="Installation">Installation</option>
  <option value="Demo">Demo</option>
  <option value="Dealer Stock Repair">Dealer Stock Repair</option>
</select>

<textarea
  value={editData.natureOfComplaint || ""}
  onChange={(e) =>
    setEditData({ ...editData, natureOfComplaint: e.target.value })
  }
  className="border p-2 mb-2 w-full"
  placeholder="Nature of Complaint"
/>

            <button
              onClick={handleEditSave}
              className="bg-green-500 text-white px-4 py-2 rounded mr-2"
            >
              Save
            </button>
            <button
              onClick={() => setEditData(null)}
              className="bg-gray-400 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
