import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function DefectiveSubmission() {
  const [brands, setBrands] = useState([]);
  const [brand, setBrand] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [technician, setTechnician] = useState("");
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({}); // callNo → { defectiveSubmitted, amount, completionDate }

  // ✅ Fetch Brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get("/api/brands");
        setBrands(res.data);
      } catch {
        toast.error("Failed to fetch brands");
      }
    };
    fetchBrands();
  }, []);

  // ✅ Fetch Technicians for selected brand
  useEffect(() => {
    const fetchTechs = async () => {
      if (!brand) return;
      try {
        const res = await axios.get(`/api/technicians?brand=${brand}`);
        setTechnicians(res.data);
      } catch {
        toast.error("Failed to fetch technicians");
      }
    };
    fetchTechs();
  }, [brand]);

  // ✅ Fetch Allocated Calls
  useEffect(() => {
    const fetchCalls = async () => {
      if (!technician) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `/api/calls/allocated?brand=${brand}&technician=${technician}`
        );
        setCalls(res.data);
      } catch {
        toast.error("Failed to fetch allocated calls");
      } finally {
        setLoading(false);
      }
    };
    fetchCalls();
  }, [technician]);

  // ✅ Handle form field change
  const handleFieldChange = (callNo, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [callNo]: {
        ...prev[callNo],
        [field]: value,
      },
    }));
  };

  // ✅ Submit one call
  const handleSubmit = async (call) => {
    const data = formData[call.callNo];
    if (!data || !data.defectiveSubmitted) {
      return toast.error("Select defective status first");
    }
    if (!data.completionDate) {
      return toast.error("Please select completion date");
    }
    if (data.defectiveSubmitted === "no" && (!data.amount || isNaN(data.amount))) {
      return toast.error("Enter valid amount collected from customer");
    }

    try {
      await axios.put(`/api/calls/defective/${call.callNo}`, {
        defectiveSubmitted: data.defectiveSubmitted,
        completionDate: data.completionDate,
        amountReceived: data.amount || 0,
      });
      toast.success(`Updated ${call.callNo} successfully`);
      setCalls((prev) => prev.filter((c) => c.callNo !== call.callNo));
    } catch (err) {
      toast.error("Error updating defective status");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Defective Submission
      </h1>

      {/* Brand Dropdown */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Select Brand</label>
        <select
          value={brand}
          onChange={(e) => {
            setBrand(e.target.value);
            setTechnician("");
            setCalls([]);
          }}
          className="border rounded p-2 w-full"
        >
          <option value="">Select brand</option>
          {brands.map((b) => (
            <option key={b._id || b.name} value={b.name}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Technician Dropdown */}
      {brand && (
        <div className="mb-6">
          <label className="block font-semibold mb-1">Select Technician</label>
          <select
            value={technician}
            onChange={(e) => {
              setTechnician(e.target.value);
              setCalls([]);
            }}
            className="border rounded p-2 w-full"
          >
            <option value="">Select technician</option>
            {technicians.map((t) => (
              <option key={t._id || t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Calls Table */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : calls.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg p-4 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Call No</th>
                <th className="p-2 border">Customer</th>
                <th className="p-2 border">Spare Code</th>
                <th className="p-2 border">Spare Name</th>
                <th className="p-2 border">Qty</th>
                <th className="p-2 border">Defective Submitted</th>
                <th className="p-2 border">Completion Date</th>
                <th className="p-2 border">Amount Collected</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => (
                <tr key={call.callNo}>
                  <td className="border p-2">{call.callNo}</td>
                  <td className="border p-2">{call.customerName}</td>
                  <td className="border p-2">{call.spareCode}</td>
                  <td className="border p-2">{call.spareName}</td>
                  <td className="border p-2 text-center">{call.qty}</td>
                  <td className="border p-2 text-center">
                    <select
                      value={
                        formData[call.callNo]?.defectiveSubmitted || ""
                      }
                      onChange={(e) =>
                        handleFieldChange(
                          call.callNo,
                          "defectiveSubmitted",
                          e.target.value
                        )
                      }
                      className="border rounded p-1"
                    >
                      <option value="">Select</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </td>
                  <td className="border p-2 text-center">
                    <input
                      type="date"
                      value={formData[call.callNo]?.completionDate || ""}
                      onChange={(e) =>
                        handleFieldChange(
                          call.callNo,
                          "completionDate",
                          e.target.value
                        )
                      }
                      className="border rounded p-1"
                    />
                  </td>
                  <td className="border p-2 text-center">
                    {formData[call.callNo]?.defectiveSubmitted === "no" && (
                      <input
                        type="number"
                        placeholder="Amount"
                        value={formData[call.callNo]?.amount || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            call.callNo,
                            "amount",
                            e.target.value
                          )
                        }
                        className="border rounded p-1 w-24 text-center"
                      />
                    )}
                  </td>
                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleSubmit(call)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Submit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        technician && (
          <p className="text-gray-500 mt-4">No allocated calls found.</p>
        )
      )}
    </div>
  );
}
