import { useNavigate } from "react-router-dom"; 
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import {
  CheckCircle,
  Clock,
  Calendar,
  AlertTriangle,
  Hourglass,
  PackageCheck,
  PackagePlus,
  Truck,
} from "lucide-react";

export default function DashboardCards() {
  const navigate = useNavigate();
  
  // 🔹 Default brand = "All"
  const [brand, setBrand] = useState("All");  

  const [counts, setCounts] = useState({
    completed: 0,
    pending: 0,
    appointment: 0,
    highPriority: 0,
    ageing: 0,
    spareNotReceived: 0,
    spareRequests: 0,
    spareNotAllocated: 0,
  });
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


  // Fetch counts from backend based on brand
  useEffect(() => {
    fetch(`/api/dashboardCounts?brand=${brand}`)
      .then((res) => res.json())
      .then((data) => setCounts(data))
      .catch((err) => console.error("Error fetching counts:", err));
  }, [brand]);

  const cards = [
    { title: "Completed Today", count: counts.completed, icon: <CheckCircle size={32} />, bg: "bg-green-500", reportType: "completed", page: "reports" },
    { title: "Pending Calls", count: counts.pending, icon: <Clock size={32} />, bg: "bg-yellow-500", reportType: "pending", page: "reports" },
    { title: "Appointments", count: counts.appointment, icon: <Calendar size={32} />, bg: "bg-blue-500", reportType: "Appointment", page: "reports" },
    { title: "High Priority Calls", count: counts.highPriority, icon: <AlertTriangle size={32} />, bg: "bg-red-500", reportType: "High Priority Calls", page: "reports" },
    { title: "Ageing Calls", count: counts.ageing, icon: <Hourglass size={32} />, bg: "bg-orange-500", reportType: "Ageing Calls", page: "reports" },

    // Spare-related cards → go to /spares/reports
    { title: "Spare Not Received", count: counts.notReceived, icon: <PackageCheck size={32} />, bg: "bg-indigo-500", reportType: "Not Received", page: "spares" },
    { title: "Spare Requests", count: counts.notAllocated, icon: <PackagePlus size={32} />, bg: "bg-purple-500", reportType: "Not Allocated", page: "spares" },
    { title: "Defective Not Received", count: counts.spareNotAllocated, icon: <Truck size={32} />, bg: "bg-teal-500", reportType: "Defective Not Received", page: "spares" },
  ];

  return (
    <div>
      {/* 🔽 Brand Dropdown */}
      <div className="mb-6">
  
{/* Brand */}
        
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

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Card
            key={index}
            className={`cursor-pointer hover:shadow-xl transform hover:scale-105 transition-all text-white ${card.bg}`}
            onClick={() => {
              if (card.page === "spares") {
                navigate(`/spares/reports?reportType=${card.reportType}&brand=${brand}`);
              } else {
                navigate(`/calls/reports?status=${card.reportType}&brand=${brand}`);
              }
            }}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-semibold">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
