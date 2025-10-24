import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function CallSearch() {
  const [brands, setBrands] = useState([]);
  const [brand, setBrand] = useState("");
  const [callNo, setCallNo] = useState("");
  const [callDetails, setCallDetails] = useState(null);
  const [technicians, setTechnicians] = useState([]);

  // Completion fields
  const [completedBy, setCompletedBy] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [warrantyType, setWarrantyType] = useState("");
  const [amountCollected, setAmountCollected] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Fetch Brands
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

  // ✅ Fetch Technicians
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const res = await fetch("/api/technicians");
        const data = await res.json();
        if (res.ok) setTechnicians(data);
        else toast.error("Failed to fetch technicians");
      } catch {
        toast.error("Server error while fetching technicians");
      }
    };
    fetchTechnicians();
  }, []);

  // ✅ Fetch Call Details (from /api/calls/pending)
  const fetchCallDetails = async () => {
    if (!callNo.trim()) return toast.error("Enter call number");

    setLoading(true);
    setCallDetails(null);

    try {
      const params = new URLSearchParams();
      if (brand) params.append("brand", brand);

      const res = await fetch(`/api/calls/pending?${params.toString()}`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        toast.error("Unexpected response from server");
        return;
      }

      const call = data.find(
        (c) => c.callNo?.toString().trim() === callNo.trim()
      );

      if (call) {
        setCallDetails(call);
      } else {
        toast.error("No call found with that number");
      }
    } catch {
      toast.error("Error fetching call details");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Submit Completion Details
  const handleSubmit = async () => {
    if (!callDetails) return toast.error("Search a call first");
    if (!completedBy) return toast.error("Select completed by");
    if (!completionDate) return toast.error("Select completion date");
    if (!warrantyType) return toast.error("Select warranty type");
    if (warrantyType === "Out of Warranty" && !amountCollected)
      return toast.error("Enter amount collected");

    setSubmitting(true);

    const payload = {
      callNo: callDetails.callNo,
      completedBy,
      completionDate,
      warrantyType,
      status: "completed",
      ...(warrantyType === "Out of Warranty" && {
        amountCollected,
      }),
    };

    try {
      const res = await fetch("/api/calls/updateStatus", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Call marked as completed ✅");
        setCallDetails(null);
        setCallNo("");
        setCompletedBy("");
        setCompletionDate("");
        setWarrantyType("");
        setAmountCollected("");
      } else {
        toast.error("Failed to update call");
      }
    } catch {
      toast.error("Server error while updating call");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-[#f4f7fb] min-h-screen font-[Times_New_Roman]">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">
        📞 Call Completion
      </h2>

      {/* Brand + Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b._id} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Enter Call Number"
          value={callNo}
          onChange={(e) => setCallNo(e.target.value)}
          className="border p-2 rounded w-full md:w-1/3"
        />

        <button
          onClick={fetchCallDetails}
          disabled={loading}
          className={`px-6 py-2 rounded text-white font-semibold ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Call Details Section */}
      {callDetails && (
        <div className="border rounded-lg shadow bg-white p-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">
            Call Details
          </h3>

          {/* Info Table */}
          <table className="min-w-full border border-gray-300 text-sm mb-6">
            <tbody>
              {Object.entries({
                "Call No": callDetails.callNo,
                Brand: callDetails.brand,
                Customer: callDetails.customerName,
                Phone: callDetails.phoneNo,
                Address: callDetails.address,
                Pincode: callDetails.pincode,
                Product: callDetails.product,
                Model: callDetails.model,
                Type: callDetails.type,
                "Nature of Complaint": callDetails.natureOfComplaint,
                Technician: callDetails.technician || "Not Assigned",
                Status: callDetails.status,
              }).map(([label, value]) => (
                <tr key={label} className="border-t">
                  <td className="font-semibold border-r p-2 w-1/3 bg-gray-50">
                    {label}
                  </td>
                  <td className="p-2 text-gray-700">{value || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Completion Form */}
          <div className="space-y-4">
            {/* Completed By */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <label className="font-semibold text-gray-700 w-40">
                Completed By:
              </label>
              <select
                value={completedBy}
                onChange={(e) => setCompletedBy(e.target.value)}
                className="border p-2 rounded w-full md:w-1/3"
              >
                <option value="">Select Technician</option>
                {technicians.map((t) => (
                  <option key={t._id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Completion Date */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <label className="font-semibold text-gray-700 w-40">
                Completion Date:
              </label>
              <input
                type="datetime-local"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="border p-2 rounded w-full md:w-1/3"
              />
            </div>

            {/* Warranty Type */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <label className="font-semibold text-gray-700 w-40">
                Warranty Type:
              </label>
              <select
                value={warrantyType}
                onChange={(e) => setWarrantyType(e.target.value)}
                className="border p-2 rounded w-full md:w-1/3"
              >
                <option value="">Select</option>
                <option value="Warranty">Warranty</option>
                <option value="Out of Warranty">Out of Warranty</option>
              </select>
            </div>

            {/* Amount Collected (visible only if Out of Warranty) */}
            {warrantyType === "Out of Warranty" && (
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <label className="font-semibold text-gray-700 w-40">
                  Amount Collected (₹):
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={amountCollected}
                  onChange={(e) => setAmountCollected(e.target.value)}
                  className="border p-2 rounded w-full md:w-1/3"
                />
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`mt-4 px-6 py-2 rounded text-white font-semibold ${
                submitting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {submitting ? "Updating..." : "Submit Completion"}
            </button>
          </div>
        </div>
      )}

      {!callDetails && !loading && (
        <p className="text-gray-500 text-center mt-10">
          Enter call number and search to mark completion.
        </p>
      )}
    </div>
  );
}
