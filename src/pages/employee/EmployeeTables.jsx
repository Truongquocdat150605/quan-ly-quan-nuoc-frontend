import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const EmployeeTables = () => {
  const [tables, setTables] = useState([]);

  const load = async () => {
    const res = await api.get("/tables");
    setTables(res.data || []);
  };

  useEffect(() => {
    load();

    const socket = new SockJS("http://localhost:8081/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe("/topic/tables/status", (msg) => {
          const updated = JSON.parse(msg.body);
          setTables((prev) =>
            prev.map((t) => (t.id === updated.id ? updated : t))
          );
        });
      },
    });

    client.activate();
    return () => client.deactivate();
  }, []);

  return (
    <div className="container py-4">
      <h3 className="fw-bold text-primary">🪑 Trạng Thái Bàn (Nhân viên)</h3>

      <div className="row mt-3">
        {tables.map((t) => (
          <div className="col-md-3 mb-3" key={t.id}>
            <div
              className="card text-center shadow-sm"
              style={{
                background:
                  t.status === "FREE"
                    ? "#d4edda"
                    : t.status === "OCCUPIED"
                    ? "#fff3cd"
                    : "#f8d7da",
              }}
            >
              <div className="card-body">
                <h5>{t.name}</h5>
                <p>{t.capacity} người</p>
                <span className="badge bg-dark">{t.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeTables;
