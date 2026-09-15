import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import "../../assets/scss/TableSelection.scss";

const TableSelection = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 Lấy danh sách bàn từ API
  const loadTables = async () => {
    try {
      const res = await api.get("/tables");
      let tablesData = [];

      if (Array.isArray(res.data)) tablesData = res.data;
      else if (res.data?.data && Array.isArray(res.data.data))
        tablesData = res.data.data;

      setTables(tablesData);
    } catch (error) {
      console.error("❌ Lỗi tải bàn:", error);
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Gọi API ban đầu
  useEffect(() => {
    loadTables();
  }, []);

  // 🔹 Lắng nghe WebSocket realtime (nếu có)
  useEffect(() => {
    const socket = new SockJS("http://localhost:8081/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ WebSocket kết nối thành công (TableSelection)");
        client.subscribe("/topic/tables/status", (message) => {
          const updatedTable = JSON.parse(message.body);
          setTables((prev) =>
            prev.map((t) => (t.id === updatedTable.id ? updatedTable : t))
          );
        });
      },
    });

    client.activate();
    return () => client.deactivate();
  }, []);

  // 🪑 Khi khách chọn bàn
  const handleSelectTable = (table) => {
    if (table.status !== "FREE") {
      alert("⚠️ Bàn này đang được sử dụng hoặc đã được đặt trước!");
      return;
    }

    setSelectedTable(table);
    alert(`✅ Đã chọn ${table.name}, bắt đầu gọi món!`);
    navigate(`/order/${table.id}`);
  };

  if (loading) {
    return (
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2">Đang tải danh sách bàn...</p>
      </div>
    );
  }

  return (
    <section className="ftco-section">
      <div className="container">
        <div className="row justify-content-center mb-5">
          <div className="col-md-7 text-center">
            <h2>Chọn bàn của bạn</h2>
            <p>Vui lòng chọn bàn trống để bắt đầu đặt món</p>
          </div>
        </div>

        {tables.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-chair fa-3x text-muted mb-3"></i>
            <h4>Hiện không có bàn nào</h4>
            <button
              className="btn btn-outline-secondary mt-3"
              onClick={loadTables}
            >
              <i className="fas fa-redo me-2"></i> Tải lại
            </button>
          </div>
        ) : (
          <div className="row">
            {tables.map((table) => (
              <div key={table.id} className="col-md-4 mb-4">
                <div
                  className={`card table-card h-100 text-center shadow-sm ${
                    selectedTable?.id === table.id ? "selected" : ""
                  }`}
                  onClick={() => handleSelectTable(table)}
                  style={{
                    cursor: "pointer",
                    border:
                      selectedTable?.id === table.id
                        ? "3px solid #007bff"
                        : "1px solid #dee2e6",
                    backgroundColor:
                      table.status === "FREE"
                        ? "#d4edda"
                        : table.status === "OCCUPIED"
                        ? "#fff3cd"
                        : "#f8d7da",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div className="card-body">
                    <i className="fas fa-chair fa-2x mb-3 text-primary"></i>
                    <h5 className="card-title">{table.name}</h5>
                    <p className="text-muted small">
                      Sức chứa: {table.capacity} người
                    </p>
                    <span
                      className={`badge ${
                        table.status === "FREE"
                          ? "bg-success"
                          : table.status === "OCCUPIED"
                          ? "bg-warning text-dark"
                          : "bg-danger"
                      }`}
                    >
                      {table.status === "FREE"
                        ? "Trống"
                        : table.status === "OCCUPIED"
                        ? "Đang dùng"
                        : "Đã đặt trước"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TableSelection;
