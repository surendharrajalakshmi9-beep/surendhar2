import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

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
  const [editQty, setEditQty] = useState({}); // store edited qty
   const [brands, setBrands] = useState([]);
  const recordsPerPage = 5;
  const totalPages = Math.ceil(spares.length / recordsPerPage);

  const fetchSpares = async () => {
  

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


    setLoading(true);
    try {
      const res = await axios.get("/api/spares/return", {
        params: { brand, fromDate, toDate, mslStatus, condition },
      });

      setSpares(Array.isArray(res.data) ? res.data : []);
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
    if (isNaN(num) || num < 1) {
      setEditQty((prev) => ({ ...prev, [id]: "" }));
      return;
    }
    if (num > maxQty) {
      alert("Quantity cannot exceed available stock");
      return;
    }
    setEditQty((prev) => ({ ...prev, [id]: num }));
  };

  const handleReturn = async () => {
    if (selected.length === 0) {
      alert("Please select at least one spare to return.");
      return;
    }

    const selectedSpares = spares.filter((s) => selected.includes(s._id));
    const payload = selectedSpares.map((s) => ({
      ...s,
      returnQty: condition === "good" ? editQty[s._id] || 0 : s.qty || s.quantity,
    }));

    try {
      await axios.post("/api/spares/return", {
        selectedSpares: payload,
        returnType: condition,
      });
      alert("Return initiated successfully.");
      fetchSpares(); // reload after return
    } catch (error) {
      console.error("Error initiating return:", error);
      alert("Error while initiating return.");
    }
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
                <th className="border p-2">
                  <input
                    type="checkbox"
                    checked={
                      pageSpares.length > 0 &&
                      pageSpares.every((s) => selected.includes(s._id))
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="border p-2">Brand</th>
                <th className="border p-2">Spare Code</th>
                <th className="border p-2">Spare Name</th>
                <th className="border p-2">Available Qty</th>
                {condition === "good" && <th className="border p-2">Return Qty</th>}
                <th className="border p-2">Spare Date</th>
                <th className="border p-2">No. of Days</th> 
              </tr>
            </thead>
       <tbody>
  {pageSpares.map((s, idx) => {
    const today = new Date();
    let daysDiff = null;
    let formattedDate = null;

    const dateField = s.datespare || s.completionDate; // Corrected here

    if (dateField) {
      let m;
      if (moment.isDate(dateField)) {
        m = moment(dateField);
      } else {
        m = moment(dateField, moment.ISO_8601, true);
        if (!m.isValid()) {
          m = moment(dateField, ["DD/MM/YYYY HH:mm:ss", "DD/MM/YYYY"], true);
        }
        if (!m.isValid()) {
          m = moment(dateField);
        }
      }

      if (m.isValid()) {
        const parsedDate = m.toDate();

        const utcToday = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        const utcParsed = Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
        daysDiff = Math.floor((utcToday - utcParsed) / (1000 * 60 * 60 * 24));

        formattedDate = parsedDate.toLocaleDateString();
      } else {
        console.error("Invalid date format:", dateField);
      }
    }

    return (
      <tr key={idx}>
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
        <td className="border p-2">{s.qty || s.quantity}</td>
        {condition === "good" && (
          <td className="border p-2">
            <input
              type="number"
              min="1"
              max={s.qty || s.quantity}
              value={editQty[s._id] || ""}
              onChange={(e) =>
                handleQtyChange(s._id, e.target.value, s.qty || s.quantity)
              }
              className="border p-1 rounded w-20"
            />
          </td>
        )}
        <td className="border p-2">{formattedDate || "-"}</td>
        <td className="border p-2 text-center">
          {daysDiff !== null ? daysDiff : "-"}
        </td>
      </tr>
    );
  })}
</tbody>

          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-2 py-1 border rounded"
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-2 py-1 border rounded"
            >
              Next
            </button>
          </div>

          {/* Return Button */}
          <div className="mt-4">
            <button
              onClick={handleReturn}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Return
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
