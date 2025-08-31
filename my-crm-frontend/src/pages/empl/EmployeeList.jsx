import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/employees");
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle input change for editing
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingEmployee((prev) => ({ ...prev, [name]: value }));
  };

  // Save updated employee
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `http://localhost:5000/api/employees/${editingEmployee._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingEmployee),
        }
      );
      await res.json();
      toast.success("Employee Updated Successfully");
      setEditingEmployee(null);
      fetchEmployees();
    } catch (err) {
      console.error("Error updating employee:", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Employee List</h2>

      {/* Employee Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Gender</th>
              <th className="border px-4 py-2">DOB</th>
            <th className="border px-4 py-2">Address</th>
            <th className="border px-4 py-2">Pincode</th>
            <th className="border px-4 py-2">Phone</th>
            <th className="border px-4 py-2">Type</th>
            <th className="border px-4 py-2">Adhaar Card</th>
             <th className="border px-4 py-2">PanCard</th>
              <th className="border px-4 py-2">Role</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp._id}>
              <td className="border px-4 py-2">{emp.name}</td>
              <td className="border px-4 py-2">{emp.gender}</td>
               <td className="border px-4 py-2"> {emp.dob ? new Date(emp.dob).toLocaleDateString("en-GB") : "-"}</td>
                <td className="border px-4 py-2">{emp.address}</td>
                 <td className="border px-4 py-2">{emp.pincode}</td>
              <td className="border px-4 py-2">{emp.phone}</td>
              <td className="border px-4 py-2">{emp.type}</td>
                <td className="border px-4 py-2">{emp.adhaar}</td>
                  <td className="border px-4 py-2">{emp.pancard}</td>
                    <td className="border px-4 py-2">{emp.emptype}</td>
              <td className="border px-4 py-2">{emp.status}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => setEditingEmployee(emp)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Form */}
      {editingEmployee && (
        <div className="mt-6 bg-white shadow p-6 rounded">
          <h3 className="text-lg font-bold mb-4">Edit Employee</h3>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block">Name</label>
              <input
                type="text"
                name="name"
                value={editingEmployee.name}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block">Gender</label>
              <select
                name="gender"
                value={editingEmployee.gender}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            <div>
              <label className="block">Phone</label>
              <input
                type="text"
                name="phone"
                value={editingEmployee.phone}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            
            <div>
              <label className="block">Address</label>
              <input
                type="text"
                name="address"
                value={editingEmployee.address}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

             <div>
              <label className="block">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={editingEmployee.pincode}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block">Type</label>
              <select
                name="type"
                value={editingEmployee.type}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                <option>Permanent</option>
                <option>Temporary</option>
              </select>
            </div>

 <div>
              <label className="block">Role</label>
              <select
                name="emptype"
                value={editingEmployee.emptype}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                <option>Technician</option>
                <option>Admin</option>
              </select>
            </div>

            <div>
              <label className="block">Status</label>
              <select
                name="status"
                value={editingEmployee.status}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditingEmployee(null)}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
