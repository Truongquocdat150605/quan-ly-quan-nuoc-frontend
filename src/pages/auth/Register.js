import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    fullName: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("❌ Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/register", {
        username: form.username,
        password: form.password,
        email: form.email,
        fullName: form.fullName,
        phone: form.phone,
      });

      if (res.success) {
        setSuccess("✅ Đăng ký thành công! Vui lòng đăng nhập.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(res.message || "Đăng ký thất bại!");
      }
    } catch (err) {
      console.error("❌ Lỗi đăng ký:", err);
      setError("Không thể đăng ký. Kiểm tra lại thông tin!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow-lg">
            <div className="card-body p-4">
              <h3 className="text-center mb-4 text-primary fw-bold">
                🧾 Đăng Ký Tài Khoản
              </h3>

              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Tên đăng nhập</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="form-control"
                    required
                    placeholder="Nhập username..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Mật khẩu</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="form-control"
                    required
                    placeholder="Nhập mật khẩu..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="form-control"
                    required
                    placeholder="Nhập lại mật khẩu..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Họ và tên</label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="form-control"
                    required
                    placeholder="Nguyễn Văn A..."
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="form-control"
                    required
                    placeholder="example@gmail.com"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Số điện thoại</label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="09xxxxxxxx"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? "Đang xử lý..." : "Đăng ký"}
                </button>
              </form>

              <div className="text-center mt-3">
                <p>
                  Đã có tài khoản?{" "}
                  <a href="/login" className="text-decoration-none">
                    Đăng nhập ngay
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;