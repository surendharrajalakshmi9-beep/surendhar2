import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Requestspares() {
  const [requests, setRequests] = useState([]);
  const [spares, setSpares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brand, setBrand] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // Fetch spares list
  useEffect(() => {
    const fetchSpares = async () => {
      try {
        const spareRes = await axios.get("http://localhost:5000/api/spares");
        setSpares(spareRes.data.map(s => s.itemNo)); // store spare codes only
      } catch (error) {
        console.error("Error fetching spares:", error);
      }
    };
    fetchSpares();
  }, []);

  // Fetch spare requests for brand
  useEffect(() => {
    if (!brand) {
      setRequests([]);
      return;
    }
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:5000/api/callDetailsWithSpare?brand=${brand}`
        );
        const filtered = res.data.filter(
          (call) => call.spareCode?.trim() !== ""
        );
        setRequests(filtered);
      } catch (error) {
        console.error("Error fetching spare requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [brand, refreshKey]);

 // Allocate handler
const handleAllocate = async (callNo) => {
  try {
    await axios.post(`http://localhost:5000/api/allocate/${callNo}`, {
      status: "Spare Allocated"
    });
    toast.success("Spare allocated successfully!");
    setRefreshKey(prev => prev + 1); // triggers re-fetch
  } catch (error) {
    console.error("Error allocating spare:", error);
    toast.error("Failed to allocate spare!");
  }

  };

  // Reject handler
  const handleReject = async (callNo) => {
    try {
      await axios.put(`http://localhost:5000/api/calldetails/${callNo}`, {
        spareCode: "",
        spareName: "",
        quantity: "",
        status: "Spare Not Required",
      });
      toast.success("Spare removed from request.");
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error("Error rejecting spare:", error);
      toast.error("Failed to reject spare!");
    }
  };

  // Pagination logic
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentRecords = requests.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(requests.length / recordsPerPage);

  // Brand counts for current brand
  const brandCounts = requests.reduce(
    (acc, req) => {
      if (req.status === "Spare Allocated") {
        acc.allocated += 1;
      } else {
        acc.waiting += 1;
      }
      return acc;
    },
    { allocated: 0, waiting: 0 }
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Spare Requests</h1>

      {/* Brand Filter */}
      <div className="mb-4">
        <label className="block mb-2 font-medium">Select Brand</label>
        <select
          value={brand}
          onChange={(e) => { setBrand(e.target.value); setCurrentPage(1); }}
          className="border p-2 rounded w-60"
        >
          <option value="">Select</option>
          <option value="Havells">Havells</option>
          <option value="Bajaj">Bajaj</option>
          <option value="Usha">Usha</option>
          <option value="Atomberg">Atomberg</option>
        </select>
      </div>

      {/* Counts */}
      {brand && (
        <div className="mb-4">
          <p><b>Allocated:</b> {brandCounts.allocated}</p>
          <p><b>Waiting to Allocate:</b> {brandCounts.waiting}</p>
          <p><b>Total:</b> {brandCounts.allocated + brandCounts.waiting}</p>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 mt-6">Loading spare requests...</p>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 text-sm font-semibold text-gray-700">Call No</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Customer</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Spare Code</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Spare Name</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Quantity</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Technician Name</th>
                <th className="p-3 text-sm font-semibold text-gray-700">Address</th>
                <th className="p-3 text-sm font-semibold text-gray-700 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length > 0 ? (
                currentRecords.map((req) => (
                  <tr key={req._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-800">{req.callNo}</td>
                    <td className="p-3 text-sm text-gray-800">{req.customerName}</td>
                    <td className="p-3 text-sm text-gray-800">{req.spareCode}</td>
                    <td className="p-3 text-sm text-gray-600">{req.spareName}</td>
                    <td className="p-3 text-sm text-gray-600">{req.qty}</td>
                    <td className="p-3 text-sm text-gray-600">{req.technician}</td>
                    <td className="p-3 text-sm text-gray-600">{req.address}</td>
                    <td className="p-3 text-sm flex gap-2 justify-center">
                      <button
                        onClick={() => handleAllocate(req.callNo)}
                        style={{
                          backgroundColor: req.status === "Spare Allocated" ? "darkblue" : "green",
                          color: "white",
                          padding: "6px 12px",
                          border: "none",
                          borderRadius: "4px",
                          cursor: req.status === "Spare Allocated" ? "not-allowed" : "pointer"
                        }}
                        disabled={req.status === "Spare Allocated"}
                      >
                        {req.status === "Spare Allocated" ? "Allocated" : "Allocate"}
                      </button>

                      <button
                        onClick={() => handleReject(req.callNo)}
                        style={{
                          backgroundColor: "red",
                          color: "white",
                          padding: "6px 12px",
                          border: "none",
                          borderRadius: "4px",
                          cursor: req.status === "Spare Allocated" ? "not-allowed" : "pointer",
                          opacity: req.status === "Spare Allocated" ? 0.5 : 1
                        }}
                        disabled={req.status === "Spare Allocated"}
                      >
                        Spare not required
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center p-4 text-gray-500">
                    No spare requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center items-center p-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-300 rounded mr-2"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-300 rounded ml-2"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
