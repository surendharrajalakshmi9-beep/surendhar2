import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "jspdf-autotable";
import * as XLSX from "xlsx";


const Reports = () => {
  const [searchParams] = useSearchParams();
  const [brand, setBrand] = useState(searchParams.get("brand") || "");
  const [reportType, setReportType] = useState(searchParams.get("reportType") || "");
  const [spareCode, setSpareCode] = useState("");
  const [reportData, setReportData] = useState([]);

  const handleFetch = async () => {
    if (!brand || !reportType) {
      alert("Please select both brand and report type");
      return;
    }

    try {
      let url = `http://localhost:5000/api/reports?brand=${brand}&reportType=${reportType}`;

      if (reportType === "Spare Availability" && spareCode) {
        url += `&spareCode=${spareCode}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error("Error fetching report:", err);
    }
  };

  // 🔹 Auto fetch if params exist
  useEffect(() => {
    if (brand && reportType) {
      handleFetch();
    }
  }, [brand, reportType]);


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
        <select
          className="border p-2 rounded"
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Havells">Havells</option>
          <option value="Bajaj">Bajaj</option>
          <option value="Usha">Usha</option>
          <option value="Atomberg">Atomberg</option>
        </select>

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
                 </select>

        {/* Show Spare Code box ONLY if Spare Availability is selected */}
        {reportType === "Spare Availability" && (
          <input
            type="text"
            className="border p-2 rounded"
            placeholder="Enter Spare Code"
            value={spareCode}
            onChange={(e) => setSpareCode(e.target.value)}
          />
        )}

        <button 
          onClick={handleFetch}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 z-10 relative"

        >
          Fetch Report
        </button>
      </div>

      {/* Table */}
      {reportData.length > 0 ? (
  <table border="1" cellPadding="8" style={{ marginTop: "20px", borderCollapse: "collapse" }}>
    <thead>
      <tr>
        {Object.keys(reportData[0]).map((key) => (
          key !== "_id" && <th key={key}>{key}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {reportData.map((row, i) => (
        <tr key={i}>
          {Object.entries(row).map(([key, val]) =>
            key !== "_id" ? (
              <td key={key}>
                {key === "datespare"
                  ? new Date(val).toLocaleDateString() // ✅ Only date
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
          <div className="flex space-x-4 mt-4">
           
            <button
              onClick={exportExcel}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Export Excel
            </button>
          </div>
        </div>
      )}
 
export default Reports;
