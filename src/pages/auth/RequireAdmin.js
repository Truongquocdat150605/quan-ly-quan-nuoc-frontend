import React from "react";
import { Navigate } from "react-router-dom";

const RequireAdmin = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || !user.roles?.includes("ADMIN")) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default RequireAdmin;
