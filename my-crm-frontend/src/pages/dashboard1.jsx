import { useState } from "react";
import Sidebar from "../components/sidebar";     // <-- your existing sidebar
import Topbar from "../components/topbar";       // <-- your existing topbar
import DashboardCards from "../components/dashboardcards"; // new cards component

export default function Dashboard({ onLogout }) {
  const [selectedBrand, setSelectedBrand] = useState("all");

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar selectedBrand={selectedBrand} setSelectedBrand={setSelectedBrand} onLogout={onLogout} />
        <main className="p-6 bg-gray-50 flex-1">
          <DashboardCards selectedBrand={selectedBrand} />
        </main>
      </div>
    </div>
  );
}
