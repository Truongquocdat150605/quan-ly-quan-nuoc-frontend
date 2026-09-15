import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { setAuthToken } from "../../services/api";

const EmployeeLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", form);

      if (res.success && res.data?.token) {
        const { token, username, email, roles } = res.data;

        // ✅ Lưu token & user vào localStorage
        setAuthToken(token);
        localStorage.setItem(
          "user",
          JSON.stringify({ username, email, roles })
        );

        // ✅ Điều hướng theo role - SỬA Ở ĐÂY
        if (roles.includes("EMPLOYEE")) {
          navigate("/employee");
        } else if (roles.includes("ADMIN")) {
          navigate("/admin");
        } else {
          navigate("/tables");
        }
      } else {
        setError("❌ Sai tài khoản hoặc mật khẩu.");
      }
    } catch (err) {
      console.error("❌ Lỗi đăng nhập:", err);
      setError("Không thể đăng nhập. Kiểm tra lại thông tin!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4">
              <h3 className="text-center mb-4 text-primary">
                👨‍🍳 Đăng Nhập Nhân Viên
              </h3>

              {error && (
                <div className="alert alert-danger text-center">{error}</div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Tên đăng nhập:</label>
                  <input
                    type="text"
                    name="username"
                    className="form-control"
                    placeholder="Nhập username..."
                    value={form.username}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Mật khẩu:</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Nhập mật khẩu..."
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 mt-3"
                  disabled={loading}
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;