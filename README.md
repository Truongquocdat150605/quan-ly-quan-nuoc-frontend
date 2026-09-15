# Coffee Shop Management System - Frontend Web App

[![React](https://img.shields.io/badge/React-18.2-blue.svg?style=flat&logo=react)](https://react.dev/)
[![Material-UI](https://img.shields.io/badge/MUI-7.x-007FFF.svg?style=flat&logo=mui)](https://mui.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3.svg?style=flat&logo=bootstrap)](https://getbootstrap.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Modern, interactive React 18 web application for the Coffee Shop & Cafe Management System. Features dedicated portals for Customers (online menu ordering & table booking), Employees/Staff (table POS ordering & bill generation), and Admins (drink catalog, inventory, order processing, and revenue reporting).

---

## 🔗 Repository Navigation
- ⚙️ **Backend Repository:** [github.com/dattruongquoc78-cloud/javaa](https://github.com/dattruongquoc78-cloud/javaa)
- 🚀 **Live Demo:** [TODO: Add Live Demo URL if Deployed]

---

## ✨ Key Features

- **Multi-Role User Experience:**
  - **Customer Portal:** Browse coffee/beverage menu by category, select tables, place digital orders, and track order progress.
  - **Employee POS Portal:** Quick table selection, fast order entry for walk-in customers, instant bill printing, and daily shift revenue summary.
  - **Admin Dashboard:** Comprehensive product & category management, real-time order monitoring, promotion code management, and revenue analytics.
- **Interactive POS Ordering:**
  - Table selection grid displaying real-time occupancy status.
  - Dynamic cart item customization (drink size, sugar/ice options, quantity).
- **Invoice & Bill Generation:**
  - Export and download customer invoices in PDF format powered by **jsPDF & jsPDF-AutoTable**.
- **Real-Time Communication:**
  - Live order updates synced with backend via **WebSocket (SockJS & StompJS)**.
- **Online Checkout:**
  - Integrated PayOS QR payment and Stripe card checkout workflows.

---

## 🛠 Tech Stack

| Component | Technology |
| :--- | :--- |
| **Framework** | React 18.2 |
| **UI Components & Styling** | Material-UI (MUI v7), Bootstrap 5.3, Emotion, FontAwesome, Lucide-React |
| **HTTP Client** | Axios 1.13 |
| **State & Navigation** | React Router DOM v6 |
| **Real-Time Messaging** | `@stomp/stompjs` 7.2, `sockjs-client` 1.6 |
| **PDF Export** | jsPDF 3.0, jsPDF-AutoTable 5.0 |
| **Toast & UI Feedback** | React-Toastify 11.0, Framer Motion 12.23 |
| **Build & Scripts** | `react-scripts` 5.0.1 (Create React App) |

---

## 📋 Prerequisites

Ensure you have installed:
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)

---

## ⚙️ Environment Variables

Create a `.env` file in the `frontend/frontend` root directory:

```env
# Backend API Base URL
REACT_APP_API_BASE_URL=http://localhost:8081/api
```

---

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [TODO: Your Frontend GitHub Repo URL]
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```
   The application will open automatically at `http://localhost:3000`.

4. **Build for Production:**
   ```bash
   npm run build
   ```

---

## 📂 Folder Structure

```
frontend/
├── public/                  # Favicon, index.html, static assets
├── src/
│   ├── assets/              # Custom CSS, JS libraries, images
│   ├── components/          # Reusable UI components
│   ├── layouts/             # Admin, Employee, Customer layouts & navigation headers
│   ├── pages/
│   │   ├── admin/           # AdminDashboard, AdminProducts, CategoryManagement, OrderManagement, ReportManagement
│   │   ├── auth/            # EmployeeLogin, Register, RequireAdmin
│   │   ├── customer/        # HomePage, MenuOrder, TableSelection, CustomerOrders
│   │   └── employee/        # EmployeeMenu, EmployeeOrders, EmployeeRevenue, EmployeeTables
│   ├── services/            # Axios API service instance (api.js)
│   ├── App.js               # Route configuration
│   └── index.js             # React entry point
├── .env.example
├── package.json
└── README.md
```

---

## 🖼 Screenshots / Demo

[TODO: Add Customer Menu & Employee POS Screenshots Here]

---

## 👤 Author & Contact

**Truong Quoc Dat**  
- **Email:** hungma668@gmail.com  
- **GitHub:** [github.com/dattruongquoc78-cloud](https://github.com/dattruongquoc78-cloud)  
- **Role:** Full-Stack Java Developer
