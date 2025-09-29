import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";


const IncomingSpares = () => {

  const [brand, setBrand] = useState("");
  const [brands, setBrands] = useState([]);
  const [itemNo, setItemNo] = useState("");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");

  const [datespare, setDate] = useState("");
  const [mslType, setMsl] = useState("");

  // ✅ Fetch brands from backend
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

  
  // Fetch item name when itemNo changes
  useEffect(() => {
    if (itemNo.trim() !== "") {
      axios.get(`/api/items/${itemNo}`)
        .then(res => {
          if (res.data) setItemName(res.data.item_name || "");
        })
        .catch(err => console.error(err));
    }
  }, [itemNo]);

  
const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    // Step 1: Check if spare already exists
    const { data: existingSpare } = await axios.get(
      `/api/incomingspares/${itemNo}`
    );

    if (existingSpare) {
      if (existingSpare.mslType === mslType) {
        // ✅ Update quantity if MSL type matches
        const updatedQuantity = parseInt(quantity, 10);

        await axios.put(`/api/incomingspares/${itemNo}`, {
          quantity: updatedQuantity,
          datespare, // update to provided date
        });

        toast.success("Spare quantity updated successfully!");
      } else {
        // 🚀 Create new record if MSL type is different
        await axios.post("/api/incomingspares", {
          brand,
          itemNo,
          itemName,
          quantity,
          datespare,
          mslType,
        });

        toast.success("New spare record created (different MSL type)!");
      }
    } else {
      // 🆕 No existing spare → create new record
      await axios.post("/api/incomingspares", {
        brand,
        itemNo,
        itemName,
        quantity,
        datespare,
        mslType,
      });

      toast.success("New spare record created!");
    }

    // Reset fields after save
    setBrand("");
    setItemNo("");
    setItemName("");
    setQuantity("");
    setDate("");
    setMsl("");

  } catch (error) {
    console.error("Error saving spare:", error);
    toast.error("Failed to save spare!");
  }
};



  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Incoming Spares</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Brand Dropdown */}
        
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

              {/* Item Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Item No</label>
          <input
            type="text"
            value={itemNo}
            onChange={(e) => setItemNo(e.target.value)}
            placeholder="Enter Item Number"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
          />
        </div>

        {/* Item Name (auto-filled) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Item Name</label>
          <input
            type="text"
            value={itemName}
             onChange={(e) => setItemName(e.target.value)}
           
            className="mt-1 block w-full rounded-md border-gray-200 bg-gray-100 p-2"
          />
        </div>

       

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={datespare}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
          />
        </div>

 <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter Quantity"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
          />
        </div>


        {/* MSL */}
        <div className="flex items-center">
          <label className="block text-sm font-medium text-gray-700">MSL Type</label>
 <select
            value={mslType}
            onChange={(e) => setMsl(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"
          >
            <option value="">Select</option>
              <option value="Msl">MSL</option>
            <option value="Non-Msl">Non-MSL</option>
                
          </select>




         
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Spare
          </button>
        </div>

      </form>
    </div>
  );
};

export default IncomingSpares;
