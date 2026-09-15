import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaGift, FaTag, FaPercent } from 'react-icons/fa';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  Divider,
  Collapse
} from "@mui/material";
import {
  Dashboard,
  Inventory,
  Category,
  People,
  ExpandLess,
  ExpandMore,
  PointOfSale,
  Receipt,
  Assessment,
  Settings,
  BarChart,
  LocalOffer
} from "@mui/icons-material";

const AdminSidebar = () => {
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState({});

  const menuItems = [
    {
      text: "Dashboard",
      icon: <Dashboard />,
      path: "/admin",
      exact: true
    },
    {
      text: "Quản lý Sản phẩm",
      icon: <Inventory />,
      path: "/admin/products"
    },
    {
      text: "Quản lý Danh mục",
      icon: <Category />,
      path: "/admin/categories"
    },
    {
      text: "Quản lý Người dùng",
      icon: <People />,
      path: "/admin/users"
    },
    {
      text: "Quản lý Khuyến mãi",  // ✅ THÊM DÒNG NÀY
      icon: <FaGift />,            // 🎁 Icon quà tặng
      path: "/admin/promotions"
    },
    {
      text: "Báo cáo",
      icon: <Assessment />,
      path: "/admin/reports"
    },
    // {
    //   text: "Cài đặt",
    //   icon: <Settings />,
    //   path: "/admin/settings"
    // }
    ,
    // Thêm vào menu items trong AdminSidebar
    {
      text: "Quản lý Đơn hàng",
      icon: <Receipt />,
      path: "/admin/orders"
    }, {
      text: "Báo Cáo & Thống Kê",
      icon: <BarChart />,
      path: "/admin/reports"
    // }, {
    //   text: "Cài đặt",
    //   icon: <Settings />,
    //   path: "/admin/settings"
    }
  ];

  const handleMenuClick = (text) => {
    setOpenMenu(prev => ({
      ...prev,
      [text]: !prev[text]
    }));
  };

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #2c387e 0%, #1a237e 100%)',
          color: 'white',
          border: 'none'
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #ffd54f 30%, #ffecb3 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent'
          }}
        >
          ☕ ADMIN PANEL
        </Typography>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
          Quản lý hệ thống
        </Typography>
      </Box>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

      {/* Menu Items */}
      <List sx={{ mt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                backgroundColor: isActive(item.path, item.exact)
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
                border: isActive(item.path, item.exact)
                  ? '1px solid rgba(255, 215, 79, 0.3)'
                  : '1px solid transparent',
              }}
            >
              <ListItemIcon sx={{ color: 'rgba(255,255,255,0.8)', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  fontWeight: isActive(item.path, item.exact) ? 'bold' : 'normal'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ mt: 'auto', p: 2, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
          Phiên bản 1.0.0
        </Typography>
      </Box>
    </Drawer>
  );
};

export default AdminSidebar;