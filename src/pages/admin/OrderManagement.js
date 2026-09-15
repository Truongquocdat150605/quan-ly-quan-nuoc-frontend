// src/pages/admin/OrderManagement.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";
import {
  Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Button, Box, Typography, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Tabs, Tab, Alert, LinearProgress,
  Snackbar, Pagination, Stack
} from '@mui/material';
import { Visibility, Refresh, Cancel, CheckCircle, CreditCard, QrCode2, LocalAtm } from '@mui/icons-material';
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "react-toastify";

// ================= Normalize Backend Data =================
const normalizeOrder = (raw) => {
  if (!raw) return null;
  const o = { ...raw };

  if (o.orderDetails && !o.orderItems) {
    o.orderItems = o.orderDetails.map(d => ({
      product: d.product,
      quantity: d.quantity,
      price: d.price,
      finalPrice: d.finalPrice ?? d.price
    }));
  }

  o.finalAmount =
    o.finalAmount ??
    (o.promotion
      ? o.promotion.discountType === "PERCENTAGE"
        ? o.totalAmount - (o.totalAmount * o.promotion.discountPercentage) / 100
        : o.totalAmount - o.promotion.discountAmount
      : o.totalAmount);

  if (o.finalAmount < 0) o.finalAmount = 0;
  return o;
};

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const [qrInfo, setQrInfo] = useState(null);
  const [showQR, setShowQR] = useState(false);

  const mapRef = useRef(new Map());
  const socketRef = useRef(null);

  const showToast = (msg, severity = "success") => {
    setSnack({ open: true, message: msg, severity });
  };

  const onCloseToast = () => setSnack(prev => ({ ...prev, open: false }));

  // ================= Insert/Update Data =================
  const upsertOne = (order) => {
    const o = normalizeOrder(order);
    if (!o?.id) return;

    mapRef.current.set(o.id, o);
    setOrders([...mapRef.current.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const upsertManyReplace = (list) => {
    mapRef.current = new Map();
    list.forEach(o => upsertOne(o));
  };

  // ================= Fetch Orders =================
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders");
      upsertManyReplace(res.data?.data || res.data || []);
    } catch {
      showToast("❌ Không thể tải đơn hàng!", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= WebSocket =================
  useEffect(() => {
    fetchOrders();

    const socket = new SockJS("http://localhost:8081/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 2000,
      onConnect: () => {
        client.subscribe("/topic/orders", msg => {
          try { upsertOne(JSON.parse(msg.body)); } catch {}
        });
        client.subscribe("/topic/orders/status", msg => {
          try { upsertOne(JSON.parse(msg.body)); } catch {}
        });
      }
    });

    client.activate();
    socketRef.current = client;
    return () => client?.deactivate();
  }, []);

  // ================= Status Helpers =================
  const nextStatus = s => ({ PENDING: "CONFIRMED", CONFIRMED: "PREPARING", PREPARING: "SERVED" }[s] || null);

  const statusLabel = s =>
    ({ PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", PREPARING: "Đang pha chế", SERVED: "Chờ thanh toán", PAID: "Đã thanh toán", CANCELLED: "Đã hủy" }[s] || s);

  // ================= Payments =================
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status?status=${status}`);
      showToast(`✔ Đã cập nhật trạng thái: ${statusLabel(status)}`);
      fetchOrders();
    } catch {
      showToast("❌ Không cập nhật được!", "error");
    }
  };

  const handlePayCash = async (id) => {
    if (!window.confirm("💵 Xác nhận thanh toán tiền mặt?")) return;
    try {
      await api.post(`/payments/cash/${id}`);
      showToast("💵 Thanh toán tiền mặt thành công!");
      fetchOrders();
    } catch {
      showToast("⚠ Lỗi thanh toán!", "error");
    }
  };

  const handlePayQR = async (id) => {
    try {
      const res = await api.post(`/payments/qr/${id}`);
      const payload = res?.data?.data;
      if (!payload?.qrUrl) return showToast("❌ Không tạo được QR!", "error");
      setQrInfo(payload);
      setShowQR(true);
    } catch {
      showToast("❌ Lỗi tạo mã QR!", "error");
    }
  };

  const verifyQR = async () => {
    try {
      const res = await api.get(`/payments/qr/verify/${qrInfo.orderId}`);
      showToast(res?.data?.message || "✔ Đơn đã thanh toán!");
      setShowQR(false);
      fetchOrders();
    } catch {
      showToast("⚠ Chưa nhận được thanh toán!", "warning");
    }
  };

  // ================= Filtering + Pagination =================
  const filtered = useMemo(() => {
    let list = [...orders];

    if (tabValue === 1) list = list.filter(o => o.status === "PENDING");
    if (tabValue === 2) list = list.filter(o => ["CONFIRMED", "PREPARING"].includes(o.status));
    if (tabValue === 3) list = list.filter(o => o.status === "SERVED");
    if (tabValue === 4) list = list.filter(o => o.status === "PAID");

    if (keyword.trim())
      list = list.filter(o => String(o.id).includes(keyword) || o?.table?.name?.toLowerCase().includes(keyword.toLowerCase()));

    return list;
  }, [orders, keyword, tabValue]);

  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // ================= UI =================

  if (loading)
    return (
      <Container sx={{ mt: 5 }}>
        <LinearProgress />
        <Typography align="center" sx={{ mt: 2 }}>Đang tải...</Typography>
      </Container>
    );

  return (
    <Container maxWidth="xl" sx={{ mt: 3 }}>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h4" fontWeight="bold">📦 Quản lý đơn hàng</Typography>
        <Button startIcon={<Refresh />} onClick={fetchOrders}>Làm mới</Button>
      </Box>

      {/* Tabs & Search */}
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 2 }}>
        {["Tất cả", "Chờ xác nhận", "Đang thực hiện", "Chờ thanh toán", "Hoàn thành"].map((t, i) => <Tab key={i} label={t} />)}
      </Tabs>

      <TextField placeholder="🔍 Tìm theo ID / bàn..." value={keyword} onChange={(e) => setKeyword(e.target.value)}
        size="small" sx={{ width: 300, mb: 2 }} />

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: "primary.main" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>ID</TableCell>
              <TableCell sx={{ color: "white" }}>Bàn</TableCell>
              <TableCell sx={{ color: "white" }}>Trạng thái</TableCell>
              <TableCell sx={{ color: "white" }}>Tổng tiền</TableCell>
              <TableCell sx={{ color: "white" }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center">Không có đơn</TableCell></TableRow>
            ) : paginated.map(o => (
              <TableRow key={o.id} hover>
                <TableCell>#{o.id}</TableCell>
                <TableCell><Chip label={o.table?.name || "Bàn"} /></TableCell>
                <TableCell><Chip label={statusLabel(o.status)} /></TableCell>
                <TableCell><strong>{o.finalAmount.toLocaleString("vi-VN")} ₫</strong></TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <IconButton onClick={() => { setSelectedOrder(o); setOpenDialog(true); }}><Visibility /></IconButton>

                    {o.status === "SERVED" && (
                      <>
                        <Button onClick={() => handlePayCash(o.id)} size="small">💵</Button>
                        <Button onClick={() => handlePayQR(o.id)} size="small">QR</Button>
                      </>
                    )}

                    {["PENDING", "CONFIRMED", "PREPARING"].includes(o.status) && (
                      <Button size="small" onClick={() => updateStatus(o.id, nextStatus(o.status))}>
                        <CheckCircle fontSize="small" />
                      </Button>
                    )}

                    {o.status !== "CANCELLED" && <IconButton onClick={() => updateStatus(o.id, "CANCELLED")}><Cancel /></IconButton>}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Pagination count={Math.ceil(filtered.length / rowsPerPage)} page={page} onChange={(e, v) => setPage(v)}
        sx={{ mt: 2, display: "flex", justifyContent: "center" }} />

      {/* Order Detail Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết đơn #{selectedOrder?.id}</DialogTitle>
        <DialogContent>
          {selectedOrder?.orderItems?.map((it, idx) => (
            <Box key={idx} sx={{ my: 1 }}>
              <strong>{it.product?.title}</strong> × {it.quantity} —{" "}
              {(it.finalPrice * it.quantity).toLocaleString("vi-VN")} ₫
            </Box>
          ))}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenDialog(false)}>Đóng</Button></DialogActions>
      </Dialog>

      {/* QR Payment */}
      <Dialog open={showQR} onClose={() => setShowQR(false)}>
        <DialogTitle>Thanh toán QR</DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <img src={qrInfo?.qrUrl} width="220" alt="" />
          <Typography sx={{ mt: 2 }}>Nội dung: {qrInfo?.content}</Typography>
          <Typography>Tổng tiền: {qrInfo?.amount?.toLocaleString("vi-VN")} ₫</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQR(false)}>Hủy</Button>
          <Button onClick={verifyQR}>Tôi đã chuyển tiền</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snack.open} autoHideDuration={2500} onClose={onCloseToast}>
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default OrderManagement;
