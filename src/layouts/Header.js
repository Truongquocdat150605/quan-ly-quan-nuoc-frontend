import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// XÓA: import { useCart } from "../context/CartContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  // XÓA: const { state } = useCart();
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // ✅ Lấy role user từ localStorage khi load trang
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.roles) {
      if (storedUser.roles.includes("ADMIN")) setUserRole("ADMIN");
      else if (storedUser.roles.includes("EMPLOYEE")) setUserRole("EMPLOYEE");
      else setUserRole("USER");
    } else {
      setUserRole(null);
    }
  }, []);

  // XÓA PHẦN GIỎ HÀNG (vì bạn đã xóa trang giỏ hàng)
  // const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  // const currentTableId = state.items.length > 0 ? state.items[0].tableId : null;
  // const cartLink = currentTableId ? `/cart/${currentTableId}` : "/tables";

  // Ẩn hình nền ở login/register
  const hideBg =
    location.pathname.includes("/login") ||
    location.pathname.includes("/register");

  return (
    <>
      <nav
        className="navbar navbar-expand-lg navbar-dark bg-dark position-relative"
        style={{
          zIndex: 999,
          backgroundImage: hideBg
            ? "none"
            : `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${require("../assets/images/bg_1.jpg")})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="container py-2">
          <Link
            className="navbar-brand fw-bold text-uppercase text-warning"
            to="/"
          >
            <i className="fas fa-mug-hot me-2 text-warning"></i> Cà Phê
            <small className="text-light"> Cửa Hàng</small>
          </Link>

          <button className="navbar-toggler" type="button" onClick={toggleMenu}>
            <span className="navbar-toggler-icon"></span>
          </button>

          <div
            className={`collapse navbar-collapse ${
              isMenuOpen ? "show" : ""
            }`}
            id="navbarNav"
          >
            <ul className="navbar-nav ms-auto align-items-lg-center">
              <li className="nav-item">
                <Link to="/tables" className="nav-link">
                  Đặt Bàn & Order
                </Link>
                <Link to="/tables" className="nav-link">
                  Theo dõi Đơn Hàng
                </Link>
              </li>

              
              

              {/* Hiển thị nút đăng nhập / đăng ký nếu chưa login */}
              {!userRole && (
                <>
                  <li className="nav-item">
                    <Link to="/login" className="nav-link text-info fw-bold">
                      <i className="fas fa-sign-in-alt me-1"></i> Đăng Nhập
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/register" className="nav-link text-success fw-bold">
                      <i className="fas fa-user-plus me-1"></i> Đăng Ký
                    </Link>
                  </li>
                </>
              )}

              {/* 👤 Nếu user đã login, hiển thị nút đăng xuất */}
              {userRole && (
                <li className="nav-item">
                  <button
                    onClick={() => {
                      localStorage.removeItem("user");
                      window.location.reload();
                    }}
                    className="btn btn-sm btn-outline-light ms-2"
                  >
                    <i className="fas fa-sign-out-alt me-1"></i> Đăng Xuất
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      <style>
        {`
          .navbar {
            background-color: #222 !important;
            background-blend-mode: multiply;
          }
          .navbar-nav .nav-link {
            font-weight: 500;
            transition: all 0.3s ease;
          }
          .navbar-nav .nav-link:hover {
            color: #ffc107 !important;
          }
        `}
      </style>
    </>
  );
};

export default Header;