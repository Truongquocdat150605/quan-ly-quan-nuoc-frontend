import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Box, Typography, IconButton, Snackbar, Alert, Card, CardMedia,
  Chip, MenuItem, FormControl, InputLabel, Select, Switch, FormControlLabel,
  Pagination
} from '@mui/material';
import { Edit, Delete, Add, Visibility, Logout, Person } from '@mui/icons-material';

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ✅ Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const handlePageChange = (e, value) => setPage(value);

  // ✅ Load current user
  const currentUser = JSON.parse(localStorage.getItem('user'));
  useEffect(() => {
    if (!currentUser || !localStorage.getItem('token')) {
      navigate('/employee-login');
    } else {
      fetchUsers();
    }
  }, []);

  // ✅ Fetch Users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      const data = res?.data?.data || res?.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      handleError("Lỗi khi tải danh sách người dùng", error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (msg, error) => {
    console.error(msg, error);
    setSnackbar({ open: true, message: msg, severity: "error" });
  };

  const showSuccess = (msg) =>
    setSnackbar({ open: true, message: msg, severity: "success" });

  const handleLogout = () => {
    localStorage.clear();
    navigate("/employee-login");
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      username: '', email: '', password: '', fullName: '',
      phone: '', address: '', role: 'CUSTOMER', imageUrl: '', isActive: true,
    });
  };

  const [formData, setFormData] = useState({});
  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  // ✅ Create / Update
  const saveUser = async () => {
    try {
      if (!formData.username || !formData.email)
        return handleError("Vui lòng nhập đầy đủ thông tin!");

      const updatedData = { ...formData };
      if (!editingUser && !updatedData.password)
        return handleError("Mật khẩu không được để trống!");

      if (!updatedData.password) delete updatedData.password;

      const res = editingUser
        ? await api.put(`/users/${editingUser.id}`, updatedData)
        : await api.post("/users", updatedData);

      showSuccess(editingUser ? "Cập nhật thành công!" : "Thêm thành công!");
      fetchUsers();
      setOpenDialog(false);
    } catch (error) {
      handleError("Lỗi khi lưu người dùng", error);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteUserId}`);
      showSuccess("Xóa thành công!");
      fetchUsers();
      setOpenDeleteDialog(false);
    } catch (error) {
      handleError("Lỗi khi xóa người dùng", error);
    }
  };

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(keyword.toLowerCase())
  );
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" mb={3}>
        <Typography variant="h4" fontWeight="bold">👥 Quản Lý Người Dùng</Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => { resetForm(); setOpenDialog(true); }}
          sx={{ bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
        >
          Thêm Người Dùng
        </Button>
      </Box>


      {/* Search */}
      <TextField
        size="small"
        label="Tìm kiếm người dùng..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        sx={{ mb: 2, width: 350 }}
      />

      {/* TABLE */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#eee" }}>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Ảnh</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} align="center">Đang tải...</TableCell></TableRow>
              ) : paginated.length === 0 ? (
                <TableRow><TableCell colSpan={7} align="center">Không có dữ liệu</TableCell></TableRow>
              ) : paginated.map((u, i) => (
                <TableRow key={u.id} hover>
                  <TableCell>{(page - 1) * rowsPerPage + i + 1}</TableCell>
                  <TableCell>
                    {u.imageUrl ? (
                      <Card sx={{ width: 40, height: 40 }}>
                        <CardMedia component="img" image={`/images/${u.imageUrl}`} />
                      </Card>
                    ) : <Person />}
                  </TableCell>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Chip label={u.role} size="small" color={u.role === "ADMIN" ? "error" : u.role === "EMPLOYEE" ? "primary" : "info"} />
                  </TableCell>
                  <TableCell>
                    <Chip label={u.isActive ? "Hoạt động" : "Khóa"} color={u.isActive ? "success" : "error"} size="small" />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => { setEditingUser(u); setFormData(u); setOpenDialog(true); }}><Edit color="primary" /></IconButton>
                    <IconButton onClick={() => { setDeleteUserId(u.id); setOpenDeleteDialog(true); }}><Delete color="error" /></IconButton>
                    <IconButton onClick={() => alert(JSON.stringify(u, null, 2))}><Visibility /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ✅ Pagination UI */}
        <Box display="flex" justifyContent="center" p={2}>
          <Pagination
            count={Math.ceil(filtered.length / rowsPerPage)}
            page={page}
            onChange={handlePageChange}
          />
        </Box>
      </Paper>

      {/* CRUD DIALOG */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{editingUser ? "✏ Sửa User" : "➕ Thêm User"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Username" name="username" value={formData.username || ""} onChange={handleInputChange} margin="normal" />
          <TextField fullWidth label="Email" name="email" value={formData.email || ""} onChange={handleInputChange} margin="normal" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button onClick={saveUser} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRM */}
      <Dialog open={openDeleteDialog}>
        <DialogTitle>Xóa người dùng?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Xóa</Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default UserManagement;
