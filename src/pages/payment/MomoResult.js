import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../../services/api";

const MomoResult = () => {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const orderId = params.get("orderId");
    const requestId = params.get("requestId");
    const resultCode = params.get("resultCode"); // MoMo trả mã kết quả

    if (!orderId) {
      setResult({ success: false, message: "Thiếu thông tin đơn hàng!" });
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await api.get(`/payments/momo/callback?orderId=${orderId}&requestId=${requestId}&resultCode=${resultCode}`);
        setResult({
          success: res.data?.success ?? true,
          message: res.data?.message || "✅ Thanh toán thành công!",
        });
      } catch (error) {
        console.error("❌ Lỗi callback MoMo:", error);
        setResult({
          success: false,
          message: error?.response?.data?.message || "❌ Thanh toán thất bại!",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [params]);

  if (loading)
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-3">Đang xác nhận kết quả thanh toán MoMo...</p>
      </div>
    );

  return (
    <div className="container py-5 text-center">
      <h2 className={`mb-4 ${result.success ? "text-success" : "text-danger"}`}>
        {result.success ? "🎉 Thanh toán thành công!" : "❌ Thanh toán thất bại!"}
      </h2>
      <p className="fs-5">{result.message}</p>
      <div className="mt-4">
        <Link to="/employee" className="btn btn-primary">
          ← Quay lại trang nhân viên
        </Link>
      </div>
    </div>
  );
};

export default MomoResult;
