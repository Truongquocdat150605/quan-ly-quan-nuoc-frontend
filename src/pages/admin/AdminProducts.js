import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import axios from 'axios';
import {
  Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Box, Typography,
  IconButton, Snackbar, Alert, Card, CardMedia, Chip, MenuItem, Select, FormControl, InputLabel,
  Pagination
} from "@mui/material";
import { Edit, Delete, Add, Visibility } from "@mui/icons-material";

const parseList = (res) =>
  (res?.data?.data && Array.isArray(res.data.data)) ? res.data.data :
    (Array.isArray(res?.data)) ? res.data :
      (Array.isArray(res)) ? res : [];

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [keyword, setKeyword] = useState("");
  const [formData, setFormData] = useState({
    title: "", price: "", description: "", categoryId: "", photo: ""
  });

  // Phân trang
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!user || !token) { navigate("/employee-login"); return; }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([api.get("/products"), api.get("/categories")]);
      setProducts(parseList(prodRes));
      setCategories(parseList(catRes));
    } catch (e) {
      showSnackbar("Lỗi tải dữ liệu sản phẩm/danh mục", "error");
    } finally { setLoading(false); }
  };

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const resetForm = () => {
    setFormData({ title: "", price: "", description: "", categoryId: "", photo: "" });
    setEditingProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value || "" }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024;

    if (!validTypes.includes(file.type)) {
      showSnackbar('❌ Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)', 'error');
      return;
    }

    if (file.size > maxSize) {
      showSnackbar('❌ File quá lớn. Tối đa 5MB', 'error');
      return;
    }

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const response = await axios.post("http://localhost:8081/api/upload", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30000
      });

      if (response.data && response.data.fileName) {
        setFormData((prev) => ({ ...prev, photo: response.data.fileName }));
        showSnackbar("✅ Tải ảnh lên thành công!");
      } else {
        throw new Error('Không nhận được fileName từ server');
      }
    } catch (error) {
      let errorMsg = 'Tải ảnh thất bại!';
      if (error.response?.data?.error) errorMsg = error.response.data.error;
      else if (error.response?.data?.message) errorMsg = error.response.data.message;
      else if (error.message) errorMsg = error.message;
      showSnackbar(`❌ ${errorMsg}`, "error");
    } finally {
      setUploading(false);
    }
  };

  const openCreate = () => { resetForm(); setOpenDialog(true); };
  const openEdit = (p) => {
    setFormData({
      title: p.title || "",
      price: p.price || "",
      description: p.description || "",
      categoryId: p.category?.id || "",
      photo: p.photo || ""
    });
    setEditingProduct(p);
    setOpenDialog(true);
  };
  const closeDialog = () => { setOpenDialog(false); resetForm(); };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.price || !formData.categoryId) {
      showSnackbar("Vui lòng điền đầy đủ thông tin bắt buộc", "error");
      return;
    }
    const payload = {
      title: formData.title.trim(),
      price: parseFloat(formData.price),
      description: formData.description,
      photo: formData.photo,
      category: { id: parseInt(formData.categoryId) }
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        showSnackbar("Cập nhật sản phẩm thành công");
      } else {
        await api.post("/products", payload);
        showSnackbar("Tạo sản phẩm thành công");
      }
      fetchData();
      closeDialog();
    } catch (e) {
      showSnackbar(`Không thể lưu sản phẩm: ${e?.response?.data?.message || e.message}`, "error");
    }
  };

  const openDelete = (id) => { setDeleteProductId(id); setOpenDeleteDialog(true); };
  const closeDelete = () => { setOpenDeleteDialog(false); setDeleteProductId(null); };
  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteProductId}`);
      showSnackbar("Xóa sản phẩm thành công");
      fetchData();
      closeDelete();
    } catch (e) {
      showSnackbar("Lỗi khi xóa sản phẩm", "error");
    }
  };

  const handleView = async (id) => {
    try {
      const res = await api.get(`/products/${id}`);
      const product = res?.data?.data ?? res?.data ?? null;
      if (product) {
        alert(
          `Chi tiết sản phẩm:\n\n` +
          `Tên: ${product.title}\n` +
          `Giá: ${product.price?.toLocaleString("vi-VN")} ₫\n` +
          `Mô tả: ${product.description || "—"}\n` +
          `Danh mục: ${product.category?.title || "—"}\n` +
          `Ảnh: ${product.photo || "Không có"}`
        );
      }
    } catch {
      showSnackbar("Lỗi khi lấy thông tin sản phẩm", "error");
    }
  };

  // Phân trang
  const filtered = products.filter((p) =>
    (p.title || "").toLowerCase().includes(keyword.toLowerCase())
  );
  const paginatedProducts = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          🛍️ Quản Lý Sản Phẩm
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}
          sx={{ bgcolor: "#6d4c41", "&:hover": { bgcolor: "#5d4037" } }}>
          Thêm Sản Phẩm
        </Button>
      </Box>

      {/* Search */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          label="🔍 Tìm sản phẩm..."
          variant="outlined"
          size="small"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><strong>#</strong></TableCell>
              <TableCell><strong>Ảnh</strong></TableCell>
              <TableCell><strong>Tên Sản Phẩm</strong></TableCell>
              <TableCell><strong>Giá</strong></TableCell>
              <TableCell><strong>Danh mục</strong></TableCell>
              <TableCell><strong>Mô tả</strong></TableCell>
              <TableCell><strong>Thao tác</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center"><Typography>Đang tải...</Typography></TableCell></TableRow>
            ) : paginatedProducts.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center"><Typography color="textSecondary">Không tìm thấy sản phẩm nào</Typography></TableCell></TableRow>
            ) : (
              paginatedProducts.map((product, idx) => (
                <TableRow key={product.id} hover>
                  <TableCell>{(page - 1) * rowsPerPage + idx + 1}</TableCell>
                  <TableCell>
                    {product.photo ? (
                      <Card sx={{ width: 60, height: 60 }}>
                        <CardMedia
                          component="img"
                          height="60"
                          image={`http://localhost:8081/uploads/${product.photo}`}
                          alt={product.title}
                          sx={{ objectFit: "cover" }}
                          onError={(e) => { e.target.src = "https://via.placeholder.com/60x60?text=No+Img"; }}
                        />
                      </Card>
                    ) : (
                      <Box sx={{ width: 60, height: 60, bgcolor: "#e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 1 }}>
                        <Typography variant="caption" color="textSecondary">No Image</Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell><Typography fontWeight="medium">{product.title}</Typography></TableCell>
                  <TableCell><Typography fontWeight="bold" color="primary">{product.price?.toLocaleString("vi-VN")} ₫</Typography></TableCell>
                  <TableCell><Chip label={product.category?.title || "Không rõ"} size="small" color="secondary" /></TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary" sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {product.description || "Không có mô tả"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton color="info" onClick={() => handleView(product.id)} title="Xem chi tiết"><Visibility /></IconButton>
                      <IconButton color="primary" onClick={() => openEdit(product)} title="Sửa"><Edit /></IconButton>
                      <IconButton color="error" onClick={() => openDelete(product.id)} title="Xóa"><Delete /></IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Phân trang */}
      {filtered.length > 0 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            showFirstButton 
            showLastButton 
          />
        </Box>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingProduct ? "✏️ Sửa Sản Phẩm" : "➕ Thêm Sản Phẩm Mới"}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth label="Tên sản phẩm *" name="title"
              value={formData.title} onChange={handleInputChange}
              margin="normal" required
            />
            <TextField
              fullWidth label="Giá (VND) *" name="price" type="number"
              value={formData.price} onChange={handleInputChange}
              margin="normal" required
            />
            <TextField
              fullWidth label="Mô tả" name="description" multiline rows={3}
              value={formData.description} onChange={handleInputChange}
              margin="normal"
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Danh mục *</InputLabel>
              <Select
                name="categoryId" value={formData.categoryId}
                onChange={handleInputChange} label="Danh mục *"
              >
                <MenuItem value="">-- Chọn danh mục --</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={c.id}>{c.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              component="label"
              sx={{ mt: 2 }}
              disabled={uploading}
            >
              📁 Chọn ảnh sản phẩm
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </Button>
            {formData.photo && (
              <Box mt={2}>
                <Typography variant="body2" color="textSecondary" mb={1}>Preview:</Typography>
                <Card sx={{ maxWidth: 200 }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={`http://localhost:8081/uploads/${formData.photo}`}
                    alt="Preview"
                    sx={{ objectFit: "cover" }}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/200x140?text=Invalid+Image"; }}
                  />
                </Card>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Hủy</Button>
          <Button
            onClick={handleSave} variant="contained"
            disabled={!formData.title.trim() || !formData.price || !formData.categoryId}
          >
            {editingProduct ? "Cập nhật" : "Tạo"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={openDeleteDialog} onClose={closeDelete}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography> Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác. </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDelete}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Xóa</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminProducts;