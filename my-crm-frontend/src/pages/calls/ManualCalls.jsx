import { useState } from "react";
import toast from "react-hot-toast";

export default function ManualCalls() {
  const [form, setForm] = useState({
    brand: "",
    callNo: "",
    phoneNo: "",
    customerName: "",
    address: "",
    pincode: "",
    type: "",
    product: "",
    model: "",
    tat: "",
    callerType: "",
    callSubtype: "",
    natureOfComplaint: "" 
  });
   const [brands, setBrands] = useState([]);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
// ✅ Fetch brands from backend
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/brands");
        const data = await res.json();
        if (res.ok) setBrands(data);
        else toast.error("Failed to fetch brands");
      } catch {
        toast.error("Server error while fetching brands");
      }
    };
    fetchBrands();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.brand) return toast.error("Please select a brand");
    if (!form.callNo || !form.phoneNo)
      return toast.error("Call No & Phone No are required");
    if (!form.callerType) return toast.error("Please select Caller Type");
    if (!form.callSubtype) return toast.error("Please select Call Subtype");

    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Call Details Added Successfully");
        setForm({
          brand: "",
          callNo: "",
          phoneNo: "",
          customerName: "",
          address: "",
          pincode: "",
          type: "",
          product: "",
          model: "",
          tat: "",
          callerType: "",
          callSubtype: "",
          natureofcomplaint: "",
        });
      } else {
        toast.error(data.error || "Failed to save call details");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error. Please try again");
    }
  };

  return (
    <div className="p-6 bg-[#fbfccdf6] min-h-screen rounded shadow relative">
      <h2 className="text-xl font-semibold mb-4">Manual Call Loading</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
       
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
              <option key={b._id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Call No */}
        <div>
          <label className="block text-sm font-medium">Call No</label>
          <input name="callNo" value={form.callNo} onChange={handleChange} className="w-full border rounded p-2" required />
        </div>

        {/* Phone No */}
        <div>
          <label className="block text-sm font-medium">Phone No</label>
          <input name="phoneNo" value={form.phoneNo} onChange={handleChange} className="w-full border rounded p-2" required />
        </div>

        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium">Customer Name</label>
          <input name="customerName" value={form.customerName} onChange={handleChange} className="w-full border rounded p-2" />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Address</label>
          <textarea name="address" value={form.address} onChange={handleChange} className="w-full border rounded p-2" />
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-sm font-medium">Pincode</label>
          <input name="pincode" value={form.pincode} onChange={handleChange} className="w-full border rounded p-2" />
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium">Type</label>
          <select name="type" value={form.type} onChange={handleChange} className="w-full border rounded p-2">
            <option value="">Select Type</option>
            <option value="Warranty">Warranty</option>
            <option value="Out of Warranty">Out of Warranty</option>
          </select>
        </div>

        {/* Product */}
        <div>
          <label className="block text-sm font-medium">Product</label>
          <input name="product" value={form.product} onChange={handleChange} className="w-full border rounded p-2" />
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium">Model</label>
          <input name="model" value={form.model} onChange={handleChange} className="w-full border rounded p-2" />
        </div>

        {/* TAT (Date & Time) */}
        <div>
          <label className="block text-sm font-medium">TAT</label>
          <input type="datetime-local" name="tat" value={form.tat} onChange={handleChange} className="w-full border rounded p-2" />
        </div>

        {/* Caller Type */}
        <div>
          <label className="block text-sm font-medium">Caller Type</label>
          <select name="callerType" value={form.callerType} onChange={handleChange} className="w-full border rounded p-2">
            <option value="">Select</option>
            <option value="Customer">Customer</option>
            <option value="Dealer">Dealer</option>
            <option value="E-Commerce">E-Commerce</option>
            <option value="Email">Email</option>
          </select>
        </div>

        {/* Call Subtype */}
        <div>
          <label className="block text-sm font-medium">Call Subtype</label>
          <select name="callSubtype" value={form.callSubtype} onChange={handleChange} className="w-full border rounded p-2">
            <option value="">Select</option>
            <option value="Breakdown">Breakdown</option>
            <option value="Installation">Installation</option>
            <option value="Demo">Demo</option>
            <option value="Dealer Stock Repair">Dealer Stock Repair</option>
          </select>
        </div>

         {/* Nature of Complaint */}
        <div>
  <label className="block text-sm font-medium">Nature of Complaint</label>
  <textarea
    name="natureOfComplaint"
    value={form.natureOfComplaint}
    onChange={handleChange}
    className="w-full border rounded p-2"
    placeholder="Describe the complaint"
  />
</div>

        <div className="md:col-span-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
