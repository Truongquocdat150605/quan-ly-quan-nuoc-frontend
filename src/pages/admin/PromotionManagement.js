// src/pages/admin/PromotionManagement.js
import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import {
  Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Box, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Chip, Snackbar, Alert, Grid, Card, CardContent, Pagination,
  FormControl, InputLabel, Select, Switch, FormControlLabel
} from "@mui/material";
import { Add, Edit, Delete, Visibility, ToggleOn, ToggleOff, Search } from "@mui/icons-material";

// Chuẩn hoá list trả về từ backend (data | data.data | array)
const parseList = (res) =>
  (res?.data?.data && Array.isArray(res.data.data)) ? res.data.data :
  (Array.isArray(res?.data)) ? res.data :
  (Array.isArray(res)) ? res : [];

const STATUS_FILTERS = [
  { value: "ALL", label: "Tất cả" },
  { value: "ACTIVE", label: "Đang chạy" },
  { value: "UPCOMING", label: "Sắp diễn ra" },
  { value: "NEARING", label: "Sắp hết hạn (≤ 3 ngày)" },
  { value: "PAUSED", label: "Tạm dừng" },
  { value: "EXPIRED", label: "Hết hạn" },
];

const PromotionManagement = () => {
  // Data
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search / filter
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("ALL");

  // Dialogs + form
  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);

  const today = new Date();

  // Helper ngày
  const toDate = (val) => (val ? new Date(val) : null);
  const daysLeft = (p) => {
    const end = toDate(p.endDate);
    if (!end) return null;
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };
  const isExpired = (p) => {
    const end = toDate(p.endDate);
    return !!end && end < today;
  };
  const isUpcoming = (p) => {
    const start = toDate(p.startDate);
    return !!start && start > today;
  };
  const isNearing = (p) => {
    const d = daysLeft(p);
    return p.isActive && d !== null && d >= 0 && d <= 3;
  };

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    discountType: "PERCENTAGE", // PERCENTAGE | FIXED_AMOUNT
    discountPercentage: 0,
    discountAmount: 0,
    startDate: "",
    endDate: "",
    isActive: true,
    usageLimit: ""
  });

  // Fetch list
  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/promotions");
      setPromotions(parseList(res));
    } catch (e) {
      showSnackbar("Không thể tải danh sách khuyến mãi", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  // Filtered + paginated
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    let list = promotions.filter((p) =>
      [p.name, p.code, p.description]
        .filter(Boolean)
        .some((x) => x.toLowerCase().includes(q))
    );

    switch (status) {
      case "ACTIVE":
        list = list.filter((p) => p.isActive && !isExpired(p));
        break;
      case "UPCOMING":
        list = list.filter((p) => isUpcoming(p));
        break;
      case "NEARING":
        list = list.filter((p) => isNearing(p));
        break;
      case "PAUSED":
        list = list.filter((p) => !p.isActive && !isExpired(p));
        break;
      case "EXPIRED":
        list = list.filter((p) => isExpired(p));
        break;
      default:
        break; // ALL
    }

    return list.sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0));
  }, [promotions, keyword, status]);

  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;

  // Snackbar helper
  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  // Dialog helpers
  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountPercentage: 0,
      discountAmount: 0,
      startDate: "",
      endDate: "",
      isActive: true,
      usageLimit: ""
    });
    setEditing(null);
  };

  const openCreate = () => {
    resetForm();
    setOpenDialog(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setFormData({
      name: p.name || "",
      code: p.code || "",
      description: p.description || "",
      discountType: p.discountType || "PERCENTAGE",
      discountPercentage: p.discountPercentage || 0,
      discountAmount: p.discountAmount || 0,
      startDate: p.startDate ? p.startDate.slice(0, 10) : "",
      endDate: p.endDate ? p.endDate.slice(0, 10) : "",
      isActive: !!p.isActive,
      usageLimit: p.usageLimit ?? ""
    });
    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const openDelete = (id) => {
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };
  const closeDelete = () => {
    setDeleteId(null);
    setOpenDeleteDialog(false);
  };

  // CRUD
  const handleSave = async () => {
    try {
      // Validate cơ bản
      if (!formData.name.trim() || !formData.code.trim()) {
        showSnackbar("Vui lòng nhập Tên & Mã khuyến mãi", "error");
        return;
      }
      if (!formData.startDate || !formData.endDate) {
        showSnackbar("Vui lòng chọn ngày bắt đầu & kết thúc", "error");
        return;
      }
      if (formData.discountType === "PERCENTAGE" && (formData.discountPercentage <= 0 || formData.discountPercentage > 100)) {
        showSnackbar("Phần trăm giảm phải trong (0, 100]", "error");
        return;
      }
      if (formData.discountType === "FIXED_AMOUNT" && formData.discountAmount <= 0) {
        showSnackbar("Số tiền giảm phải lớn hơn 0", "error");
        return;
      }

      // Chuẩn payload
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description?.trim() || "",
        discountType: formData.discountType,
        discountPercentage: formData.discountType === "PERCENTAGE" ? Number(formData.discountPercentage) : null,
        discountAmount: formData.discountType === "FIXED_AMOUNT" ? Number(formData.discountAmount) : null,
        startDate: formData.startDate + "T00:00:00",
        endDate: formData.endDate + "T23:59:59",
        isActive: formData.isActive,
        usageLimit: formData.usageLimit === "" ? null : Number(formData.usageLimit),
        usedCount: editing?.usedCount ?? 0
      };

      if (editing) {
        await api.put(`/promotions/${editing.id}`, payload);
        showSnackbar("Cập nhật khuyến mãi thành công");
      } else {
        await api.post("/promotions", payload);
        showSnackbar("Tạo khuyến mãi thành công");
      }

      fetchPromotions();
      closeDialog();
    } catch (e) {
      showSnackbar(e?.response?.data?.message || "Không thể lưu khuyến mãi", "error");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/promotions/${deleteId}`);
      showSnackbar("Xóa khuyến mãi thành công");
      fetchPromotions();
      closeDelete();
    } catch (e) {
      showSnackbar("Không thể xóa khuyến mãi", "error");
    }
  };

  const toggleActive = async (p) => {
    try {
      const payload = {
        ...p,
        // Giữ đúng fields server mong đợi
        discountPercentage: p.discountType === "PERCENTAGE" ? p.discountPercentage : null,
        discountAmount: p.discountType === "FIXED_AMOUNT" ? p.discountAmount : null,
        isActive: !p.isActive
      };
      await api.put(`/promotions/${p.id}`, payload);
      fetchPromotions();
    } catch (e) {
      showSnackbar("Không thể đổi trạng thái", "error");
    }
  };

  // UI helpers
  const renderStatusChip = (p) => {
    if (isExpired(p)) return <Chip label="Hết hạn" color="error" size="small" />;
    if (isUpcoming(p)) return <Chip label="Sắp diễn ra" color="default" size="small" />;
    if (isNearing(p)) return <Chip label="Sắp hết hạn" color="warning" size="small" />;
    return <Chip label={p.isActive ? "Đang chạy" : "Tạm dừng"} color={p.isActive ? "success" : "default"} size="small" />;
  };

  const discountText = (p) =>
    p.discountType === "PERCENTAGE"
      ? `${p.discountPercentage}%`
      : `${(p.discountAmount || 0).toLocaleString("vi-VN")}₫`;

  // Render
  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      {/* Header + Controls */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">🎁 Quản Lý Khuyến Mãi</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}
          sx={{ bgcolor: "#6d4c41", "&:hover": { bgcolor: "#5d4037" } }}>
          Thêm Khuyến Mãi
        </Button>
      </Box>

      {/* Summary cards */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="h5">{promotions.length}</Typography>
            <Typography color="text.secondary">Tổng số mã</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="h5">{promotions.filter((p) => p.isActive && !isExpired(p)).length}</Typography>
            <Typography color="text.secondary">Đang chạy</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="h5">{promotions.filter(isNearing).length}</Typography>
            <Typography color="text.secondary">Sắp hết hạn</Typography>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
            <Typography variant="h5">{promotions.filter(isExpired).length}</Typography>
            <Typography color="text.secondary">Đã hết hạn</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box display="flex" gap={2} alignItems="center" mb={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <Search fontSize="small" />
          <TextField
            size="small"
            label="Tìm theo mã / tên / mô tả"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            sx={{ width: 320 }}
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            label="Trạng thái"
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          >
            {STATUS_FILTERS.map((s) => (
              <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              <TableCell><strong>Mã</strong></TableCell>
              <TableCell><strong>Tên</strong></TableCell>
              <TableCell><strong>Giảm</strong></TableCell>
              <TableCell><strong>Thời gian</strong></TableCell>
              <TableCell><strong>Giới hạn</strong></TableCell>
              <TableCell><strong>Trạng thái</strong></TableCell>
              <TableCell align="right"><strong>Thao tác</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center">Đang tải...</TableCell></TableRow>
            ) : paginated.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center">Không có khuyến mãi phù hợp</TableCell></TableRow>
            ) : (
              paginated.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell><Chip label={p.code} size="small" color="primary" variant="outlined" /></TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{discountText(p)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {p.startDate ? new Date(p.startDate).toLocaleDateString("vi-VN") : "—"}
                      {" → "}
                      {p.endDate ? new Date(p.endDate).toLocaleDateString("vi-VN") : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {p.usageLimit ? `${p.usedCount || 0}/${p.usageLimit}` : "Không giới hạn"}
                  </TableCell>
                  <TableCell>{renderStatusChip(p)}</TableCell>
                  <TableCell align="right">
                    <IconButton color="info" onClick={() => openEdit(p)} title="Sửa">
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => openDelete(p.id)} title="Xóa">
                      <Delete />
                    </IconButton>
                    <IconButton
                      color={p.isActive ? "success" : "default"}
                      onClick={() => toggleActive(p)}
                      title={p.isActive ? "Tạm dừng" : "Kích hoạt"}
                    >
                      {p.isActive ? <ToggleOn /> : <ToggleOff />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {filtered.length > 0 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, v) => setPage(v)}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={openDialog} onClose={closeDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? "✏️ Sửa khuyến mãi" : "➕ Thêm khuyến mãi"}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth label="Tên khuyến mãi *" value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  margin="normal" required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth label="Mã khuyến mãi *" value={formData.code}
                  onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                  margin="normal" required
                />
              </Grid>
            </Grid>

            <TextField
              fullWidth label="Mô tả" value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              margin="normal" multiline rows={2}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Loại giảm</InputLabel>
                  <Select
                    label="Loại giảm"
                    value={formData.discountType}
                    onChange={(e) => setFormData((p) => ({ ...p, discountType: e.target.value }))}
                  >
                    <MenuItem value="PERCENTAGE">Phần trăm (%)</MenuItem>
                    <MenuItem value="FIXED_AMOUNT">Số tiền cố định</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                {formData.discountType === "PERCENTAGE" ? (
                  <TextField
                    fullWidth type="number" label="Phần trăm giảm *"
                    value={formData.discountPercentage}
                    onChange={(e) => setFormData((p) => ({ ...p, discountPercentage: e.target.value }))}
                    margin="normal" inputProps={{ min: 0, max: 100 }}
                    required
                  />
                ) : (
                  <TextField
                    fullWidth type="number" label="Số tiền giảm *"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData((p) => ({ ...p, discountAmount: e.target.value }))}
                    margin="normal" inputProps={{ min: 0 }}
                    required
                  />
                )}
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth type="number" label="Giới hạn lượt dùng"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData((p) => ({ ...p, usageLimit: e.target.value }))}
                  margin="normal" placeholder="Để trống nếu không giới hạn"
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth type="date" label="Ngày bắt đầu *"
                  value={formData.startDate}
                  onChange={(e) => setFormData((p) => ({ ...p, startDate: e.target.value }))}
                  margin="normal" InputLabelProps={{ shrink: true }} required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth type="date" label="Ngày kết thúc *"
                  value={formData.endDate}
                  onChange={(e) => setFormData((p) => ({ ...p, endDate: e.target.value }))}
                  margin="normal" InputLabelProps={{ shrink: true }} required
                />
              </Grid>
            </Grid>

            <FormControlLabel
              control={<Switch checked={formData.isActive}
                onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))} />}
              label="Kích hoạt ngay"
              sx={{ mt: 1 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Hủy</Button>
          <Button onClick={handleSave} variant="contained">
            {editing ? "Cập nhật" : "Tạo"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={closeDelete}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc muốn xóa khuyến mãi này? Hành động không thể hoàn tác.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDelete}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Xóa</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open} autoHideDuration={3500}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default PromotionManagement;
