import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const Returnspare = () => {
  const [brand, setBrand] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [mslStatus, setMslStatus] = useState("");
  const [condition, setCondition] = useState("");
  const [spares, setSpares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [editQty, setEditQty] = useState({});
  const [brands, setBrands] = useState([]);
  const recordsPerPage = 5;
  const totalPages = Math.ceil(spares.length / recordsPerPage);

  // Fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("/api/brands");
        const data = await res.json();
        setBrands(Array.isArray(data) ? data : data.data || []);
      } catch {
        console.error("Failed to fetch brands");
      }
    };
    fetchBrands();
  }, []);

  // Fetch spares
  const fetchSpares = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/spares/return", {
        params: { brand, fromDate, toDate, mslStatus, condition },
      });
      const sparesData = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
        ? res.data.data
        : [];
      setSpares(sparesData);
      setSelected([]);
      setEditQty({});
      setCurrentPage(1);
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
    } else setSelected([]);
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleQtyChange = (id, value, maxQty) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 1) return setEditQty((prev) => ({ ...prev, [id]: "" }));
    if (num > maxQty) return alert("Quantity cannot exceed available stock");
    setEditQty((prev) => ({ ...prev, [id]: num }));
  };

  const handleApproveReject = async (approve) => {
    if (selected.length === 0) {
      alert("Select at least one spare.");
      return;
    }

    const selectedSpares = spares.filter((s) => selected.includes(s._id));
    const payload = selectedSpares.map((s) => ({
      ...s,
      returnQty: condition === "good" ? editQty[s._id] || s.availableQty || 0 : s.returnQty,
    }));

    try {
      if (approve) {
        await axios.post("/api/spares/return", {
          selectedSpares: payload,
          returnType: condition,
        });
        alert("Approved successfully!");
        setSpares((prev) => prev.filter((s) => !selected.includes(s._id)));
      } else {
        // Reject logic: can update status or remove from list
        await axios.put("/api/spares/reject", {
          selectedIds: selected,
        });
        alert("Rejected successfully!");
        setSpares((prev) => prev.filter((s) => !selected.includes(s._id)));
      }
      setSelected([]);
      setEditQty({});
    } catch (err) {
      console.error(err);
      alert("Error processing request.");
    }
  };

  const exportExcel = (data) => {
    const formattedData = data.map((s) => ({
      "Spare Code": s.spareCode || s.itemNo,
      "Spare Name": s.spareName || s.itemName,
      "Available Qty": s.availableQty || s.qty || s.quantity,
      "Return Qty": editQty[s._id] || s.returnQty || s.qty || s.quantity,
      "MRP": s.mrp || 0,
    }));
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ReturnedSpares");
    XLSX.writeFile(
      workbook,
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
      <div className="grid grid-cols-7 gap-4 mb-4">
        <select value={brand} onChange={(e) => setBrand(e.target.value)} className="border rounded p-2 w-full">
          <option value="">All</option>
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
        <select value={condition} onChange={(e) => setCondition(e.target.value)} className="border p-2 rounded">
          <option value="">Select</option>
          <option value="good">Good</option>
          <option value="defective">Defective</option>
        </select>
        <button onClick={fetchSpares} className="bg-blue-500 text-white px-4 py-2 rounded">Load</button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : spares.length > 0 ? (
        <>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">
                  <input type="checkbox"
                    onChange={handleSelectAll}
                    checked={pageSpares.every(s => selected.includes(s._id))}
                  />
                </th>
                <th className="border p-2">Brand</th>
                <th className="border p-2">Spare Code</th>
                <th className="border p-2">Spare Name</th>
                <th className="border p-2">Available Qty</th>
                <th className="border p-2">Return Qty</th>
                <th className="border p-2">Spare Date</th>
                <th className="border p-2">No. of Days</th>
                <th className="border p-2">MRP</th>
              </tr>
            </thead>
            <tbody>
              {pageSpares.map((s, idx) => {
                const today = new Date();
                const formattedDate = s.spareDate ? new Date(s.spareDate).toLocaleDateString() : "-";
                const daysDiff = s.spareDate ? Math.floor((today - new Date(s.spareDate)) / (1000*60*60*24)) : "-";
                return (
                  <tr key={s._id}>
                    <td className="border p-2 text-center">
                      <input
                        type="checkbox"
                        checked={selected.includes(s._id)}
                        onChange={() => handleSelect(s._id)}
                      />
                    </td>
                    <td className="border p-2">{s.brand}</td>
                    <td className="border p-2">{s.spareCode || s.itemNo}</td>
                    <td className="border p-2">{s.spareName || s.itemName}</td>
                    <td className="border p-2 text-center">{s.availableQty || s.qty || s.quantity}</td>
                    <td className="border p-2 text-center">
                      <input
                        type="number"
                        min="1"
                        max={s.availableQty || s.qty || s.quantity}
                        value={editQty[s._id] || s.returnQty || 0}
                        onChange={(e) => handleQtyChange(s._id, e.target.value, s.availableQty || s.qty || s.quantity)}
                        className="border p-1 rounded w-20"
                      />
                    </td>
                    <td className="border p-2">{formattedDate}</td>
                    <td className="border p-2 text-center">{daysDiff}</td>
                    <td className="border p-2 text-center">{s.mrp || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p-1)} className="px-2 py-1 border rounded">Prev</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p+1)} className="px-2 py-1 border rounded">Next</button>
          </div>

          {/* Approve/Reject Buttons */}
          <div className="mt-4 space-x-4">
            <button onClick={() => handleApproveReject(true)} className="bg-green-600 text-white px-4 py-2 rounded">Approve Selected</button>
            <button onClick={() => handleApproveReject(false)} className="bg-red-600 text-white px-4 py-2 rounded">Reject Selected</button>
          </div>
        </>
      ) : (
        <p>No records found</p>
      )}
    </div>
  );
};

export default Returnspare;
