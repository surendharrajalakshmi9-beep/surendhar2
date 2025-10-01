import { NavLink, Outlet } from "react-router-dom";

export default function Calls() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded font-medium ${
      isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-blue-100"
    }`;

  return (
    <div className="p-4">
      {/* Sub Navigation */}
      <div className="flex gap-4 mb-6 border-b pb-3">
        <NavLink to="manual" className={linkClass}>
          Manual Call Loading
        </NavLink>
        <NavLink to="upload" className={linkClass}>
          Upload Calls
        </NavLink>
        <NavLink to="allocate" className={linkClass}>
          Allocate Calls
        </NavLink>
        <NavLink to="pending" className={linkClass}>
          Pending Calls
        </NavLink>
        <NavLink to="transfer" className={linkClass}>
          Transfer Calls
        </NavLink>
         <NavLink to="searchcalls" className={linkClass}>
          Search Calls
        </NavLink>
        <NavLink to="resend" className={linkClass}>
          Resend WhatsApp
        </NavLink>
       
         <NavLink to="reports" className={linkClass}>
          Reports
        </NavLink>
      </div>

      {/* Sub Pages */}
      <Outlet />
    </div>
  );
}
