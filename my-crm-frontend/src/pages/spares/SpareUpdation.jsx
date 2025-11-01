import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function SpareUpdation() {
  const [brand, setBrand] = useState("");
  const [brands, setBrands] = useState([]);
  const [spares, setSpares] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 5;

  // ✅ Fetch brands safely
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await axios.get("/api/brands");
        console.log("Fetched brands:", res.data);

        const brandList = Array.isArray(res.data)
          ? res.data
          : res.data.data || [];

        setBrands(brandList);
      } catch (err) {
        console.error(err);
        toast.error("Error fetching brands");
        setBrands([]);
      }
    };
    fetchBrands();
  }, []);

  // ✅ Fetch spares for selected brand
  const fetchSpares = async () => {
    if (!brand) return toast.error("Select a brand first");
    setLoading(true);
    try {
      const res = await axios.get(`/api/spares?brand=${brand}`);
      const spareList = Array.isArray(res.data)
        ? res.data
        : res.data.data || [];
      setSpares(spareList);
    } catch (err) {
      console.error(err);
      toast.error("Error fetching spares");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Pagination
  const indexOfLast = currentPage * recordsPerPage;
  const indexOfFirst = indexOfLast - recordsPerPage;
  const currentSpares = spares.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(spares.length / recordsPerPage);

  // ✅ Edit spare
  const handleEdit = async (id, newQuantity, newMrp, newMslType) => {
    try {
      await axios.put(`/api/spares/${id}`, {
        quantity: Number(newQuantity),
        mrp: Number(newMrp),
        mslType: newMslType,
      });
      toast.success("Spare updated successfully");
      fetchSpares();
    } catch {
      toast.error("Update failed");
    }
  };

  // ✅ Delete spare
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this spare?")) return;
    try {
      await axios.delete(`/api/spares/${id}`);
      toast.success("Spare deleted");
      setSpares(spares.filter((s) => s._id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Spare Updation</h2>

      {/* Brand Selector */}
      <div className="flex gap-4 mb-4">
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="border p-2 rounded w-1/3"
        >
          <option value="">-- Select Brand --</option>
          {Array.isArray(brands) &&
            brands.map((b, i) => (
              <option key={i} value={b.name || b}>
                {b.name || b}
              </option>
            ))}
        </select>

        <button
          onClick={fetchSpares}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading...</p>
      ) : spares.length === 0 ? (
        <p className="text-gray-500">No spares found for this brand.</p>
      ) : (
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">Code</th>
              <th className="border px-2 py-1">Name</th>
              <th className="border px-2 py-1">Qty</th>
              <th className="border px-2 py-1">MRP</th>
              <th className="border px-2 py-1">MSL / Non-MSL</th>
              <th className="border px-2 py-1">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentSpares.map((s) => (
              <EditableRow
                key={s._id}
                spare={s}
                onSave={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded border ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white text-black"
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ✅ Editable Row
function EditableRow({ spare, onSave, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(spare.quantity);
  const [mrp, setMrp] = useState(spare.mrp);
  const [mslType, setMslType] = useState(spare.mslType || "MSL");

  const handleSave = () => {
    onSave(spare._id, quantity, mrp, mslType);
    setIsEditing(false);
  };

  return (
    <tr>
      <td className="border px-2 py-1">{spare.itemNo}</td>
      <td className="border px-2 py-1">{spare.itemName}</td>

      {/* Quantity */}
      <td className="border px-2 py-1 text-center">
        {isEditing ? (
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="border rounded px-1 w-20 text-center"
          />
        ) : (
          spare.quantity
        )}
      </td>

      {/* MRP */}
      <td className="border px-2 py-1 text-center">
        {isEditing ? (
          <input
            type="number"
            value={mrp}
            onChange={(e) => setMrp(e.target.value)}
            className="border rounded px-1 w-24 text-center"
          />
        ) : (
          `₹${spare.mrp}`
        )}
      </td>

      {/* MSL Type */}
      <td className="border px-2 py-1 text-center">
        {isEditing ? (
          <select
            value={mslType}
            onChange={(e) => setMslType(e.target.value)}
            className="border rounded px-1"
          >
            <option value="MSL">MSL</option>
            <option value="Non-MSL">Non-MSL</option>
          </select>
        ) : (
          <span
            className={`${
              spare.mslType === "Non-MSL"
                ? "text-red-600 font-semibold"
                : "text-green-600 font-semibold"
            }`}
          >
            {spare.mslType || "MSL"}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="border px-2 py-1 text-center">
        {isEditing ? (
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-2 py-1 rounded mr-2"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
          >
            Edit
          </button>
        )}
        <button
          onClick={() => onDelete(spare._id)}
          className="bg-red-600 text-white px-2 py-1 rounded"
        >
          Delete
        </button>
      </td>
    </tr>
  );
}
