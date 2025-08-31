import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Home, PhoneCall, Package, Wrench, Menu } from "lucide-react";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2 rounded transition-colors ${
      isActive ? "bg-blue-1000" : "hover:bg-blue-700"
    }`;

  return (
    <aside
      className={`h-screen transition-all duration-300 bg-blue-950 text-white ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Toggle Button */}
      <div className="flex justify-end p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded hover:bg-blue-800"
        >
          <Menu />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="p-2 space-y-3">
        <NavLink to="/dashboard" className={linkClass}>
          <Home />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink to="/calls" className={linkClass}>
          <PhoneCall />
          {!collapsed && <span>Call Details</span>}
        </NavLink>

        <NavLink to="/spares" className={linkClass}>
          <Package />
          {!collapsed && <span>Spares</span>}
        </NavLink>

        <NavLink to="/technicians" className={linkClass}>
          <Wrench />
          {!collapsed && <span>Employees</span>}
        </NavLink>
      

      </nav>
    </aside>
  );
}
