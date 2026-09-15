import React from "react";
import { Box, Typography, Link, IconButton } from "@mui/material";
import { GitHub, Coffee, Favorite } from "@mui/icons-material";

const AdminFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.grey[100],
        borderTop: '1px solid',
        borderColor: (theme) => theme.palette.grey[300],
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2
        }}
      >
        {/* Left side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Coffee color="primary" />
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Coffee Management System
          </Typography>
        </Box>

        {/* Center */}
        <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          Made with <Favorite sx={{ color: 'error.main', fontSize: 16 }} /> by Your Team
        </Typography>

        {/* Right side */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Phiên bản 1.0.0
          </Typography>
          <IconButton size="small" color="primary">
            <GitHub />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminFooter;