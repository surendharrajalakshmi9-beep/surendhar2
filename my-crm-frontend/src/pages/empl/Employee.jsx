import React, { useState } from "react";
import toast from "react-hot-toast";


const Employee = () => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    phone: "",
    type: "",
    status: "",
    dob: "",
    address: "",
    pincode: "",
    adhaar: "",
    pancard: "",
  });

  // handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // handle submit
  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:5000/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    toast.success("Employee Details Saved Successfully");
  } catch (err) {
    console.error("Error saving employee:", err);
  }
};

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 className="text-xl font-bold mb-4">Add Employee</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block font-medium">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Phone */}
        <div>
          <label className="block font-medium">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Type */}
        <div>
          <label className="block font-medium">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          >
            <option value="">Select</option>
            <option value="Permanent">Permanent</option>
            <option value="Temporary">Temporary</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          >
            <option value="">Select</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Show only if Permanent */}
        {formData.type === "Permanent" && (
          <>
            {/* DOB */}
            <div>
              <label className="block font-medium">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block font-medium">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>

            {/* Pincode */}
            <div>
              <label className="block font-medium">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>

            {/* Aadhaar */}
            <div>
              <label className="block font-medium">Adhaar Card</label>
              <input
                type="text"
                name="adhaar"
                value={formData.adhaar}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>

            {/* Pancard */}
            <div>
              <label className="block font-medium">Pancard</label>
              <input
                type="text"
                name="pancard"
                value={formData.pancard}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>
              <div>
          <label className="block font-medium">Role</label>
          <select
            name="emptype"
            value={formData.emptype}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          >
            <option value="">Select</option>
            <option value="Technician">Technician</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
          </>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Save Employee
        </button>
      </form>
    </div>
  );
};

export default Employee;
