import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Container, Paper, Grid, Card, CardContent, Typography, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TextField, Chip, LinearProgress
} from '@mui/material';
import { Download, Refresh } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';

// Import jsPDF đúng cách
import jsPDF from 'jspdf';

const ReportManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
    endDate: new Date()
  });

  // Fetch orders data
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("/orders");
      const data = response.data?.data || response.data || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount || 0) + '₫';
  };

  // Thống kê tổng quan
  const overviewStats = useMemo(() => {
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= dateRange.startDate && orderDate <= dateRange.endDate;
    });

    const totalOrders = filteredOrders.length;
    const completedOrders = filteredOrders.filter(o => o.status === 'PAID').length;
    const totalRevenue = filteredOrders
      .filter(o => o.status === 'PAID')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;
    const cancelledOrders = filteredOrders.filter(o => o.status === 'CANCELLED').length;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    return {
      totalOrders,
      completedOrders,
      totalRevenue,
      averageOrderValue,
      cancelledOrders,
      completionRate,
      filteredOrders
    };
  }, [orders, dateRange]);

  // Thống kê sản phẩm bán chạy
  const productStats = useMemo(() => {
    const productMap = new Map();
    
    overviewStats.filteredOrders
      .filter(order => order.status === 'PAID' && order.orderItems)
      .forEach(order => {
        order.orderItems.forEach(item => {
          const productId = item.product?.id;
          const productName = item.product?.title || 'Sản phẩm không xác định';
          const quantity = item.quantity || 0;
          const revenue = (item.price || 0) * quantity;
          
          if (productMap.has(productId)) {
            const existing = productMap.get(productId);
            productMap.set(productId, {
              ...existing,
              quantity: existing.quantity + quantity,
              revenue: existing.revenue + revenue
            });
          } else {
            productMap.set(productId, {
              name: productName,
              quantity,
              revenue
            });
          }
        });
      });

    return Array.from(productMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [overviewStats.filteredOrders]);

  // Xuất PDF - PHIÊN BẢN ĐƠN GIẢN KHÔNG DÙNG AUTOTABLE
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Tiêu đề
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 128);
    doc.text('BÁO CÁO DOANH THU', 105, 20, { align: 'center' });
    
    // Thời gian báo cáo
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Thời gian: ${dateRange.startDate.toLocaleDateString('vi-VN')} - ${dateRange.endDate.toLocaleDateString('vi-VN')}`, 20, 35);
    doc.text(`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`, 20, 42);
    
    let yPosition = 55;

    // Tổng quan
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('TỔNG QUAN DOANH THU', 20, yPosition);
    yPosition += 10;

    // Vẽ bảng tổng quan đơn giản
    doc.setFillColor(240, 240, 240);
    doc.rect(20, yPosition, 170, 60, 'F');
    
    const overviewItems = [
      { label: 'Tổng đơn hàng', value: overviewStats.totalOrders },
      { label: 'Đơn hoàn thành', value: overviewStats.completedOrders },
      { label: 'Đơn đã hủy', value: overviewStats.cancelledOrders },
      { label: 'Tỷ lệ hoàn thành', value: overviewStats.completionRate.toFixed(1) + '%' },
      { label: 'Tổng doanh thu', value: formatCurrency(overviewStats.totalRevenue) },
      { label: 'Đơn giá trung bình', value: formatCurrency(overviewStats.averageOrderValue) }
    ];

    overviewItems.forEach((item, index) => {
      const rowY = yPosition + 10 + (index * 10);
      doc.setFontSize(10);
      doc.text(`${item.label}:`, 25, rowY);
      doc.setFont(undefined, 'bold');
      doc.text(`${item.value}`, 80, rowY);
      doc.setFont(undefined, 'normal');
    });

    yPosition += 70;

    // Top sản phẩm
    if (productStats.length > 0) {
      doc.setFontSize(12);
      doc.text('TOP SẢN PHẨM BÁN CHẠY', 20, yPosition);
      yPosition += 10;

      // Header bảng
      doc.setFillColor(200, 200, 200);
      doc.rect(20, yPosition, 170, 8, 'F');
      doc.setFontSize(9);
      doc.text('#', 25, yPosition + 6);
      doc.text('Tên sản phẩm', 35, yPosition + 6);
      doc.text('SL', 130, yPosition + 6);
      doc.text('Doanh thu', 150, yPosition + 6);
      
      yPosition += 8;

      // Dữ liệu sản phẩm
      productStats.forEach((product, index) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        const bgColor = index % 2 === 0 ? [255, 255, 255] : [245, 245, 245];
        doc.setFillColor(...bgColor);
        doc.rect(20, yPosition, 170, 8, 'F');
        
        doc.setFontSize(8);
        doc.text((index + 1).toString(), 25, yPosition + 6);
        
        // Cắt tên sản phẩm nếu quá dài
        const productName = product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name;
        doc.text(productName, 35, yPosition + 6);
        doc.text(product.quantity.toString(), 130, yPosition + 6);
        doc.text(formatCurrency(product.revenue), 150, yPosition + 6);
        
        yPosition += 8;
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(`Trang ${i} / ${pageCount}`, 105, 290, { align: 'center' });
      doc.text('Hệ thống Quản lý Quán Cafe', 105, 295, { align: 'center' });
    }

    // Lưu file
    doc.save(`bao-cao-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress />
        <Typography textAlign="center" sx={{ mt: 2 }}>
          Đang tải dữ liệu báo cáo...
        </Typography>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            📊 Báo Cáo Doanh Thu
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={exportToPDF}
              color="success"
            >
              Xuất PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchOrders}
            >
              Làm Mới
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 4, p: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Từ ngày"
                value={dateRange.startDate}
                onChange={(newValue) => setDateRange(prev => ({ ...prev, startDate: newValue }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DatePicker
                label="Đến ngày"
                value={dateRange.endDate}
                onChange={(newValue) => setDateRange(prev => ({ ...prev, endDate: newValue }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                {overviewStats.filteredOrders.length} đơn hàng trong khoảng thời gian đã chọn
              </Typography>
            </Grid>
          </Grid>
        </Card>

        {/* Overview Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { 
              label: 'Tổng đơn hàng', 
              value: overviewStats.totalOrders, 
              color: 'primary',
              icon: '📦'
            },
            { 
              label: 'Doanh thu', 
              value: formatCurrency(overviewStats.totalRevenue), 
              color: 'success',
              icon: '💰'
            },
            { 
              label: 'Đơn hoàn thành', 
              value: overviewStats.completedOrders, 
              color: 'info',
              icon: '✅'
            },
            { 
              label: 'Tỷ lệ hoàn thành', 
              value: overviewStats.completionRate.toFixed(1) + '%', 
              color: 'warning',
              icon: '📈'
            }
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ 
                bgcolor: `${stat.color}.main`, 
                color: 'white',
                height: '100%'
              }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography variant="h5">{stat.icon}</Typography>
                    <Typography variant="h6">{stat.label}</Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stat.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Two Columns Layout */}
        <Grid container spacing={3}>
          {/* Top Products */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🏆 Top Sản Phẩm
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Sản phẩm</TableCell>
                        <TableCell align="right">SL</TableCell>
                        <TableCell align="right">Doanh thu</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productStats.map((product, index) => (
                        <TableRow key={product.id} hover>
                          <TableCell>
                            <Chip label={index + 1} size="small" color="primary" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {product.name}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {product.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="bold" color="primary">
                              {formatCurrency(product.revenue)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                      {productStats.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            <Typography color="textSecondary">
                              Không có dữ liệu
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Additional Stats */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📋 Thống Kê Khác
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h3" color="primary" fontWeight="bold">
                        {overviewStats.completedOrders}
                      </Typography>
                      <Typography color="textSecondary">Đơn hoàn thành</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h3" color="error" fontWeight="bold">
                        {overviewStats.cancelledOrders}
                      </Typography>
                      <Typography color="textSecondary">Đơn đã hủy</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="success" fontWeight="bold">
                        {formatCurrency(overviewStats.averageOrderValue)}
                      </Typography>
                      <Typography color="textSecondary">Đơn giá TB</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="warning" fontWeight="bold">
                        {overviewStats.completionRate.toFixed(1)}%
                      </Typography>
                      <Typography color="textSecondary">Tỷ lệ hoàn thành</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};

export default ReportManagement;