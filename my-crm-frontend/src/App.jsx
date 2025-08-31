import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login";
import DashboardLayout from "./pages/dashboardlayout";
import DashboardCards from "./components/dashboardcards";
import Calls from "./pages/calls";
import ManualCalls from "./pages/calls/ManualCalls";
import UploadCalls from "./pages/calls/UploadCalls";
import AllocateCalls from "./pages/calls/AllocateCalls";
import PendingCalls from "./pages/calls/PendingCalls";
import TransferCalls from "./pages/calls/TransferCalls";
import SearchCalls from "./pages/calls/SearchCalls";
import Reports from "./pages/calls/Reports";
import Spares from "./pages/spares";
import Technicians from "./pages/technician";
import UploadSBOM from "./pages/spares/UploadSBOM";
import Incomingspares from "./pages/spares/Incomingspares.jsx";
import Cnupdate from "./pages/spares/Cnupdate.jsx";
import Reports1 from "./pages/spares/Reports.jsx";
import Requestspares from "./pages/spares/Requestspares.jsx";
import Returnspare from "./pages/spares/Returnspare.jsx";

import Employee from "./pages/empl/Employee";
import EmployeeList from "./pages/empl/EmployeeList";


function App() {
  const [user, setUser] = useState(null);

  return (
    <>
      {!user ? (
        <Login onLogin={(userData) => setUser(userData)} />
      ) : (
        <Routes>
          {/* Main Layout with Sidebar + Topbar */}
          <Route path="/" element={<DashboardLayout onLogout={() => setUser(null)} />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<DashboardCards />} />
           <Route path="calls" element={<Calls />}>
        <Route index element={<Navigate to="manual" replace />} /> 
        <Route path="manual" element={<ManualCalls />} />
        <Route path="upload" element={<UploadCalls />} />
        <Route path="allocate" element={<AllocateCalls />} />
        <Route path="pending" element={<PendingCalls />} />
        <Route path="transfer" element={<TransferCalls />} />
        <Route path="searchcalls" element={<SearchCalls />} />
         <Route path="reports" element={<Reports />} />
         
      </Route>
        <Route path="reports" element={<Reports />} />

          
               <Route path="spares" element={<Spares />}>
        <Route index element={<Navigate to="upload" replace />} /> 
        <Route path="upload" element={<UploadSBOM />} />
        <Route path="income" element={<Incomingspares/>} />
        <Route path="request" element={<Requestspares />} />
        <Route path="return" element={<Returnspare />} />
        <Route path="update" element={<Cnupdate/>} />
      
         <Route path="reports" element={<Reports1 />} />
         
      </Route>
            <Route path="technicians" element={<Technicians />} >
             <Route index element={<Navigate to="addemp" replace />} /> 
        <Route path="addemp" element={<Employee />} />
        <Route path="viewemp" element={<EmployeeList/>} />
   
       
            </Route>
          </Route>
        </Routes>
      )}
    </>
  );
}

export default App;
