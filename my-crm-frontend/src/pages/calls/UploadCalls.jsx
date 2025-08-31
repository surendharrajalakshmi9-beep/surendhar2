import { useState } from "react";
import toast from "react-hot-toast";

export default function UploadCalls() {
  const [brand, setBrand] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!brand) return toast.error("Please select a brand");
    if (!file) return toast.error("Please select a file");

    const formData = new FormData();
    formData.append("brand", brand);
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/api/calls/upload", {
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
      <h2 className="text-xl font-semibold mb-4">Upload Calls</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Brand */}
        <div>
          <label className="block text-sm font-medium mb-1">Select Brand</label>
          <select
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">Select Brand</option>
            <option value="Havells">Havells</option>
            <option value="Bajaj">Bajaj</option>
            <option value="Usha">Usha</option>
            <option value="Atomberg">Atomberg</option>
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
