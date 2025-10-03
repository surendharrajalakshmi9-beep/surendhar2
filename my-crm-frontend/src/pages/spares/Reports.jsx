import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";

const Reports = () => {
  const [searchParams] = useSearchParams();
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [brands, setBrands] = useState([]);
  const [reportType, setReportType] = useState(searchParams.get("reportType") || "");
  const [spareCode, setSpareCode] = useState("");
  const [returnDates, setReturnDates] = useState([]); // for Good Return
  const [selectedReturnDate, setSelectedReturnDate] = useState("");
  const [reportData, setReportData] = useState([]);

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

  // 🔹 Fetch available return dates for Good Return
  useEffect(() => {
    const fetchReturnDates = async () => {
      if (reportType === "Good Return") {
        try {
          const res = await fetch(`/api/returnDates?brand=${brand}`);
          const data = await res.json();
          setReturnDates(data || []);
        } catch (err) {
          console.error(err);
        }
      } else {
        setReturnDates([]);
        setSelectedReturnDate("");
      }
    };
    fetchReturnDates();
  }, [reportType, brand]);

  const handleFetch = async () => {
    if (!brand || !reportType) {
      alert("Please select both brand and report type");
      return;
    }

    try {
      let url = `/api/reports?brand=${brand}&reportType=${reportType}`;

      if (reportType === "Spare Availability" && spareCode) {
        url += `&spareCode=${spareCode}`;
      }

      if (reportType === "Good Return" && selectedReturnDate) {
        url += `&returnDate=${selectedReturnDate}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error("Error fetching report:", err);
    }
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${reportType}_${brand}.xlsx`);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Reports</h2>

      {/* Filters */}
      <div className="flex space-x-4 mb-4">
        <div>
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
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Report Type</label>
          <select
            className="border p-2 rounded"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="">Select Report</option>
            <option value="Spare Availability">Spare Availability</option>
            <option value="Not Received">Not Received</option>
            <option value="Not Allocated">Not Allocated</option>
            <option value="Defective Received">Defective Received</option>
            <option value="Defective Not Received">Defective Not Received</option>
            <option value="Good Return">Good Return</option>
          </select>
        </div>

        {/* Spare Code only for Spare Availability */}
        {reportType === "Spare Availability" && (
          <input
            type="text"
            className="border p-2 rounded"
            placeholder="Enter Spare Code"
            value={spareCode}
            onChange={(e) => setSpareCode(e.target.value)}
          />
        )}

        {/* Return Date dropdown for Good Return */}
        {reportType === "Good Return" && returnDates.length > 0 && (
          <select
            className="border p-2 rounded"
            value={selectedReturnDate}
            onChange={(e) => setSelectedReturnDate(e.target.value)}
          >
            <option value="">Select Return Date</option>
            {returnDates.map((d) => (
              <option key={d} value={d}>
                {new Date(d).toLocaleDateString()}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={handleFetch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Fetch Report
        </button>
      </div>

      {/* Table */}
      {reportData.length > 0 ? (
        <table
          border="1"
          cellPadding="8"
          style={{ marginTop: "20px", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              {Object.keys(reportData[0]).map((key) =>
                key !== "_id" ? <th key={key}>{key}</th> : null
              )}
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, i) => (
              <tr key={i}>
                {Object.entries(row).map(([key, val]) =>
                  key !== "_id" ? (
                    <td key={key}>
                      {key === "returnDate" || key === "spareDate"
                        ? new Date(val).toLocaleDateString()
                        : val}
                    </td>
                  ) : null
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={{ marginTop: "20px" }}>No records found.</p>
      )}

      {/* Export Buttons */}
      {reportData.length > 0 && (
        <div className="flex space-x-4 mt-4">
          <button
            onClick={exportExcel}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Export Excel
          </button>
        </div>
      )}
    </div>
  );
};

export default Reports;
