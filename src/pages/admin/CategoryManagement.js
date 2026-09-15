import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Typography,
  IconButton, Snackbar, Alert, Card, CardMedia, Pagination
} from "@mui/material";
import { Edit, Delete, Add, Visibility } from "@mui/icons-material";
import api from "../../services/api";
import axios from "axios";

const CategoryManagement = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Phân trang
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);

  // Dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    photo: ""
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories");

      const data = res.data?.data ?? res.data ?? [];
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      showSnackbar("❌ Lỗi tải danh mục", "error");
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra login + load categories
  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!user || !token) return navigate("/employee-login");
    fetchData();
  }, []);

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const resetForm = () => {
    setEditing(null);
    setFormData({ title: "", description: "", photo: "" });
  };

  const openCreate = () => {
    resetForm();
    setOpenDialog(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setFormData({
      title: cat.title,
      description: cat.description || "",
      photo: cat.photo || ""
    });
    setOpenDialog(true);
  };

  const closeDialog = () => {
    resetForm();
    setOpenDialog(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const up = new FormData();
    up.append("file", file);

    try {
      const res = await axios.post("http://localhost:8081/api/upload", up, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.fileName) {
        setFormData((p) => ({ ...p, photo: res.data.fileName }));
        showSnackbar("✅ Upload ảnh thành công!");
      }
    } catch (err) {
      showSnackbar("❌ Upload ảnh thất bại!", "error");
    } finally {
      setUploading(false);
    }
  };

const handleSave = async () => {
  if (!formData.title.trim()) {
    showSnackbar("⚠️ Tên danh mục không được bỏ trống!", "error");
    return;
  }

  try {
    if (editing) {
      await api.put(`/categories/${editing.id}`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      showSnackbar("✅ Cập nhật danh mục thành công!");
    } else {
      await api.post("/categories", formData, {
        headers: { "Content-Type": "application/json" },
      });
      showSnackbar("✅ Tạo danh mục thành công!");
    }

    fetchData();
    closeDialog();
    
  } catch (err) {
    console.log("🚨 Chi tiết lỗi:", err);
    const message = err?.response?.data?.message || "❌ Lỗi khi lưu danh mục!";
    showSnackbar(message, "error");
  }
};




  const openDelete = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const closeDelete = () => setOpenDeleteDialog(false);

  const handleDelete = async () => {
    try {
      await api.delete(`/categories/${deleteId}`);
      showSnackbar("🗑️ Xóa danh mục thành công!");
      fetchData();
      closeDelete();
    } catch (err) {
      showSnackbar("❌ Không thể xóa danh mục!", "error");
    }
  };

  // Pagination
  const paginated = categories.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(categories.length / rowsPerPage);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">📂 Quản Lý Danh Mục</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}
          sx={{ bgcolor: "#6d4c41", "&:hover": { bgcolor: "#5d4037" } }}>
          Thêm Danh Mục
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "#ececec" }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Ảnh</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center">⏳ Đang tải...</TableCell></TableRow>
            ) : paginated.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">⚠️ Chưa có danh mục</TableCell></TableRow>
            ) : (
              paginated.map((cat, idx) => (
                <TableRow key={cat.id}>
                  <TableCell>{(page - 1) * rowsPerPage + idx + 1}</TableCell>
                  <TableCell>
                    {cat.photo ? (
                      <Card sx={{ width: 60, height: 60 }}>
                        <CardMedia
                          component="img"
                          height="60"
                          src={`http://localhost:8081/uploads/${cat.photo}`}
                          onError={(e) => { e.target.src = "https://via.placeholder.com/60" }}
                        />
                      </Card>
                    ) : "—"}
                  </TableCell>
                  <TableCell>{cat.title}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {cat.description || "—"}
                  </TableCell>
                  <TableCell>
                    <IconButton color="info" onClick={() => alert(`Tên: ${cat.title}\nMô tả: ${cat.description}`)}>
                      <Visibility />
                    </IconButton>
                    <IconButton color="primary" onClick={() => openEdit(cat)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => openDelete(cat.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {categories.length > 0 && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            page={page}
            count={totalPages}
            onChange={(e, val) => setPage(val)}
            color="primary"
          />
        </Box>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={closeDialog}>
        <DialogTitle>{editing ? "✏️ Sửa Danh Mục" : "➕ Thêm Danh Mục"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Tên danh mục *" name="title"
            value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal" />

          <TextField fullWidth label="Mô tả" name="description"
            multiline rows={3} value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal" />

          {/* Upload ảnh */}
          <Button component="label" variant="outlined" sx={{ mt: 2 }} disabled={uploading}>
            📁 Chọn ảnh danh mục
            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
          </Button>

          {formData.photo && (
            <Card sx={{ maxWidth: 160, mt: 2 }}>
              <CardMedia component="img" height="140"
                src={`http://localhost:8081/uploads/${formData.photo}`} />
            </Card>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Đóng</Button>
          <Button variant="contained" onClick={handleSave}>Lưu</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={closeDelete}>
        <DialogTitle>Bạn chắc chứ?</DialogTitle>
        <DialogContent>Xóa danh mục sẽ không thể hoàn tác.</DialogContent>
        <DialogActions>
          <Button onClick={closeDelete}>Hủy</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Xóa</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default CategoryManagement;
