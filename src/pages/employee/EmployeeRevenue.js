import React, { useEffect, useState } from "react";
import api from "../../services/api";

const EmployeeRevenue = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await api.get("/orders?status=PAID");
      const orders = res.data || [];
      const grouped = {};

      orders.forEach(o => {
        const date = new Date(o.createdAt).toLocaleDateString("vi-VN");
        grouped[date] = (grouped[date] || 0) + o.totalAmount;
      });

      setStats(Object.entries(grouped));
    })();
  }, []);

  return (
    <div className="container py-5">
      <h2 className="text-center text-primary mb-4">📊 Thống kê doanh thu</h2>
      <table className="table table-bordered text-center">
        <thead className="table-dark">
          <tr>
            <th>Ngày</th>
            <th>Doanh thu (₫)</th>
          </tr>
        </thead>
        <tbody>
          {stats.map(([date, total]) => (
            <tr key={date}>
              <td>{date}</td>
              <td>{total.toLocaleString("vi-VN")} ₫</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeRevenue;
