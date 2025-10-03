import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";



const Reports = () => {
  const [brand, setBrand] = useState("");
  const [brands, setBrands] = useState([]);
  const [reportType, setReportType] = useState("");
  const [spareCode, setSpareCode] = useState("");
  const [reportData, setReportData] = useState([]);
  const [returnDates, setReturnDates] = useState([]);
  const [selectedReturnDate, setSelectedReturnDate] = useState("");

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

  // Fetch available return dates when Good Return is selected
  useEffect(() => {
    const fetchReturnDates = async () => {
      if (reportType === "Good Return") {
        try {
          const url = brand && brand !== "All"
            ? `/api/returnDates?brand=${brand}`
            : `/api/returnDates`;
          const res = await fetch(url);
          const dates = await res.json();
          setReturnDates(dates.map(d => new Date(d).toISOString().split("T")[0]));
        } catch (err) {
          console.error("Error fetching return dates:", err);
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
    if (reportData.length === 0) return toast.error("No data to export");

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${reportType}_${brand}.xlsx`);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Reports</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
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

        {/* Report Type */}
        <div>
          <label className="block text-sm font-medium mb-1">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="border p-2 rounded w-full"
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

        {/* Spare Code for Spare Availability */}
        {reportType === "Spare Availability" && (
          <div>
            <label className="block text-sm font-medium mb-1">Spare Code</label>
            <input
              type="text"
              className="border p-2 rounded w-full"
              placeholder="Enter Spare Code"
              value={spareCode}
              onChange={(e) => setSpareCode(e.target.value)}
            />
          </div>
        )}

        {/* Return Date for Good Return */}
        {reportType === "Good Return" && (
          <div>
            <label className="block text-sm font-medium mb-1">Return Date</label>
            <select
              value={selectedReturnDate}
              onChange={(e) => setSelectedReturnDate(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Date</option>
              {returnDates.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-end">
          <button
            onClick={handleFetch}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Fetch Report
          </button>
        </div>
      </div>

      {/* Table */}
      {reportData.length > 0 ? (
        <table className="border-collapse border w-full mt-4">
          <thead>
            <tr className="bg-gray-200">
              {Object.keys(reportData[0]).map((key) =>
                key !== "_id" ? <th key={key} className="border p-2">{key}</th> : null
              )}
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, i) => (
              <tr key={i}>
                {Object.entries(row).map(([key, val]) =>
                  key !== "_id" ? (
                    <td key={key} className="border p-2">
                      {key.toLowerCase().includes("date") && val
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
        <p className="mt-4">No records found.</p>
      )}

      {/* Export */}
      <div className="mt-4">
        <button
          onClick={exportExcel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Export Excel
        </button>
      </div>
    </div>
  );
};

export default Reports;
