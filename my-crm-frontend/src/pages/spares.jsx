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
        <NavLink to="request" className={linkClass}>
          Spare Allocation
        </NavLink>
          <NavLink to="sparepending" className={linkClass}>
          Spare Requests
        </NavLink>
         <NavLink to="defective" className={linkClass}>
          Defective Submission
        </NavLink>
       
      </div>

      {/* Sub Pages */}
      <Outlet />
    </div>
  );
}
