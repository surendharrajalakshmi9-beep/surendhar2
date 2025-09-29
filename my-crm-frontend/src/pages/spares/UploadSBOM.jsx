import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function UploadSBOM() {
  const [brand, setBrand] = useState("");
  const [file, setFile] = useState(null);
const [brands, setBrands] = useState([]);

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
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brand) return toast.error("Please select a brand");
    if (!file) return toast.error("Please select a file");

    const formData = new FormData();
    formData.append("brand", brand);
    formData.append("file", file);

    try {
      const res = await fetch("/api/calls/uploadsbom", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) toast.success(data.message || "File uploaded successfully");
      else toast.error(data.error || "Upload failed");
    } catch {
      toast.error("Server error while uploading file");
    }
  };

  return (
    <div className="p-6 bg-[#fbfccdf6] min-h-screen rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Upload SBOM</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Brand */}
       
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

        {/* File Input */}
        <div>
          <label className="block text-sm font-medium mb-1">Excel File</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files[0])}
            className="border rounded p-2 w-full"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload
        </button>
      </form>
    </div>
  );
}
