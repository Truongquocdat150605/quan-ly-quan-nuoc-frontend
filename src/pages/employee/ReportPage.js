import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const ReportPage = () => {
  const [report, setReport] = useState(null);
  const [days, setDays] = useState(7);

  const loadReport = async () => {
    try {
      const res = await api.get(`/report/summary?days=${days}`);
      console.log("📊 API Response:", res); // Xem dữ liệu thực tế
      
      // Dùng dữ liệu trực tiếp từ API, không kiểm tra res.data?.success
      setReport(res);
    } catch (e) {
      console.error("Loi tai bao cao:", e);
      alert("Khong tai duoc bao cao!");
    }
  };

  useEffect(() => {
    loadReport();
  }, [days]);

  if (!report) return <p className="text-center py-5">Dang tai bao cao...</p>;

  // Tính toán số đơn đã thanh toán
  const totalPaid = report.totalOrders - report.totalCancelled - report.totalPending;

  return (
    <div className="container py-5">
      <h2 className="text-center text-primary fw-bold mb-4">Bao Cao Doanh Thu</h2>

      {/* Bộ lọc thời gian */}
      <div className="d-flex justify-content-end mb-4">
        <select
          className="form-select w-auto"
          value={days}
          onChange={(e) => setDays(e.target.value)}
        >
          <option value="7">7 ngay gan day</option>
          <option value="30">30 ngay</option>
          <option value="90">3 thang</option>
        </select>
      </div>

      {/* 4 Thẻ thống kê - Sửa theo dữ liệu thực tế */}
      <div className="row text-center mb-4">
        <div className="col-md-3">
          <div className="card p-3 bg-success text-white shadow">
            <h5>Don da thanh toan</h5>
            <p className="fs-3 fw-bold">{totalPaid}</p>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 bg-warning text-dark shadow">
            <h5>Don dang cho</h5>
            <p className="fs-3 fw-bold">{report.totalPending || 0}</p>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 bg-danger text-white shadow">
            <h5>Don bi huy</h5>
            <p className="fs-3 fw-bold">{report.totalCancelled || 0}</p>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card p-3 bg-primary text-white shadow">
            <h5>Doanh thu</h5>
            <p className="fs-3 fw-bold">
              {(report.totalRevenue || 0).toLocaleString("vi-VN")} ₫
            </p>
          </div>
        </div>
      </div>

      {/* Thông tin tổng quan */}
      <div className="card shadow p-4 mt-4">
        <h4 className="fw-bold text-secondary mb-3">Tong quan</h4>
        <p><strong>Tong so don hang:</strong> {report.totalOrders || 0}</p>
        <p><strong>Don da thanh toan:</strong> {totalPaid}</p>
        <p><strong>Don dang cho:</strong> {report.totalPending || 0}</p>
        <p><strong>Don da huy:</strong> {report.totalCancelled || 0}</p>
        <p><strong>Tong doanh thu:</strong> {(report.totalRevenue || 0).toLocaleString("vi-VN")} ₫</p>
        
        {/* Debug section */}
        <details className="mt-3">
          <summary>Du lieu thuc te tu API</summary>
          <pre className="bg-light p-3 mt-2">{JSON.stringify(report, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
};

export default ReportPage;