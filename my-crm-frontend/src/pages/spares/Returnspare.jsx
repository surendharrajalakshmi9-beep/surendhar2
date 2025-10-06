import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const Returnspare = () => {
  const [brand, setBrand] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [mslStatus, setMslStatus] = useState("");
  const [spares, setSpares] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [editQty, setEditQty] = useState({});
  const [editReturnType, setEditReturnType] = useState({});
  const recordsPerPage = 5;
  const totalPages = Math.ceil(spares.length / recordsPerPage);

  // 🔹 Fetch all brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("/api/brands");
        const data = await res.json();
        setBrands(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Failed to fetch brands", err);
      }
    };
    fetchBrands();
  }, []);

  // 🔹 Load spares from Spare collection
  const fetchSpares = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/spares/return", {
        params: { brand, fromDate, toDate, mslStatus },
      });
      const sparesData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
        ? res.data.data
        : [];
      setSpares(sparesData);
      setSelected([]);
      setEditQty({});
      setEditReturnType({});
    } catch (error) {
      console.error("Error fetching spares:", error);
      setSpares([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageSpares = spares.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
      );
      setSelected(pageSpares.map((s) => s._id));
    } else {
      setSelected([]);
    }
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleQtyChange = (id, value, maxQty) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) return setEditQty((prev) => ({ ...prev, [id]: "" }));
    if (num > maxQty) {
      alert("Quantity cannot exceed available stock");
      return;
    }
    setEditQty((prev) => ({ ...prev, [id]: num }));
  };

  const handleReturnTypeChange = (id, value) => {
    setEditReturnType((prev) => ({ ...prev, [id]: value }));
  };

  // 🔹 Handle Approve / Reject in batch
  const handleApproveReject = async (approved) => {
    if (selected.length === 0) {
      alert("Please select at least one spare.");
      return;
    }

    const selectedSpares = spares.filter((s) => selected.includes(s._id));

    try {
      if (approved) {
        // Create ReturnSpare documents (aligned with returnSpareSchema)
        const payload = selectedSpares.map((s) => ({
          spareCode: s.itemNo,
          spareName: s.itemName,
          brand: s.brand,
          returnQty: editQty[s._id] || s.quantity,
          mslType: s.mslType,
          spareDate: s.datespare,
          returnType: editReturnType[s._id] || "good",
        }));

        await axios.post("/api/returnspares", { data: payload });

        alert("Selected spares returned successfully.");
        exportExcel(payload);

        // Optionally remove returned spares from Spare stock
        setSpares((prev) => prev.filter((s) => !selected.includes(s._id)));
      } else {
        alert("Selected spares rejected.");
      }

      setSelected([]);
      setEditQty({});
      setEditReturnType({});
    } catch (error) {
      console.error("Error processing return:", error);
      alert("Operation failed.");
    }
  };

  const exportExcel = (data) => {
    const formatted = data.map((s) => ({
      "Spare Code": s.spareCode,
      "Spare Name": s.spareName,
      Brand: s.brand,
      "Return Qty": s.returnQty,
      "Return Type": s.returnType,
      "MSL Type": s.mslType,
      "Spare Date": s.spareDate ? new Date(s.spareDate).toLocaleDateString() : "",
    }));

    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ReturnedSpares");
    XLSX.writeFile(
      wb,
      `ReturnedSpares_${brand || "All"}_${new Date().toISOString()}.xlsx`
    );
  };

  const pageSpares = spares.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Return Spares</h2>

      {/* Filters */}
      <div className="grid grid-cols-6 gap-4 mb-4">
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className="border rounded p-2 w-full">
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b._id} value={b.name}>{b.name}</option>
          ))}
        </select>

        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border p-2 rounded" />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border p-2 rounded" />
        <select value={mslStatus} onChange={(e) => setMslStatus(e.target.value)} className="border p-2 rounded">
          <option value="">MSL / Non-MSL</option>
          <option value="Msl">MSL</option>
          <option value="Non-Msl">Non-MSL</option>
        </select>

        <button onClick={fetchSpares} className="bg-blue-500 text-white px-4 py-2 rounded">
          Load
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : spares.length > 0 ? (
        <>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2 text-center">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      selected.length ===
                      pageSpares.filter((s) => s._id).length &&
                      selected.length > 0
                    }
                  />
                </th>
                <th className="border p-2">Brand</th>
                <th className="border p-2">Spare Code</th>
                <th className="border p-2">Spare Name</th>
                <th className="border p-2">Available Qty</th>
                <th className="border p-2">Return Qty</th>
                <th className="border p-2">Return Type</th>
                <th className="border p-2">Spare Date</th>
                <th className="border p-2">MSL Type</th>
              </tr>
            </thead>
            <tbody>
              {pageSpares.map((s) => (
                <tr key={s._id}>
                  <td className="border p-2 text-center">
                    <input
                      type="checkbox"
                      checked={selected.includes(s._id)}
                      onChange={() => handleSelect(s._id)}
                    />
                  </td>
                  <td className="border p-2">{s.brand}</td>
                  <td className="border p-2">{s.itemNo}</td>
                  <td className="border p-2">{s.itemName}</td>
                  <td className="border p-2 text-center">{s.quantity}</td>
                  <td className="border p-2 text-center">
                    <input
                      type="number"
                      min="1"
                      max={s.quantity}
                      value={editQty[s._id] || ""}
                      onChange={(e) =>
                        handleQtyChange(s._id, e.target.value, s.quantity)
                      }
                      className="border p-1 rounded w-20 text-center"
                    />
                  </td>
                  <td className="border p-2 text-center">
                    <select
                      value={editReturnType[s._id] || "good"}
                      onChange={(e) =>
                        handleReturnTypeChange(s._id, e.target.value)
                      }
                      className="border rounded p-1"
                    >
                      <option value="good">Good</option>
                      <option value="defective">Defective</option>
                    </select>
                  </td>
                  <td className="border p-2">
                    {s.datespare ? new Date(s.datespare).toLocaleDateString() : "-"}
                  </td>
                  <td className="border p-2 text-center">{s.mslType}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded"
            >
              Prev
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded"
            >
              Next
            </button>
          </div>

          {/* Approve / Reject Buttons */}
          <div className="mt-4 flex space-x-4">
            <button
              onClick={() => handleApproveReject(true)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Approve & Return
            </button>
            <button
              onClick={() => handleApproveReject(false)}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Reject
            </button>
          </div>
        </>
      ) : (
        <p>No records found</p>
      )}
    </div>
  );
};

export default Returnspare;
