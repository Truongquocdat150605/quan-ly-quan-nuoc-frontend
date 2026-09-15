import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import api from "../../services/api";
import {
  Container, Paper, Grid, Card, CardContent, Typography, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, LinearProgress, IconButton
} from '@mui/material';
import {
  TrendingUp, People, Inventory, Category, Receipt,
  AttachMoney, LocalCafe, ShoppingCart, Refresh
} from '@mui/icons-material';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  const [currentUser] = useState(() => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data
      const [ordersRes, productsRes, categoriesRes, usersRes] = await Promise.all([
        api.get("/orders"),
        api.get("/products"),
        api.get("/categories"),
        api.get("/users")
      ]);

      const orders = ordersRes.data?.data || ordersRes.data || [];
      const products = productsRes.data?.data || productsRes.data || [];
      const categories = categoriesRes.data?.data || categoriesRes.data || [];
      const users = usersRes.data?.data || usersRes.data || [];

      // Calculate statistics
      const today = new Date();
      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === today.toDateString();
      });

      const totalRevenue = orders
        .filter(o => o.status === 'PAID')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      const todayRevenue = todayOrders
        .filter(o => o.status === 'PAID')
        .reduce((sum, order) => sum + (order.totalAmount || 0), 0);

      const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
      const completedOrders = orders.filter(o => o.status === 'PAID').length;

      // Get recent orders (last 5)
      const sortedOrders = [...orders].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ).slice(0, 5);

      // Get top products (by order items)
      const productSales = {};
      orders.forEach(order => {
        if (order.orderItems) {
          order.orderItems.forEach(item => {
            const productId = item.product?.id;
            const productName = item.product?.title || 'Unknown';
            if (productSales[productId]) {
              productSales[productId].quantity += item.quantity || 0;
              productSales[productId].revenue += (item.price || 0) * (item.quantity || 0);
            } else {
              productSales[productId] = {
                name: productName,
                quantity: item.quantity || 0,
                revenue: (item.price || 0) * (item.quantity || 0)
              };
            }
          });
        }
      });

      const topProductsList = Object.entries(productSales)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setStats({
        totalUsers: users.length,
        totalProducts: products.length,
        totalCategories: categories.length,
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        totalRevenue,
        todayRevenue,
        pendingOrders,
        completedOrders,
        completionRate: orders.length > 0 ? (completedOrders / orders.length) * 100 : 0
      });

      setRecentOrders(sortedOrders);
      setTopProducts(topProductsList);

    } catch (error) {
      console.error("❌ Lỗi tải dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Status helpers
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'CONFIRMED': return 'info';
      case 'PREPARING': return 'secondary';
      case 'SERVED': return 'primary';
      case 'PAID': return 'success';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xác nhận';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'PREPARING': return 'Đang pha chế';
      case 'SERVED': return 'Đã phục vụ';
      case 'PAID': return 'Đã thanh toán';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
        <Typography textAlign="center" sx={{ mt: 2 }}>
          Đang tải dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            📊 Dashboard
          </Typography>
          <Typography color="textSecondary">
            Tổng quan hệ thống - Chào mừng trở lại, {currentUser?.username}!
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchDashboardData}
        >
          Làm mới
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #9c27b0' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Tổng doanh thu
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold" color="#9c27b0">
                    {stats.totalRevenue?.toLocaleString('vi-VN')}₫
                  </Typography>
                </Box>
                <Box
                  sx={{
                    color: '#9c27b0',
                    backgroundColor: '#f3e5f5',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex'
                  }}
                >
                  <AttachMoney />
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Hôm nay: {stats.todayRevenue?.toLocaleString('vi-VN')}₫
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #1976d2' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Tổng đơn hàng
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold" color="#1976d2">
                    {stats.totalOrders}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    color: '#1976d2',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex'
                  }}
                >
                  <ShoppingCart />
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Hôm nay: {stats.todayOrders} đơn
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #2e7d32' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Người dùng
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold" color="#2e7d32">
                    {stats.totalUsers}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    color: '#2e7d32',
                    backgroundColor: '#e8f5e8',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex'
                  }}
                >
                  <People />
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Đang hoạt động
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Products */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderLeft: '4px solid #ed6c02' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Sản phẩm
                  </Typography>
                  <Typography variant="h4" component="div" fontWeight="bold" color="#ed6c02">
                    {stats.totalProducts}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    color: '#ed6c02',
                    backgroundColor: '#fbe9e7',
                    borderRadius: '50%',
                    p: 1,
                    display: 'flex'
                  }}
                >
                  <LocalCafe />
                </Box>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {stats.totalCategories} danh mục
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Second Row - Additional Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Completion Rate */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Tỷ lệ hoàn thành
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 80,
                      height: 80,
                    }}
                  >
                    <Typography variant="h6" component="div" color="primary">
                      {stats.completionRate?.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary">
                    {stats.completedOrders}/{stats.totalOrders} đơn
                  </Typography>
                  <Chip 
                    label={`${stats.pendingOrders} đang chờ`} 
                    size="small" 
                    color="warning" 
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} sm={6} md={9}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🚀 Thao tác nhanh
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button 
                  variant="outlined" 
                  startIcon={<Inventory />}
                  component={Link}
                  to="/admin/products"
                >
                  Quản lý Sản phẩm
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Receipt />}
                  component={Link}
                  to="/admin/orders"
                >
                  Xem đơn hàng
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<People />}
                  component={Link}
                  to="/admin/users"
                >
                  Quản lý Người dùng
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<Category />}
                  component={Link}
                  to="/admin/categories"
                >
                  Danh mục
                </Button>
                <Button 
                  variant="outlined" 
                  startIcon={<TrendingUp />}
                  component={Link}
                  to="/admin/reports"
                >
                  Báo cáo
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Third Row - Recent Data */}
      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  📦 Đơn hàng gần đây
                </Typography>
                <Button 
                  size="small" 
                  component={Link}
                  to="/admin/orders"
                >
                  Xem tất cả
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#ID</TableCell>
                      <TableCell>Bàn</TableCell>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="right">Tổng tiền</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>
                          <Typography fontWeight="medium">#{order.id}</Typography>
                        </TableCell>
                        <TableCell>{order.table?.name || `Bàn ${order.tableId}`}</TableCell>
                        <TableCell>
                          <Chip 
                            label={getStatusLabel(order.status)} 
                            color={getStatusColor(order.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold">
                            {(order.totalAmount || 0).toLocaleString('vi-VN')}₫
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Top Products */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  🏆 Sản phẩm bán chạy
                </Typography>
                <Button 
                  size="small" 
                  component={Link}
                  to="/admin/products"
                >
                  Xem tất cả
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sản phẩm</TableCell>
                      <TableCell align="right">Đã bán</TableCell>
                      <TableCell align="right">Doanh thu</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProducts.map((product, index) => (
                      <TableRow key={product.id} hover>
                        <TableCell>
                          <Typography fontWeight="medium">
                            {index + 1}. {product.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={product.quantity} 
                            size="small" 
                            color="primary" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight="bold" color="primary">
                            {product.revenue.toLocaleString('vi-VN')}₫
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
