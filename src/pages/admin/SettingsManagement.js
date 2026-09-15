import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Container, Paper, Grid, Card, CardContent, Typography, Box,
  TextField, Button, Switch, FormControlLabel, Divider,
  Alert, Snackbar, FormControl, InputLabel, Select, MenuItem,
  Tab, Tabs, List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import {
  Settings, Save, Refresh, Notifications, Security,
  Payment, Store, Palette, Language
} from '@mui/icons-material';

const SettingsManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Settings state
  const [settings, setSettings] = useState({
    // General Settings
    storeName: "Coffee Shop",
    storeAddress: "123 Đường ABC, Quận 1, TP.HCM",
    storePhone: "0123 456 789",
    storeEmail: "info@coffeeshop.com",
    currency: "VND",
    language: "vi",
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    orderAlerts: true,
    lowStockAlerts: true,
    
    // Payment Settings
    cashPayment: true,
    momoPayment: true,
    bankingPayment: true,
    vnpayPayment: false,
    
    // System Settings
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: "daily",
    maxLoginAttempts: 5,
    
    // Theme Settings
    theme: "light",
    primaryColor: "#1976d2",
    sidebarColor: "#1a237e"
  });

  const [currentUser] = useState(() => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  });

  // Mock function to load settings (trong thực tế sẽ call API)
  const loadSettings = async () => {
    try {
      setLoading(true);
      // Giả lập API call
      setTimeout(() => {
        setSettings(prev => ({
          ...prev,
          // Có thể thêm dữ liệu từ API ở đây
        }));
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("❌ Lỗi tải cài đặt:", error);
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      // Giả lập API call để lưu settings
      setTimeout(() => {
        showSnackbar('Cài đặt đã được lưu thành công!', 'success');
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("❌ Lỗi lưu cài đặt:", error);
      showSnackbar('Lỗi khi lưu cài đặt!', 'error');
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetSettings = () => {
    if (window.confirm("Bạn có chắc chắn muốn reset tất cả cài đặt về mặc định?")) {
      setSettings({
        storeName: "Coffee Shop",
        storeAddress: "123 Đường ABC, Quận 1, TP.HCM",
        storePhone: "0123 456 789",
        storeEmail: "info@coffeeshop.com",
        currency: "VND",
        language: "vi",
        emailNotifications: true,
        smsNotifications: false,
        orderAlerts: true,
        lowStockAlerts: true,
        cashPayment: true,
        momoPayment: true,
        bankingPayment: true,
        vnpayPayment: false,
        maintenanceMode: false,
        autoBackup: true,
        backupFrequency: "daily",
        maxLoginAttempts: 5,
        theme: "light",
        primaryColor: "#1976d2",
        sidebarColor: "#1a237e"
      });
      showSnackbar('Đã reset cài đặt về mặc định!', 'info');
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const tabLabels = [
    { label: "Chung", icon: <Store /> },
    { label: "Thông báo", icon: <Notifications /> },
    { label: "Thanh toán", icon: <Payment /> },
    { label: "Hệ thống", icon: <Settings /> },
    { label: "Giao diện", icon: <Palette /> }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          ⚙️ Cài Đặt Hệ Thống
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadSettings}
            disabled={loading}
          >
            Làm Mới
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={saveSettings}
            disabled={loading}
          >
            Lưu Cài Đặt
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabLabels.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              label={tab.label}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Settings Content */}
      <Paper sx={{ p: 3 }}>
        {/* General Settings */}
        {tabValue === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Store /> Thông Tin Cửa Hàng
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Tên cửa hàng"
                  value={settings.storeName}
                  onChange={(e) => handleSettingChange('storeName', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Số điện thoại"
                  value={settings.storePhone}
                  onChange={(e) => handleSettingChange('storePhone', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Địa chỉ"
                  value={settings.storeAddress}
                  onChange={(e) => handleSettingChange('storeAddress', e.target.value)}
                  margin="normal"
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) => handleSettingChange('storeEmail', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Tiền tệ</InputLabel>
                  <Select
                    value={settings.currency}
                    label="Tiền tệ"
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                  >
                    <MenuItem value="VND">VND (₫)</MenuItem>
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Notification Settings */}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Notifications /> Cài Đặt Thông Báo
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Thông báo qua Email" 
                  secondary="Nhận thông báo qua email khi có đơn hàng mới"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Thông báo qua SMS" 
                  secondary="Nhận thông báo qua SMS (cần cấu hình SMS gateway)"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.smsNotifications}
                    onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Cảnh báo đơn hàng mới" 
                  secondary="Hiển thị thông báo khi có đơn hàng mới"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.orderAlerts}
                    onChange={(e) => handleSettingChange('orderAlerts', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Cảnh báo tồn kho thấp" 
                  secondary="Thông báo khi sản phẩm sắp hết hàng"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.lowStockAlerts}
                    onChange={(e) => handleSettingChange('lowStockAlerts', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Box>
        )}

        {/* Payment Settings */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Payment /> Phương Thức Thanh Toán
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Tiền mặt" 
                  secondary="Cho phép thanh toán bằng tiền mặt"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.cashPayment}
                    onChange={(e) => handleSettingChange('cashPayment', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="MoMo" 
                  secondary="Thanh toán qua ví điện tử MoMo"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.momoPayment}
                    onChange={(e) => handleSettingChange('momoPayment', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Chuyển khoản ngân hàng" 
                  secondary="Thanh toán qua QR code ngân hàng"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.bankingPayment}
                    onChange={(e) => handleSettingChange('bankingPayment', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="VNPay" 
                  secondary="Thanh toán qua cổng VNPay"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.vnpayPayment}
                    onChange={(e) => handleSettingChange('vnpayPayment', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Box>
        )}

        {/* System Settings */}
        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Settings /> Cài Đặt Hệ Thống
            </Typography>
            <List>
              <ListItem>
                <ListItemText 
                  primary="Chế độ bảo trì" 
                  secondary="Tạm thời đóng cửa hệ thống để bảo trì"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Tự động sao lưu" 
                  secondary="Tự động sao lưu dữ liệu định kỳ"
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={settings.autoBackup}
                    onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              {settings.autoBackup && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Tần suất sao lưu</InputLabel>
                    <Select
                      value={settings.backupFrequency}
                      label="Tần suất sao lưu"
                      onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                    >
                      <MenuItem value="daily">Hàng ngày</MenuItem>
                      <MenuItem value="weekly">Hàng tuần</MenuItem>
                      <MenuItem value="monthly">Hàng tháng</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}
              <Divider />
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Số lần đăng nhập tối đa"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
                  margin="normal"
                  helperText="Số lần đăng nhập sai tối đa trước khi khóa tài khoản"
                />
              </Grid>
            </List>
          </Box>
        )}

        {/* Theme Settings */}
        {tabValue === 4 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Palette /> Cài Đặt Giao Diện
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Chủ đề</InputLabel>
                  <Select
                    value={settings.theme}
                    label="Chủ đề"
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                  >
                    <MenuItem value="light">Sáng</MenuItem>
                    <MenuItem value="dark">Tối</MenuItem>
                    <MenuItem value="auto">Tự động</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Màu chủ đạo"
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => handleSettingChange('primaryColor', e.target.value)}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          backgroundColor: settings.primaryColor,
                          borderRadius: 1,
                          mr: 1
                        }}
                      />
                    )
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={handleResetSettings}
          >
            Reset Mặc Định
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={saveSettings}
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </Button>
        </Box>
      </Paper>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsManagement;