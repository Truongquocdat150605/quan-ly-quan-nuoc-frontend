import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function PaymentResult() {
  const [params] = useSearchParams();

  useEffect(() => {
    const resultCode = params.get("resultCode");
    if (resultCode === "0") {
      alert("🎉 Thanh toán MoMo thành công!");
    } else {
      alert("❌ Thanh toán thất bại hoặc bị hủy!");
    }
  }, []);

  return (
    <div style={{ textAlign:"center", marginTop:"50px" }}>
      <h2>⏳ Đang xử lý thanh toán...</h2>
      <p>Vui lòng chờ xác thực hệ thống.</p>
    </div>
  );
}
