import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useLocation } from "react-router-dom";



export default function Reports() {
 const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
   const [technicians, setTechnicians] = useState([]);

  // defaults
  const initialStatus = queryParams.get("status") || "All";
  const dateFilter = queryParams.get("date") || null;
  const type = queryParams.get("type") || "calls";
  const filter = queryParams.get("filter") || null;


  const [status, setStatus] = useState(initialStatus);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [technician, setTechnician] = useState("All");
   const [brand, setBrand] = useState("All");
  const [pendingCategory, setPendingCategory] = useState("All");
  const [reportData, setReportData] = useState([]);
  const [reportCount, setReportCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;
 const fetchReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (fromDate) params.append("fromDate", fromDate);
      if (toDate) params.append("toDate", toDate);
      if (technician && technician !== "All") params.append("technician", technician);
      if (status && status !== "All") params.append("status", status);
       if (brand && brand !== "All") params.append("brand", brand);
      if (pendingCategory !== "All") params.append("pendingCategory", pendingCategory);

       // If user came from Completed Today card
    if (dateFilter === "today") {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");

      const formattedDate = `${yyyy}-${mm}-${dd}`;
      params.append("fromDate", formattedDate);
      params.append("toDate", formattedDate);
      params.append("dateType", "completionDate");
    }

      const res = await fetch(`http://localhost:5000/api/calls/report?${params.toString()}`);
      const data = await res.json();
      setReportData(data.data || []);
      setReportCount(data.totalCount || 0);
    } catch (err) {
      toast.error("Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };


  // 🔹 Fetch technicians from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/technicians")
      .then((res) => res.json())
      .then((data) => setTechnicians(data))
      .catch((err) => console.error("Error fetching technicians:", err));
  }, []);

 useEffect(() => {
    fetchReport();
  }, [status, dateFilter, type, filter]);

  const exportExcel = () => {
    if (!reportData.length) return toast.error("No data to export");
    const worksheet = XLSX.utils.json_to_sheet(
      reportData.map((c) => ({
        CallNo: c.callNo,
        Customer: c.customerName,
        Phone: c.phoneNo,
        Technician: c.technician || "-",
        Status: c.status,
        CompletionDate: c.completionDate ? new Date(c.completionDate).toLocaleString() : "-",
         "TAT (hrs)": c.tat ?? "-",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, "report.xlsx");
  };

  const exportPDF = () => {
  if (!reportData.length) return toast.error("No data to export");
  const doc = new jsPDF();
  doc.text("Calls Report", 14, 10);
  const tableData = reportData.map((c) => [
    c.callNo,
    c.customerName,
    c.phoneNo,
    c.technician || "-",
    c.status,
    c.completionDate ? new Date(c.completionDate).toLocaleString() : "-",
     c.tat ?? "-",
  ]);
  autoTable(doc, {
    head: [["Call No", "Customer", "Phone", "Technician", "Status", "Completion Date"]],
    body: tableData,
  });
  doc.save("report.pdf");
};
 // 🔹 Pagination logic
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = reportData.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(reportData.length / recordsPerPage);

  return (
    <div className="p-6 bg-[#f4f7fb] min-h-screen">
      <h2 className="text-xl font-semibold mb-4">Reports</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">

<div>
          <label className="block text-sm mb-1">Brand</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="All">All</option>
            <option value="Havells">Havells</option>
            <option value="Bajaj">Bajaj</option>
            <option value="Usha">Usha</option>
            <option value="Atomberg">Atomberg</option>
           
          </select>
        </div>


        <div>
          <label className="block text-sm mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border p-2 rounded w-full"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Technician</label>
          <select
            value={technician}
            onChange={(e) => setTechnician(e.target.value)}
            className="border p-2 rounded w-full"
          >
           <option value="All">All</option>
          {technicians.map((t) => (
            <option key={t._id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="All">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="Ageing Calls">Ageing Calls</option>
             <option value="High Priority Calls">High Priority Calls</option>
             <option value="Appointment">Appointment</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Pending Category</label>
          <select
            value={pendingCategory}
            onChange={(e) => setPendingCategory(e.target.value)}
            className="border p-2 rounded w-full"
          >
            <option value="All">All</option>
            <option value="Pending with Technician">Pending with Technician</option>
            <option value="Spare Pending">Spare Pending</option>
            <option value="Replacement">Replacement</option>
            <option value="Appointment">Appointment</option>
            <option value="Others">Others</option>
          </select>
        </div>
      </div>

      <div className="flex space-x-4 mb-4">
        <button
          onClick={fetchReport}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate Report
        </button>
        <button
          onClick={exportExcel}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Export Excel
        </button>
        <button
          onClick={exportPDF}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Export PDF
        </button>
      </div>

      {/* Count */}
      <p className="mb-4 font-semibold">
        Total Records: <span className="text-blue-600">{reportCount}</span>
      </p>

     {/* Report Table */}
      {loading ? (
        <p>Loading report...</p>
      ) : reportData.length > 0 ? (
        <>
          <table className="w-full border-collapse border border-gray-300 bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Call No</th>
                <th className="border p-2">Brand</th>
                <th className="border p-2">Customer</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">Technician</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Completion Date</th>
                <th className="border p-2">Hrs TAT</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((call) => (
                <tr key={call._id}>
                  <td className="border p-2">{call.callNo}</td>
                  <td className="border p-2">{call.brand}</td>
                  <td className="border p-2">{call.customerName}</td>
                  <td className="border p-2">{call.phoneNo}</td>
                  <td className="border p-2">{call.technician || "-"}</td>
                  <td className="border p-2">{call.status}</td>
                  <td className="border p-2">
                    {call.completionDate
                      ? new Date(call.completionDate).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="border px-4 py-2">{call.tat ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p>No data found for selected filters</p>
      )}
    </div>
  );
}
