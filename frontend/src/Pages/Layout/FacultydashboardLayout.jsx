// DashboardLayout.jsx
import React from "react";
import FacultySidebar from "./facultysidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="flex">
      <FacultySidebar />
      <main className="flex-1 p-6 bg-gray-100 min-h-screen">
        <Outlet /> {/* This renders the matched child route */}
      </main>
    </div>
  );
};

export default DashboardLayout;
