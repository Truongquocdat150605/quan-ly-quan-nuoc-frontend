// layouts/AdminLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import AdminFooter from "./AdminFooter";
import AdminDashboard from "../pages/admin/AdminDashboard";

const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AdminSidebar />
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        flexGrow: 1,
        minWidth: 0
      }}>
        <AdminHeader />
        
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1,
            p: 3,
            backgroundColor: 'grey.50',
            minHeight: 'calc(100vh - 140px)'
          }}
        >
          <Outlet /> {/* 🔥 Nơi render admin pages */}
        </Box>
        
        <AdminFooter />
      </Box>
    </Box>
  );
};

export default AdminLayout;