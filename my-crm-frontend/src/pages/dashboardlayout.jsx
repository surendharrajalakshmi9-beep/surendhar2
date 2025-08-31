import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";
import Topbar from "../components/topbar";

export default function DashboardLayout({ onLogout }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar stays fixed */}
      <Sidebar />

      <div className="flex flex-1 flex-col">
        {/* Topbar stays fixed */}
        <Topbar onLogout={onLogout} />

        {/* Page content changes here */}
        <main className="p-6 bg-gray-50 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
