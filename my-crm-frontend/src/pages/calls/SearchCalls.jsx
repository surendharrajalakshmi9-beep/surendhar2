import { useState } from "react";
import toast from "react-hot-toast";

export default function SearchCalls() {
  const [searchText, setSearchText] = useState("");
  const [calls, setCalls] = useState([]);

  const handleSearch = async () => {
    if (!searchText.trim()) return toast.error("Enter Call No or Phone No");

    try {
      const res = await fetch(
        `http://localhost:5000/api/calls/search?query=${encodeURIComponent(searchText)}`
      );
      if (!res.ok) {
        toast.error("No calls found");
        setCalls([]);
        return;
      }
      const data = await res.json();
      setCalls(data.calls);
    } catch (err) {
      toast.error("Error fetching call details");
    }
  };

  return (
    <div className="p-6 bg-[#f4f7fb] min-h-screen">
      <h2 className="text-xl font-semibold mb-4">Search Calls</h2>

      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Enter Call No or Phone No"
          className="border p-2 rounded w-80"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {calls.length > 0 ? (
        <table className="w-full border-collapse border border-gray-300 bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">Call No</th>
              <th className="border p-2">Brand</th>
              <th className="border p-2">Customer</th>
              <th className="border p-2">Phone</th>
              <th className="border p-2">Address</th>
              <th className="border p-2">Pincode</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">Model</th>
              <th className="border p-2">Caller Type</th>
              <th className="border p-2">Call Subtype</th>
              <th className="border p-2">Nature of Complaint</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Technician</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call._id}>
                <td className="border p-2">{call.callNo}</td>
                <td className="border p-2">{call.brand}</td>
                <td className="border p-2">{call.customerName}</td>
                <td className="border p-2">{call.phoneNo}</td>
                <td className="border p-2">{call.address}</td>
                <td className="border p-2">{call.pincode}</td>
                <td className="border p-2">{call.type}</td>
                <td className="border p-2">{call.product}</td>
                <td className="border p-2">{call.model}</td>
                <td className="border p-2">{call.callerType}</td>
                <td className="border p-2">{call.callSubtype}</td>
                <td className="border p-2">{call.natureOfComplaint}</td>
                <td className="border p-2">{call.status || "Not Assigned"}</td>
                <td className="border p-2">{call.technician || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600">No results found</p>
      )}
    </div>
  );
}
