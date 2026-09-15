// pages/customer/CustomerOrders.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomerOrders = async () => {
    try {
      // Lấy user ID từ localStorage (khách đã login)
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData?.id) {
        console.log("Khách chưa đăng nhập");
        return;
      }

      const res = await api.get(`/orders/customer/${userData.id}`);
      const data = res.data?.data || res.data || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("❌ Lỗi tải đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerOrders();
  }, []);

  const getStatusBadge = (status) => {
    const map = {
      PENDING: { label: "🕒 Chờ xác nhận", color: "bg-warning text-dark" },
      CONFIRMED: { label: "✅ Đã xác nhận", color: "bg-info text-dark" },
      PREPARING: { label: "👨‍🍳 Đang chuẩn bị", color: "bg-primary" },
      SERVED: { label: "🍽️ Đã phục vụ", color: "bg-success" },
      PAID: { label: "💰 Đã thanh toán", color: "bg-dark" },
      CANCELLED: { label: "❌ Đã hủy", color: "bg-danger" }
    };
    const s = map[status] || { label: status, color: "bg-secondary" };
    return <span className={`badge ${s.color}`}>{s.label}</span>;
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Đang tải đơn hàng của bạn...</p>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <h2 className="text-center text-primary mb-4">
            📦 Đơn Hàng Của Tôi
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-clipboard-list fa-3x text-muted mb-3"></i>
              <p className="text-muted fs-5">Bạn chưa có đơn hàng nào</p>
              <Link to="/tables" className="btn btn-primary">
                🍽️ Đặt món ngay
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Bàn</th>
                    <th>Trạng thái</th>
                    <th>Ngày đặt</th>
                    <th>Tổng tiền</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="fw-bold">#{order.id}</td>
                      <td>{order.table?.name || `Bàn ${order.tableId}`}</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>{new Date(order.createdAt).toLocaleString("vi-VN")}</td>
                      <td className="fw-bold text-success">
                        {order.totalAmount?.toLocaleString("vi-VN")} ₫
                      </td>
                      <td>
                        <Link
                          to={`/customer/orders/${order.id}`}
                          className="btn btn-sm btn-outline-primary"
                        >
                          👀 Theo dõi
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerOrders;