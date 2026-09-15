import React, { useEffect, useMemo, useRef, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import axios from "axios";
const API_BASE_URL = 'http://localhost:8081/api';

const EmployeeOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const ordersMapRef = useRef(new Map());
  const wsRef = useRef(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [qrInfo, setQrInfo] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const sortByCreatedDesc = (arr) =>
    [...arr].sort(
      (a, b) =>
        new Date(b.createdAt || b.updatedAt || 0) -
        new Date(a.createdAt || a.updatedAt || 0)
    );

  const setFromMap = () => {
    const list = Array.from(ordersMapRef.current.values());
    setOrders(sortByCreatedDesc(list));
  };
  const openPaymentModal = (order) => {
    setSelectedOrder(order);
    setShowPaymentModal(true);
  };

  const handleSelectPayment = async (method) => {
    if (!selectedOrder || !selectedOrder.id) {
      toast.error("Không có đơn hàng hợp lệ!");
      return;
    }

    setShowPaymentModal(false);

    const orderId = selectedOrder.id; // 💡 Gọn hơn

    switch (method) {
      case "CASH":
        await handlePaymentCash(orderId); // ✅ Sửa lại
        break;
      case "MOMO":
        await handlePaymentMomo(orderId); // ✅ Sửa lại
        break;
      case "QR":
        await handlePaymentOnline(orderId); // ✅ Sửa lại
        break;
      case "STRIPE":
        await handlePaymentStripe(orderId); // ✅ Sửa lại
        break;
      case "PAYOS":
        await handlePaymentPayOS(orderId);
        break;
      default:
        alert("Không hợp lệ!");
    }
  };




  const upsertOne = (order) => {
    if (!order || !order.id) return;
    const prev = ordersMapRef.current.get(order.id) || {};
    ordersMapRef.current.set(order.id, { ...prev, ...order });
    setFromMap();
  };

  const upsertManyReplace = (list) => {
    ordersMapRef.current = new Map();
    (list || []).forEach((o) => {
      if (o?.id) ordersMapRef.current.set(o.id, o);
    });
    setFromMap();
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      const data = res.data?.data || res.data || [];
      upsertManyReplace(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Loi khi tai danh sach don hang:", e);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status?status=${newStatus}`);
      upsertOne({ id: orderId, status: newStatus });
    } catch (e) {
      console.error("Loi cap nhat trang thai:", e);
      alert("Cap nhat that bai, vui long thu lai!");
    }
  };

  const handlePaymentCash = async (orderId) => {
    if (!window.confirm(`Xác nhận thanh toán tiền mặt cho đơn #${orderId}?`))
      return;

    try {
      const res = await api.post(`/payments/cash/${orderId}`);
      toast.success(res.message || "✅ Thanh toán tiền mặt thành công!");
      upsertOne({ id: orderId, status: "PAID" });
    } catch (e) {
      console.error("Lỗi thanh toán tiền mặt:", e);
      toast.error("❌ Thanh toán thất bại!");
    }
  };

  const handlePaymentMomo = async (orderId) => {
    if (!window.confirm(`Xac nhan thanh toan MoMo cho don #${orderId}?`))
      return;

    try {
      const res = await api.post(`/payments/momo/${orderId}`);

      if (res.success && res.payUrl) {
        console.log("MOMO PAY URL:", res.payUrl);
        window.open(res.payUrl, "_blank");
        alert("Dang mo trang MoMo Sandbox... Vui long nhap:\nSDT: 0389555555\nMat khau: 123456");
      } else {
        alert(res.message || "Khong nhan duoc link thanh toan!");
      }
    } catch (error) {
      console.error("Loi MoMo:", error);
      alert("Loi thanh toan MoMo: " + (error?.response?.data?.message || error.message));
    }
  };

  const handlePaymentStripe = async (orderId) => {
    if (!window.confirm(`Xac nhan thanh toan Stripe cho don #${orderId}?`))
      return;

    try {
      const res = await api.post(`/payments/stripe/${orderId}`);
      console.log("Full response:", res);

      if (res && res.url) {
        console.log("STRIPE CHECKOUT URL:", res.url);
        window.location.href = res.url;
      } else {
        console.error("No URL in response:", res);
        alert("Khong nhan duoc link thanh toan tu server!");
      }
    } catch (error) {
      console.error("Loi Stripe:", error);
      alert("Loi thanh toan Stripe: " + (error.response?.data?.message || error.message));
    }
  };
  // const handlePayWithPayOS = async (orderId) => {
  //   try {
  //     const res = await api.post(`/payments/payos/${orderId}`);
  //     if (res.data.success) {
  //       window.location.href = res.data.payUrl;
  //     } else {
  //       toast.error("❌ Không thể tạo thanh toán PayOS");
  //     }
  //   } catch (err) {
  //     toast.error("❌ Lỗi gọi API PayOS");
  //   }
  // };
  const handlePaymentPayOS = async (orderId) => {
    try {
      const res = await api.post(`/payments/payos/${orderId}`);

      if (res?.success && res?.payUrl) {
        window.open(res.payUrl, "_blank"); // 🔥 tránh browser block popup
        return;
      }

      console.error("PayOS Response:", res);
      toast.error(res?.message || "❌ PayOS không trả link!");


    } catch (error) {
      toast.error("❌ PayOS lỗi: " + (error.response?.data?.message || error.message));
    }
  };





  const handlePaymentOnline = async (orderId) => {
    try {
      const res = await api.post(`/payments/qr/${orderId}`);

      if (!res.success || !res.data?.qrUrl) {
        alert(res.message || "Khong the tao ma QR!");
        return;
      }

      const { qrUrl, content } = res.data;
      setQrInfo({ qrUrl, content, orderId });
      setShowQR(true);
    } catch (err) {
      alert("Loi tao ma QR!");
    }
  };

  const handleVerifyPayment = async (orderId) => {
    if (!window.confirm("Xac nhan da thanh toan?")) return;

    try {
      await api.put(`/orders/${orderId}/status?status=PAID`);
      alert("Thanh toan xac nhan thanh cong!");
      setShowQR(false);
      fetchOrders();
    } catch (err) {
      alert("Loi xac nhan!");
    }
  };

  const verifyPayment = async (orderId) => {
    try {
      const res = await api.get(`/payments/qr/verify/${orderId}`);
      alert(res.message || "Thanh toan thanh cong!");
      setShowQR(false);
      fetchOrders();
    } catch (e) {
      alert("Chua nhan duoc thanh toan, vui long cho!");
    }
  };

  useEffect(() => {
    let client;
    (async () => {
      await fetchOrders();
      const socket = new SockJS("http://localhost:8081/ws");
      client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 3000,
        onConnect: () => {
          console.log("WebSocket connected!");
          client.subscribe("/topic/orders", (msg) => {
            try {
              const order = JSON.parse(msg.body);
              upsertOne(order);
            } catch (e) {
              console.warn("WS /topic/orders parse error", e);
            }
          });
          client.subscribe("/topic/orders/status", (msg) => {
            try {
              const order = JSON.parse(msg.body);
              upsertOne(order);
            } catch (e) {
              console.warn("WS /topic/orders/status parse error", e);
            }
          });
        },
      });
      client.activate();
      wsRef.current = client;
    })();

    return () => {
      try {
        wsRef.current?.deactivate();
      } catch (_) { }
    };
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stripeSuccess = urlParams.get('stripe_success');
    const orderId = urlParams.get('orderId');

    const handleStripeSuccess = async () => {
      if (stripeSuccess === 'true' && orderId) {
        try {
          console.log("Đang xac nhan thanh toan Stripe cho order #" + orderId);

          // 1. Cập nhật ORDER status thành PAID
          await api.put(`/orders/${orderId}/status?status=PAID`);

          // 2. Cập nhật PAYMENT status thành COMPLETED
          await api.post(`/payments/stripe/complete/${orderId}`);

          alert("Thanh toan Stripe thanh cong! Don #" + orderId + " da duoc cap nhat.");
          await fetchOrders();

        } catch (error) {
          console.error("Loi xac nhan Stripe:", error);

          // Fallback: thử dùng cash payment
          try {
            await api.post(`/payments/cash/${orderId}`);
            alert("Da cap nhat trang thai thanh toan!");
            await fetchOrders();
          } catch (error2) {
            console.error("Loi cash payment:", error2);
            alert("Thanh toan thanh cong! Vui long refresh trang de xem trang thai moi.");
          }
        } finally {
          window.history.replaceState({}, '', '/employee');
        }
      }
    };

    handleStripeSuccess();

    if (urlParams.get('stripe_canceled') === 'true') {
      alert('Thanh toan Stripe da bi huy!');
      window.history.replaceState({}, '', '/employee');
    }
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    const orderId = params.get("orderId");

    if (!orderId) return;

    if (status === "PAID") {
      api.post(`/payments/confirm/${orderId}`)
        .then(() => toast.success("🎉 Thanh toán PayOS thành công!"))
        .catch(() => toast.error("⚠️ Không xác nhận đơn được!"));
    } else {
      toast.warning("⚠️ Thanh toán PayOS bị hủy hoặc thất bại!");
    }

    setTimeout(() => {
      window.location.href = "/employee";
    }, 4000);

  }, []);

  const getStatusBadge = (status) => {
    const map = {
      PENDING: { label: "Cho xac nhan", color: "bg-warning text-dark" },
      CONFIRMED: { label: "Da xac nhan", color: "bg-info text-dark" },
      PREPARING: { label: "Dang chuan bi", color: "bg-primary" },
      SERVED: { label: "Da phuc vu", color: "bg-success" },
      PAID: { label: "Da thanh toan", color: "bg-dark" },
      CANCELLED: { label: "Da huy", color: "bg-danger" },
    };
    const s = map[status] || { label: status, color: "bg-secondary" };
    return <span className={`badge fs-6 px-3 py-2 ${s.color}`}>{s.label}</span>;
  };

  const getNextStatus = (current) => {
    const next = { PENDING: "CONFIRMED", CONFIRMED: "PREPARING", PREPARING: "SERVED" };
    return next[current] || null;
  };

  const filteredOrders = useMemo(() => {
    const key = keyword.toLowerCase();
    return orders.filter((o) => {
      const matchesKeyword =
        String(o.id).includes(key) ||
        o.table?.name?.toLowerCase().includes(key) ||
        o.status?.toLowerCase().includes(key);
      const matchesStatus = !statusFilter || o.status === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [orders, keyword, statusFilter]);

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-3">Dang tai danh sach don hang...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold mb-0">Quan Ly Don Hang</h2>

        <div className="d-flex align-items-center gap-2">
          <select
            className="form-select"
            style={{ width: 180 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tat ca trang thai</option>
            <option value="PENDING">Cho xac nhan</option>
            <option value="CONFIRMED">Da xac nhan</option>
            <option value="PREPARING">Dang chuan bi</option>
            <option value="SERVED">Da phuc vu</option>
            <option value="PAID">Da thanh toan</option>
            <option value="CANCELLED">Da huy</option>
          </select>

          <div className="input-group" style={{ width: 260 }}>
            <input
              type="text"
              className="form-control"
              placeholder="Tim theo ID, ban, trang thai..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button className="btn btn-outline-secondary">
              <i className="fas fa-search" />
            </button>
          </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
          <p className="text-muted fs-5">Khong co don hang phu hop.</p>
        </div>
      ) : (
        <div className="table-responsive shadow-lg rounded-3">
          <table className="table table-striped table-bordered align-middle text-center">
            <thead className="table-dark">
              <tr>
                <th>#</th>
                <th>Ban</th>
                <th>Trang thai</th>
                <th>Ngay tao</th>
                <th>Tong tien</th>
                <th>Thao tac</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id}>
                  <td className="fw-bold">#{o.id}</td>
                  <td>{o.table?.name || `Ban ${o.tableId || "-"}`}</td>
                  <td>{getStatusBadge(o.status)}</td>
                  <td>{new Date(o.createdAt).toLocaleString("vi-VN")}</td>
                  <td>
                    {o.promotion ? (
                      <>
                        <span className="text-decoration-line-through text-danger">
                          {o.totalAmount?.toLocaleString("vi-VN")} ₫
                        </span>
                        <br />
                        <span className="fw-bold text-success">
                          {(o.finalAmount || o.totalAmount)?.toLocaleString("vi-VN")} ₫
                        </span>
                        <br />
                        <small className="text-primary">
                          {o.promotion?.code}
                        </small>
                      </>
                    ) : (
                      <span className="fw-bold">
                        {o.totalAmount?.toLocaleString("vi-VN")} ₫
                      </span>
                    )}
                  </td>
                  <td>
                    {["PENDING", "CONFIRMED", "PREPARING"].includes(o.status) && (
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => updateStatus(o.id, getNextStatus(o.status))}
                      >
                        {getStatusBadge(getNextStatus(o.status))}
                      </button>
                    )}

                    {o.status === "SERVED" && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => openPaymentModal(o)} // ✅ đúng: truyền cả order object
                      >
                        💳 Thanh toán
                      </button>
                    )}


                    {o.status !== "PAID" && o.status !== "CANCELLED" && (
                      <button
                        className="btn btn-sm btn-outline-danger me-2"
                        onClick={() => updateStatus(o.id, "CANCELLED")}
                      >
                        Huy
                      </button>
                    )}

                    <Link
                      to={`/employee/orders/${o.id}`}
                      className="btn btn-sm btn-outline-info"
                    >
                      Xem chi tiet
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showPaymentModal && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4 text-center">
              <h4 className="fw-bold mb-3">💳 Chọn phương thức thanh toán</h4>

              <button className="btn btn-outline-dark w-100 mb-2"
                onClick={() => handleSelectPayment("CASH")}>
                💵 Thanh toán tiền mặt
              </button>

              {/* <button className="btn btn-outline-warning w-100 mb-2"
                onClick={() => handleSelectPayment("MOMO")}>
                📱 Ví MoMo
              </button> */}

              <button className="btn btn-outline-primary w-100 mb-2"
                onClick={() => handleSelectPayment("QR")}>
                🏧 QR Banking
              </button>

              <button className="btn btn-outline-info text-white w-100 mb-2"
                onClick={() => handleSelectPayment("STRIPE")}>
                💳 Stripe Visa/Master
              </button>
              <button className="btn btn-outline-dark w-100 mb-2"
                onClick={() => handleSelectPayment("PAYOS")}>
                🧾 PayOS
              </button>
              <button className="btn btn-secondary w-100 mt-3"
                onClick={() => setShowPaymentModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {showQR && qrInfo && (
        <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-center p-4 rounded-3 shadow-lg">
              <h4 className="fw-bold mb-3 text-primary">Thanh Toan QR Banking</h4>
              <img src={qrInfo.qrUrl}
                className="img-fluid border p-2 rounded"
                style={{ width: 230 }}
                alt="QR Banking" />
              <div className="bg-light p-2 mt-3 rounded">
                <strong>Noi dung:</strong>
                <span className="ms-2 text-success">{qrInfo.content}</span>
              </div>
              <button className="btn btn-success w-100 mt-3"
                onClick={() => handleVerifyPayment(qrInfo.orderId)}>
                Toi da chuyen khoan
              </button>
              <button className="btn btn-secondary w-100 mt-2"
                onClick={() => setShowQR(false)}>
                Dong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeOrders;