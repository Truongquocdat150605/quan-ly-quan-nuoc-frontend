import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./layouts/Header";
import Footer from "./layouts/Footer";
import TableSelection from "./pages/customer/TableSelection";
import MenuOrder from "./pages/customer/MenuOrder";
import CustomerOrders from "./pages/customer/CustomerOrders";
import EmployeeOrderDetail from "./pages/employee/EmployeeOrderDetail";
import EmployeeOrders from "./pages/employee/EmployeeOrders";
import EmployeeLogin from "./pages/auth/EmployeeLogin";
import Register from "./pages/auth/Register";
import EmployeeRevenue from "./pages/employee/EmployeeRevenue";
import AdminProducts from "./pages/admin/AdminProducts";
import CategoryManagement from "./pages/admin/CategoryManagement";
import UserManagement from "./pages/admin/UserManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import SettingsManagement from "./pages/admin/SettingsManagement";
import ReportManagement from "./pages/admin/ReportManagement";
import MomoResult from "./pages/payment/MomoResult";
import OnlineResult from "./pages/payment/OnlineResult";
import AdminLayout from "./layouts/AdminLayout";
import RequireAdmin from "./pages/auth/RequireAdmin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PromotionManagement from "./pages/admin/PromotionManagement";
import "./assets/scss/style.scss";
import ReportPage from "./pages/employee/ReportPage";
import HomePage from "./pages/customer/HomePage";
import EmployeeLayout from "./layouts/EmployeeLayout"; // ✅ THÊM CÁI NÀY
import PaymentResult from "./pages/payment/PaymentResult";
import EmployeeMenu from "./pages/employee/EmployeeMenu";
import EmployeeTables from "./pages/employee/EmployeeTables";
// 🔥 Layout cho KHÁCH HÀNG (có Header/Footer đẹp)
const MainLayout = ({ children }) => (
  <div>
    <Header />
    <main>{children}</main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ PUBLIC ROUTES - CHO KHÁCH HÀNG */}
        <Route path="/" element={
          <MainLayout>
            <HomePage />
          </MainLayout>
        } />

        <Route path="/tables" element={
          <MainLayout>
            <TableSelection />
          </MainLayout>
        } />

        <Route path="/order/:tableId" element={
          <MainLayout>
            <MenuOrder />
          </MainLayout>
        } />

        <Route path="/menu" element={
          <MainLayout>
            <MenuOrder />
          </MainLayout>
        } />

        {/* ✅ AUTH ROUTES - KHÔNG LAYOUT */}
        <Route path="/login" element={<EmployeeLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/online-result" element={<OnlineResult />} />
        <Route path="/payment/momo/result" element={<MomoResult />} />
        <Route path="/payment/result" element={<PaymentResult />} />
        {/* ✅ EMPLOYEE ROUTES - LAYOUT RIÊNG */}
        <Route path="/employee" element={
          <EmployeeLayout>
            <EmployeeOrders />
          </EmployeeLayout>
        } />
        <Route path="/employee/menu" element={
          <EmployeeLayout>
            <EmployeeMenu />
          </EmployeeLayout>
        } />
        <Route path="/employee/tables" element={
          <EmployeeLayout>
            <EmployeeTables />
          </EmployeeLayout>
        } />
        <Route path="/employee/orders/:id" element={
          <EmployeeLayout>
            <EmployeeOrderDetail />
          </EmployeeLayout>
        } />

        <Route path="/employee/revenue" element={
          <EmployeeLayout>
            <EmployeeRevenue />
          </EmployeeLayout>
        } />

        <Route path="/employee/report" element={
          <EmployeeLayout>
            <ReportPage />
          </EmployeeLayout>
        } />
        <Route path="/customer/orders" element={
          <MainLayout>
            <CustomerOrders />
          </MainLayout>
        } />

        {/* ✅ ADMIN ROUTES - LAYOUT RIÊNG */}
        <Route
          path="/admin/*"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<CategoryManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="reports" element={<ReportManagement />} />
          <Route path="settings" element={<SettingsManagement />} />
          <Route path="promotions" element={<PromotionManagement />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;