import React from "react";
import Sidebar from "../components/Sidebar";

const DashboardPage = () => {
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="d-flex">
      {/* Sidebar is usually handled in Layout too, so you might remove Sidebar here as well */}
      <div className="flex-grow-1 p-4">
        <h2>📊 Welcome to your Dashboard</h2>
        <ul>
          <li>We have to show all incomes since the day we...</li>
          <li>All expenses</li>
          <li>Chart</li>
          <li>Monthly cost as table</li>
          {/* etc */}
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
