import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const EmployeeHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        
        {/* Title / Logo */}
        <Link to="/employee" style={styles.title}>
          ☕ Khu vực nhân viên
        </Link>

        {/* MENU DROPDOWN */}
        <div style={styles.dropdown}>
          <button style={styles.menuButton}>
            <i className="fas fa-bars" style={{ marginRight: 6 }}></i> Menu
          </button>

          <div style={styles.menuList}>
            <MenuItem to="/employee" text="📦 Đơn hàng" active={location.pathname === '/employee'} />
            <MenuItem to="/employee/menu" text="🍽 Sản phẩm" active={location.pathname.includes('/menu')} />
            <MenuItem to="/employee/tables" text="🪑 Bàn" active={location.pathname.includes('/tables')} />
            <MenuItem to="/employee/revenue" text="📊 Doanh thu" active={location.pathname.includes('/revenue')} />
            <MenuItem to="/employee/report" text="📄 Báo cáo" active={location.pathname.includes('/report')} />
          </div>
        </div>

        {/* Logout */}
        <button style={styles.logoutBtn} onClick={handleLogout}>
          <i className="fas fa-sign-out-alt me-2"></i> Thoát
        </button>
      </div>
    </nav>
  );
};

const MenuItem = ({ to, text, active }) => (
  <Link
    to={to}
    style={{
      ...styles.menuItem,
      ...(active ? styles.menuItemActive : {}),
    }}
  >
    {text}
  </Link>
);



// 🎨 CSS Styles trong JS
const styles = {
  navbar: {
    backgroundColor: "#3c2f2f", // nâu cà phê đậm
    padding: "12px 0",
    fontFamily: "Segoe UI, sans-serif",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  container: {
    width: "90%",
    margin: "auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#f7e6c4",
    textDecoration: "none",
  },
  dropdown: {
    position: "relative",
  },
  menuButton: {
    background: "#6f4e37",
    border: "none",
    color: "white",
    padding: "8px 14px",
    fontSize: "15px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: ".2s",
  },
  menuList: {
    position: "absolute",
    top: "42px",
    right: 0,
    background: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    display: "none",
    flexDirection: "column",
    minWidth: "180px",
    overflow: "hidden",
  },
  logoutBtn: {
    background: "#aa3e3e",
    border: "none",
    padding: "8px 14px",
    fontSize: "14px",
    color: "white",
    cursor: "pointer",
    borderRadius: "6px",
    transition: ".2s",
  },
  menuItem: {
    padding: "12px",
    textDecoration: "none",
    fontSize: "15px",
    color: "#333",
    borderBottom: "1px solid #eee",
    display: "block",
    transition: ".2s",
  },
  menuItemActive: {
    background: "#f5dbb5",
    fontWeight: "bold",
    color: "#6f4e37",
  },
};


// 👉 Hover rule - JS cannot handle, so add here:
document.addEventListener("mouseover", (e) => {
  const dropdown = document.querySelector("nav div[style*='relative']");
  if (!dropdown) return;
  const menu = dropdown.querySelector("div");
  if (dropdown.contains(e.target)) {
    menu.style.display = "flex";
  } else {
    menu.style.display = "none";
  }
});

export default EmployeeHeader;
