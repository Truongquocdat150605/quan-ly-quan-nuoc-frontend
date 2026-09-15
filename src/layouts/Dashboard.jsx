import React from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress
} from "@mui/material";
import {
  People,
  Inventory,
  Category,
  Receipt,
  TrendingUp,
  AttachMoney
} from "@mui/icons-material";

const StatCard = ({ title, value, icon, color, progress }) => (
  <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography color="textSecondary" gutterBottom variant="overline">
            {title}
          </Typography>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            color: color,
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
      </Box>
      {progress && (
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ 
            height: 6, 
            borderRadius: 3,
            backgroundColor: `${color}20`,
            '& .MuiLinearProgress-bar': {
              backgroundColor: color
            }
          }} 
        />
      )}
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const stats = [
    {
      title: "Tổng người dùng",
      value: "1,234",
      icon: <People />,
      color: "#1976d2",
      progress: 75
    },
    {
      title: "Sản phẩm",
      value: "567",
      icon: <Inventory />,
      color: "#2e7d32",
      progress: 60
    },
    {
      title: "Danh mục",
      value: "24",
      icon: <Category />,
      color: "#ed6c02",
      progress: 40
    },
    {
      title: "Doanh thu",
      value: "45.2M",
      icon: <AttachMoney />,
      color: "#9c27b0",
      progress: 85
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ mb: 4 }}>
        📊 Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminDashboard;