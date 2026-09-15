// layouts/EmployeeLayout.js
import React from "react";
import EmployeeHeader from "./EmployeeHeader";

const EmployeeLayout = ({ children }) => {
  return (
    <div className="employee-layout">
      <EmployeeHeader />
      <main className="employee-main bg-light min-vh-100 py-4">
        <div className="container-fluid">
          {children}
        </div>
      </main>
    </div>
  );
};

export default EmployeeLayout;