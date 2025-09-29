import React, { useState } from "react";

function Cnupdate() {
  const [brand, setBrand] = useState("");
  const [brands, setBrands] = useState([]);
  const [records, setRecords] = useState([]);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // ✅ Fetch brands from backend
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/brands");
        const data = await res.json();
        if (res.ok) setBrands(data);
        else toast.error("Failed to fetch brands");
      } catch {
        toast.error("Server error while fetching brands");
      }
    };
    fetchBrands();
  }, []);

  
 const fetchData = async () => {
  try {
    const res = await fetch(`/api/returnspares?brand=${brand}`);
    if (!res.ok) throw new Error("Network response was not ok");
    const data = await res.json();
    setRecords(data);
  } catch (err) {
    console.error("Error fetching return spares:", err);
  }
};

  // ✅ Checkbox select/deselect
  const toggleRecord = (id) => {
    setSelectedRecords((prev) =>
      prev.includes(id) ? prev.filter((rid) => rid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedRecords(currentRecords.map((r) => r._id));
    } else {
      setSelectedRecords([]);
    }
  };

  const handleReceivedCN = async () => {
    if (selectedRecords.length === 0) {
      alert("Please select at least one record!");
      return;
    }
    try {
      await fetch("/api/returnspares/cnreceived", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedRecords }),
      });

      // Update UI after success
      setRecords((prev) =>
        prev.map((rec) =>
          selectedRecords.includes(rec._id)
            ? { ...rec, status: "CN received" }
            : rec
        )
      );
      setSelectedRecords([]);
      alert("Status updated to CN received!");
    } catch (err) {
      console.error("Error updating CN status:", err);
    }
  };

  // Pagination
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = Array.isArray(records)
    ? records.slice(indexOfFirst, indexOfLast)
    : [];

  const totalPages = Math.ceil(records.length / recordsPerPage);

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Update CN</h2>

      <div className="flex items-center gap-3 mb-4">
       
{/* Brand */}
        
          <label className="block text-sm font-medium mb-1">Select Brand</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">All</option>
            {brands.map((b) => (
              <option key={b._id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        
        <button
          onClick={fetchData}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Fetch
        </button>
      </div>

      {currentRecords.length > 0 && (
        <table className="table-auto border w-full mb-4">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                  checked={
                    currentRecords.length > 0 &&
                    selectedRecords.length === currentRecords.length
                  }
                />
              </th>
              <th>Brand</th>
              <th>Spare Code</th>
              <th>Spare Name</th>
              <th>Return Qty</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((rec) => (
              <tr key={rec._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRecords.includes(rec._id)}
                    onChange={() => toggleRecord(rec._id)}
                  />
                </td>
                <td>{rec.brand}</td>
                <td>{rec.spareCode}</td>
                <td>{rec.spareName}</td>
                <td>{rec.returnQty}</td>
                <td>{rec.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 mb-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 border ${
                currentPage === i + 1 ? "bg-gray-300" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {currentRecords.length > 0 && (
        <button
          onClick={handleReceivedCN}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Received CN
        </button>
      )}
    </div>
  );
}

export default Cnupdate;
