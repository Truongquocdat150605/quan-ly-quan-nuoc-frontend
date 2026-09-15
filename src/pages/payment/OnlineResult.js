import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";
import api from "../../services/api";
import { toast } from "react-toastify";

const OnlineResult = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // ---- PAYOS ----
  const payosStatus = params.get("status");
  const payosOrder = params.get("orderCode");

  // ---- STRIPE ----
  const stripeSuccess = params.get("success");
  const stripeCanceled = params.get("canceled");

  // ---- MOMO ----
  const momoResult = params.get("resultCode");
  const momoOrder = params.get("orderId");

  let finalStatus = "FAILED";
  let message = "Thanh toán thất bại 😢";

  // 🎯 Quy tắc xác định thành công
  if (payosStatus === "PAID") {
    finalStatus = "SUCCESS";
    message = `Thanh toán PayOS thành công cho đơn #${payosOrder}`;
  } else if (stripeSuccess === "true") {
    finalStatus = "SUCCESS";
    message = `Thanh toán Stripe thành công!`;
  } else if (momoResult === "0") {
    finalStatus = "SUCCESS";
    message = `Thanh toán MoMo thành công cho đơn #${momoOrder}`;
  } else if (stripeCanceled === "true") {
    finalStatus = "CANCEL";
    message = "Bạn đã hủy thanh toán Stripe!";
  }

  // 🛠 Gọi API backend để update DB nếu thanh toán OK
  useEffect(() => {
    let orderId = payosOrder || momoOrder;

    if (finalStatus === "SUCCESS" && orderId) {
      api.post(`/payments/confirm/${orderId}`)
        .then(() => toast.success("🎉 Hệ thống đã xác nhận thanh toán!"))
        .catch(() => toast.error("⚠️ Không xác nhận được đơn, vui lòng kiểm tra backend!"));
    }

    const timer = setTimeout(() => {
      navigate("/employee");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{ background: "radial-gradient(circle, #1a1a1a, #000)" }}
    >
      <div className="text-center text-light p-5 rounded-4 shadow-lg"
        style={{ backgroundColor: "rgba(30,30,30,0.9)", width: 450 }}>

        {finalStatus === "SUCCESS" ? (
          <>
            <CheckCircle size={80} color="#00ff88" className="mb-3" />
            <h2 className="fw-bold text-success mb-2">{message}</h2>
            <p>Đang chuyển về trang quản lý đơn hàng...</p>
          </>
        ) : finalStatus === "CANCEL" ? (
          <>
            <XCircle size={80} color="#ffcc00" className="mb-3" />
            <h2 className="fw-bold text-warning">Giao dịch đã bị hủy</h2>
          </>
        ) : (
          <>
            <XCircle size={80} color="#ff4444" className="mb-3" />
            <h2 className="fw-bold text-danger">{message}</h2>
          </>
        )}

        <button className="btn btn-outline-light mt-3" onClick={() => navigate("/employee")}>
          ← Quay lại ngay
        </button>
      </div>
    </div>
  );
};

export default OnlineResult;
